// CHECK: personal-sync
// H1.15: a person's PERSONAL tasks kept in step between their own devices through the store, encrypted, under a personal code of their own.
// The store is played by the real worker/worker.js with a pretend database, wired in by intercepting the network calls (the sandbox cannot reach the live one).
// Checks: the code is made in Settings, the second device joins by typing it, a task and its steps travel, household jobs never do, the stored
// text is unreadable, a wrong code is refused, deletions travel, and household jobs on a device survive a merge in their place.
const {chromium}=require('playwright');
const fs=require('fs'),os=require('os'),path=require('path');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{
  const tmp=path.join(os.tmpdir(),'gagh-pw-'+process.pid+'.mjs');fs.copyFileSync(path.join(__dirname,'..','..','worker','worker.js'),tmp);
  const W=await import(tmp);fs.unlinkSync(tmp);
  const kv=new Map();const KV={async get(k,t){const v=kv.get(k);return v==null?null:t==='json'?JSON.parse(v):v;},async put(k,v){kv.set(k,v);},async delete(k){kv.delete(k);},async list({prefix}){return {keys:[...kv.keys()].filter(k=>k.startsWith(prefix)).map(name=>({name})),list_complete:true};}};
  const env={HOUSEHOLD:KV};let hits=0;
  const wire=async ctx=>{await ctx.route('https://household-store.dmhmca-apps.workers.dev/**',async route=>{
    const rq=route.request(),origin=rq.headers()['origin']||'';hits++;
    const cors={'access-control-allow-origin':origin,'access-control-allow-methods':'GET,PUT,POST,OPTIONS','access-control-allow-headers':'Content-Type'};
    if(rq.method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
    const r=await W.default.fetch(new Request(rq.url(),{method:rq.method(),headers:{Origin:'https://dmhmca.github.io','Content-Type':'application/json'},body:['GET','HEAD'].includes(rq.method())?undefined:rq.postData()}),env);
    route.fulfill({status:r.status,headers:{...cors,'content-type':'application/json'},body:await r.text()});});};
  const b=await chromium.launch();
  const mk=async(me)=>{const c=await b.newContext({viewport:{width:1280,height:1300}});await wire(c);const p=await c.newPage();p.on('dialog',d=>d.accept());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
    await p.goto(B+'?home=1');await p.waitForTimeout(300);
    await p.evaluate(m=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';l.whoSet=true;l.me=m;localStorage.setItem('household.local.v2',JSON.stringify(l));},me);return p;};
  const A=await mk(0),B2=await mk(0);
  // A: make a personal code in Settings, Link
  await A.goto(B+'#set-link');await A.waitForTimeout(500);
  await A.click('[data-act=pcreate]');await A.waitForTimeout(300);
  const code=await A.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')).pcode);
  console.log('1 code made on device A:',/^[A-Z2-9]{16}$/.test(code),'| shown:',await A.locator('.code').last().textContent());
  // A: personal tasks and a household job on the Getting a grip side
  await A.goto(B+'tasks.html');await A.waitForTimeout(1200);
  await A.evaluate(()=>{const S=GAGH.S,n=GAGH.iso();S.activities.push({id:'act1',name:'Home admin',created:n,updated:n});
    S.tasks.push({id:GAGH.uid(),text:'Renew my passport',activityId:'act1',created:n,updated:n},{id:'pbig',text:'Plan the garden',size:'big',activityId:'act1',created:n,updated:n},{id:'pst',text:'Measure the lawn',parent:'pbig',activityId:'act1',created:n,updated:n},
    {id:'hhjob',text:'Pay the council tax',activityId:'hh:bills',created:n,updated:n});GAGH.commit();});
  await A.waitForTimeout(6000);
  const blob=JSON.parse(kv.get([...kv.keys()].find(k=>k.startsWith('p:'))));
  console.log('2 the store holds only scrambled data:',typeof blob.doc.ct==='string'&&!/passport|garden|council/i.test(JSON.stringify(blob)),'| version',blob.v);
  // B: join by typing the code, then open Getting a grip
  await B2.goto(B+'#set-link');await B2.waitForTimeout(400);
  await B2.fill('#pjoin',code.replace(/(.{4})(?=.)/g,'$1-').toLowerCase());await B2.click('[data-act=pjoinok]');await B2.waitForTimeout(300);
  await B2.goto(B+'tasks.html');await B2.waitForTimeout(6000);
  const bs=await B2.evaluate(()=>GAGH.S.tasks.map(t=>t.text+(t.parent?' (step)':'')+'@'+t.activityId));
  console.log('3 device B received the personal tasks:',bs.includes('Renew my passport@act1'),bs.includes('Measure the lawn (step)@act1'),'| activity:',await B2.evaluate(()=>GAGH.S.activities.map(a=>a.name).join(',')));
  console.log('4 the household job did NOT travel:',!bs.some(x=>/council/.test(x)));
  // B changes something, A sees it
  await B2.evaluate(()=>{const t=GAGH.S.tasks.find(x=>x.text==='Renew my passport');t.done=GAGH.iso();t.updated=GAGH.iso();GAGH.S.tasks.push({id:GAGH.uid(),text:'Book the dentist',activityId:'act1',created:GAGH.iso(),updated:GAGH.iso()});GAGH.commit();});
  await B2.waitForTimeout(5000);
  await A.reload();await A.waitForTimeout(6000);
  const as=await A.evaluate(()=>GAGH.S.tasks.map(t=>t.text+(t.done?' ✓':'')));
  console.log('5 device A sees B\'s changes:',as.includes('Renew my passport ✓'),as.includes('Book the dentist'),'| its household job survived the merge:',as.includes('Pay the council tax'));
  // delete on A travels
  await A.evaluate(()=>{const S=GAGH.S,t=S.tasks.find(x=>x.text==='Book the dentist');S.tasks=S.tasks.filter(x=>x!==t);S.gone.push({id:t.id,at:GAGH.iso()});GAGH.commit();});
  await A.waitForTimeout(5000);await B2.reload();await B2.waitForTimeout(6000);
  console.log('6 a deletion travelled:',!(await B2.evaluate(()=>GAGH.S.tasks.map(t=>t.text))).includes('Book the dentist'));
  // wrong code
  const C=await mk(0);await C.goto(B+'#set-link');await C.waitForTimeout(400);
  await C.fill('#pjoin','AAAA-BBBB-CCCC-DDDD');await C.click('[data-act=pjoinok]');await C.waitForTimeout(300);
  await C.goto(B+'tasks.html');await C.waitForTimeout(5000);
  const st=await C.evaluate(()=>JSON.parse(localStorage.getItem('household.pstat.v1')||'{}'));
  console.log('7 a wrong code is refused, with a message:',!!st.err,'|',st.err,'| tasks stayed local only:',(await C.evaluate(()=>GAGH.S.tasks.length))===0);
  // codes of the wrong shape and the household code are turned away
  await C.goto(B+'#set-link');await C.waitForTimeout(400);await C.click('[data-act=poff]');await C.waitForTimeout(200);await C.fill('#pjoin','abc');await C.click('[data-act=pjoinok]');await C.waitForTimeout(200);
  console.log('8 a short code is turned away:',(await C.locator('.gnote').allTextContents()).some(x=>/16 letters/.test(x)));
  console.log('errors',[...A.errs,...B2.errs,...C.errs]);await b.close();})();
