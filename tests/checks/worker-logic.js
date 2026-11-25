// CHECK: worker-logic
// The Cloudflare Worker's reminder logic against a pretend database: who gets which reminder, nothing sent twice in a day,
// done jobs and far-off dates skipped, only real push services accepted, and the push signature verifies.
// This one asserts (exit code 1 on any failure) and needs no browser.
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');

(async () => {
  const tmp = path.join(os.tmpdir(), 'gagh-worker-' + process.pid + '.mjs');
  fs.copyFileSync(path.join(__dirname, '..', '..', 'worker', 'worker.js'), tmp);
  const W = await import(tmp);
  const worker = W.default, daily = W.daily, londonDate = W.londonDate;
  fs.unlinkSync(tmp);

  const kv = new Map();
  const KV = {
    async get(k, t) { const v = kv.get(k); return v == null ? null : t === 'json' ? JSON.parse(v) : v; },
    async put(k, v) { kv.set(k, v); },
    async delete(k) { kv.delete(k); },
    async list({ prefix }) { return { keys: [...kv.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; }
  };
  const pair = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = pair.privateKey.export({ format: 'jwk' });
  const env = { HOUSEHOLD: KV, VAPID_PRIVATE: JSON.stringify({ kty: 'EC', crv: 'P-256', d: jwk.d, x: jwk.x, y: jwk.y }) };

  const pushes = [];
  globalThis.fetch = async (u, o) => { pushes.push({ u, o }); return new Response(null, { status: 201 }); };

  const failures = [];
  const check = (what, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) failures.push(what); };
  const add = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const today = londonDate(new Date());
  const code = 'ABCDEFGH2345';
  kv.set('h:' + code, JSON.stringify({ v: 3, doc: { tasks: [
    { id: 'a', text: 'Renew the car insurance', to: 0, due: add(today, 7) },
    { id: 'b', text: 'Book the MOT', to: 1, due: add(today, 1) },
    { id: 'c', text: 'Pay car tax', to: 0, due: add(today, 3) },
    { id: 'd', text: 'Done already', to: 0, due: add(today, 1), done: '2026-01-01' },
    { id: 'e', text: 'Step of Josh job', parent: 'b', due: add(today, 7) }], gone: [] } }));
  const call = (p, body) => worker.fetch(new Request('https://x' + p, { method: 'POST', headers: { Origin: 'https://dmhmca.github.io' }, body: JSON.stringify(body) }), env);
  const epL = 'https://fcm.googleapis.com/fcm/send/LAUREN', epJ = 'https://fcm.googleapis.com/fcm/send/JOSH';

  check('a sign-up to a host that is not a push service is refused', (await call('/sub/' + code, { who: 0, sub: { endpoint: 'https://evil.example/x' } })).status === 400);
  check('both phones can sign up', (await call('/sub/' + code, { who: 0, sub: { endpoint: epL } })).status === 200 && (await call('/sub/' + code, { who: 1, sub: { endpoint: epJ } })).status === 200);
  check('an unknown household cannot sign up', (await call('/sub/ZZZZZZZZZZZZ', { who: 0, sub: { endpoint: epL } })).status === 404);

  await daily(env);
  check('one push to each phone', pushes.map(p => p.u.split('/').pop()).sort().join() === 'JOSH,LAUREN');
  const mL = await (await call('/msg', { endpoint: epL })).json(), mJ = await (await call('/msg', { endpoint: epJ })).json();
  check('Lauren gets the week-ahead reminder for her job only', mL.length === 1 && mL[0].title === 'Coming up in a week' && mL[0].body.includes('Renew the car insurance'));
  check('Josh gets tomorrow\'s job and his job\'s step a week ahead', mJ.length === 2 && mJ.some(m => m.title === 'Due tomorrow' && m.body === 'Book the MOT') && mJ.some(m => m.body.includes('Step of Josh job')));
  check('a message is handed over once, then it is gone', (await (await call('/msg', { endpoint: epL })).json()).length === 0);
  check('nothing for a done job or a date three days away', ![...mL, ...mJ].some(m => m.body.includes('Done already') || m.body.includes('Pay car tax')));
  pushes.length = 0; await daily(env);
  check('a second run the same day sends nothing', pushes.length === 0);

  await call('/test/' + code, { endpoint: epL });
  const auth = pushes[0] && pushes[0].o.headers.Authorization;
  const jwt = auth && auth.match(/vapid t=([^,]+),/);
  let sigOk = false;
  if (jwt) {
    const [h, p, s] = jwt[1].split('.');
    const pub = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y }, format: 'jwk' });
    sigOk = crypto.verify('sha256', Buffer.from(h + '.' + p), { key: pub, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url'));
  }
  check('the push signature verifies', sigOk);
  check('the test reminder text is queued', (await (await call('/msg', { endpoint: epL })).json())[0]?.body === 'Reminders are working on this phone.');

  // personal store (H1.15)
  const pid = 'a'.repeat(64), pcall = (m, body, id) => worker.fetch(new Request('https://x/p/' + (id || pid), { method: m, headers: { Origin: 'https://dmhmca.github.io' }, body: body ? JSON.stringify(body) : undefined }), env);
  check('an unknown personal blob is 404', (await pcall('GET')).status === 404);
  check('a personal blob must look encrypted', (await pcall('PUT', { base: 0, doc: { tasks: [] } })).status === 400);
  check('the first save works', (await (await pcall('PUT', { base: 0, doc: { iv: 'aa', ct: 'bb' } })).json()).v === 1);
  check('a stale save gets 409 with the current copy', (await pcall('PUT', { base: 0, doc: { iv: 'cc', ct: 'dd' } })).status === 409);
  check('it reads back what was saved', (await (await pcall('GET')).json()).doc.ct === 'bb');
  check('a bad id is refused', (await pcall('GET', null, 'xyz')).status === 404);
  console.log(failures.length ? '\n' + failures.length + ' failed' : '\nall passed');
  process.exit(failures.length ? 1 : 0);
})();
