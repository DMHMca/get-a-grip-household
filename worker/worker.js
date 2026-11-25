// Household store: one JSON document per household code, kept in Cloudflare KV, plus phone reminders.
//
// GET  /h/<code>                 -> {v, doc} or 404
// PUT  /h/<code> {base,doc}      -> saves if base matches the stored version, else 409 with the current copy
// POST /sub/<code> {who,sub}     -> this phone wants reminders for person `who` (0 Lauren, 1 Josh)
// POST /unsub/<code> {endpoint}  -> stop reminders on that phone
// POST /test/<code> {endpoint}   -> send that phone a test reminder now
// POST /msg {endpoint}           -> the service worker collects the waiting reminder text (then it is deleted)
// GET/PUT /p/<64 hex>            -> a person's ENCRYPTED personal-task blob {iv,ct}, same version check as /h (H1.15)
//
// REMINDERS. Once a day (cron, see `scheduled`) every household that has a phone signed up is checked. A job that
// is not done and has a due date (`due`, YYYY-MM-DD) gets a reminder 7 days before and 1 day before, sent only to
// the phones of the person the job belongs to (`to`; a step goes with its parent job). The push itself carries no
// text: the text waits in KV under `msg:<hash of endpoint>` and the phone's service worker fetches it from /msg.
// That keeps the code small (no payload encryption). Pushes are signed with VAPID: the public key is VAPID_PUBLIC
// below; the private key is the Worker secret VAPID_PRIVATE (a JWK), never in the repository.
//
// KV keys: p:<hash> encrypted personal blob; h:<code> document; subs:<code> [{who,endpoint,at}]; msg:<hash> [{title,body}]; sent:<code>:<id>:<due>:<n> dedupe.

const ORIGINS = ['https://dmhmca.github.io'];
const VAPID_PUBLIC = 'BIF4lUPSMG6iEYUr3hlgk-zocDazdFyzXfnTCgFRZzJyPhcbwqdD4SEBRVHIGPbxGVOYWaeIQCMeuhh3RWC_wM0';
const VAPID_SUBJECT = 'https://dmhmca.github.io/get-a-grip-household/';
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /\.notify\.windows\.com$/];
const TZ = 'Europe/London';

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const j = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    const path = new URL(req.url).pathname;
    const body = async () => { const t = await req.text(); if (t.length > 20000) throw new Error('big'); return JSON.parse(t); };

    let m = path.match(/^\/h\/([A-Z0-9]{12})$/);
    if (m) {
      const key = 'h:' + m[1];
      const cur = await env.HOUSEHOLD.get(key, 'json');
      if (req.method === 'GET') return cur ? j(cur) : j({ error: 'none' }, 404);
      if (req.method === 'PUT') {
        const text = await req.text();
        if (text.length > 400000) return j({ error: 'too big' }, 413);
        let b; try { b = JSON.parse(text); } catch (e) { return j({ error: 'bad json' }, 400); }
        if (!b || typeof b.doc !== 'object') return j({ error: 'bad body' }, 400);
        const have = cur ? cur.v : 0;
        if ((b.base || 0) !== have) return j(cur, 409);
        const next = { v: have + 1, doc: b.doc };
        await env.HOUSEHOLD.put(key, JSON.stringify(next));
        return j({ v: next.v });
      }
      return j({ error: 'method' }, 405);
    }
    // PERSONAL STORE (H1.15): one ENCRYPTED blob per person, found by the SHA-256 of their personal code. The browser encrypts
    // (AES-GCM, key derived from the code) before sending, so this Worker only ever holds ciphertext and never learns the code.
    m = path.match(/^\/p\/([0-9a-f]{64})$/);
    if (m) {
      const key = 'p:' + m[1];
      const cur = await env.HOUSEHOLD.get(key, 'json');
      if (req.method === 'GET') return cur ? j(cur) : j({ error: 'none' }, 404);
      if (req.method === 'PUT') {
        const text = await req.text();
        if (text.length > 1500000) return j({ error: 'too big' }, 413);
        let b; try { b = JSON.parse(text); } catch (e) { return j({ error: 'bad json' }, 400); }
        if (!b || !b.doc || typeof b.doc.iv !== 'string' || typeof b.doc.ct !== 'string') return j({ error: 'bad body' }, 400);
        const have = cur ? cur.v : 0;
        if ((b.base || 0) !== have) return j(cur, 409);
        const next = { v: have + 1, doc: { iv: b.doc.iv, ct: b.doc.ct } };
        await env.HOUSEHOLD.put(key, JSON.stringify(next));
        return j({ v: next.v });
      }
      return j({ error: 'method' }, 405);
    }
    if (req.method !== 'POST') return j({ error: 'not found' }, 404);

    if (path === '/msg') {
      let b; try { b = await body(); } catch (e) { return j({ error: 'bad body' }, 400); }
      if (!b || typeof b.endpoint !== 'string') return j([], 200);
      const k = 'msg:' + await hash(b.endpoint);
      const list = (await env.HOUSEHOLD.get(k, 'json')) || [];
      if (list.length) await env.HOUSEHOLD.delete(k);
      return j(list);
    }
    m = path.match(/^\/(sub|unsub|test)\/([A-Z0-9]{12})$/);
    if (!m) return j({ error: 'not found' }, 404);
    const code = m[2], sk = 'subs:' + code;
    let b; try { b = await body(); } catch (e) { return j({ error: 'bad body' }, 400); }
    // only households that exist can sign phones up
    if (!(await env.HOUSEHOLD.get('h:' + code))) return j({ error: 'no household' }, 404);
    let subs = (await env.HOUSEHOLD.get(sk, 'json')) || [];
    if (m[1] === 'sub') {
      const ep = b && b.sub && b.sub.endpoint, who = b && b.who;
      if (!okEndpoint(ep) || (who !== 0 && who !== 1)) return j({ error: 'bad subscription' }, 400);
      subs = subs.filter(s => s.endpoint !== ep).concat([{ who, endpoint: ep, at: new Date().toISOString() }]).slice(-10);
      await env.HOUSEHOLD.put(sk, JSON.stringify(subs));
      return j({ ok: true });
    }
    if (m[1] === 'unsub') {
      subs = subs.filter(s => s.endpoint !== (b && b.endpoint));
      await env.HOUSEHOLD.put(sk, JSON.stringify(subs));
      return j({ ok: true });
    }
    // test
    const s = subs.find(x => x.endpoint === (b && b.endpoint));
    if (!s) return j({ error: 'not signed up' }, 404);
    await queue(env, s.endpoint, { title: 'Get a Grip Household', body: 'Reminders are working on this phone.' });
    const r = await push(env, s.endpoint);
    return j({ ok: r.ok, status: r.status });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(daily(env));
  }
};

async function daily(env) {
  const today = londonDate(new Date());
  let cursor;
  do {
    const page = await env.HOUSEHOLD.list({ prefix: 'subs:', cursor });
    for (const k of page.keys) await household(env, k.name.slice(5), today);
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
}

async function household(env, code, today) {
  const subs = (await env.HOUSEHOLD.get('subs:' + code, 'json')) || [];
  const cur = await env.HOUSEHOLD.get('h:' + code, 'json');
  if (!subs.length || !cur || !cur.doc) return;
  const tasks = cur.doc.tasks || [], byId = {};
  tasks.forEach(t => { byId[t.id] = t; });
  const touched = {};
  for (const t of tasks) {
    if (!t.due || t.done || !/^\d{4}-\d{2}-\d{2}$/.test(t.due)) continue;
    const top = t.parent ? byId[t.parent] : t;
    if (!top || top.nn || (top.to !== 0 && top.to !== 1)) continue;
    const n = daysBetween(today, t.due);
    if (n !== 7 && n !== 1) continue;
    const dk = 'sent:' + code + ':' + t.id + ':' + t.due + ':' + n;
    if (await env.HOUSEHOLD.get(dk)) continue;
    await env.HOUSEHOLD.put(dk, '1', { expirationTtl: 60 * 60 * 24 * 20 });
    const msg = n === 7
      ? { title: 'Coming up in a week', body: t.text + ' (due ' + niceDate(t.due) + ')' }
      : { title: 'Due tomorrow', body: t.text };
    for (const s of subs) if (s.who === top.to) { await queue(env, s.endpoint, msg); touched[s.endpoint] = 1; }
  }
  let keep = subs;
  for (const ep of Object.keys(touched)) {
    const r = await push(env, ep);
    if (r.status === 404 || r.status === 410) keep = keep.filter(s => s.endpoint !== ep);   // phone unsubscribed
  }
  if (keep.length !== subs.length) await env.HOUSEHOLD.put('subs:' + code, JSON.stringify(keep));
}

async function queue(env, endpoint, msg) {
  const k = 'msg:' + await hash(endpoint);
  const list = (await env.HOUSEHOLD.get(k, 'json')) || [];
  list.push(msg);
  await env.HOUSEHOLD.put(k, JSON.stringify(list.slice(-10)), { expirationTtl: 60 * 60 * 24 * 7 });
}

// an empty push, signed with VAPID; the phone then fetches the text from /msg
async function push(env, endpoint) {
  if (!okEndpoint(endpoint)) return { ok: false, status: 400 };
  const jwt = await vapidJwt(env, new URL(endpoint).origin);
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': 'vapid t=' + jwt + ', k=' + VAPID_PUBLIC, 'TTL': '86400', 'Urgency': 'normal', 'Content-Length': '0' } });
    return { ok: r.ok, status: r.status };
  } catch (e) { return { ok: false, status: 0 }; }
}

async function vapidJwt(env, aud) {
  const enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ typ: 'JWT', alg: 'ES256' }) + '.' + enc({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: VAPID_SUBJECT });
  const jwk = JSON.parse(env.VAPID_PRIVATE);
  const key = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', d: jwk.d, x: jwk.x, y: jwk.y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  return unsigned + '.' + b64u(new Uint8Array(sig));
}

function okEndpoint(ep) {
  if (typeof ep !== 'string' || ep.length > 1000) return false;
  let u; try { u = new URL(ep); } catch (e) { return false; }
  return u.protocol === 'https:' && PUSH_HOSTS.some(r => r.test(u.hostname));
}
function b64u(bytes) { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function hash(s) { return b64u(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).slice(0, 32); }
function londonDate(d) { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }
function daysBetween(a, b) { const p = x => { const [y, m, d] = x.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 864e5); }
function niceDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); }

export { daily, household, okEndpoint, daysBetween, niceDate, londonDate, vapidJwt };
