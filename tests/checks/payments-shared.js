// CHECK: payments-shared
// The regular-payments list shared between two phones, a job added on one, given to the other, ticked and repeating monthly.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/recurring.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
require('../lib/owner-named')(require('playwright').chromium);
const B='http://localhost:8765/get-a-grip-household/';
const store={};
async function mock(ctx){await ctx.route('https://household-store.dmhmca-apps.workers.dev/**',async r=>{
  const code=new URL(r.request().url()).pathname.split('/').pop(),m=r.request().method();const H={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(m==='GET'){const s=store[code];return r.fulfill(s?{status:200,headers:H,body:JSON.stringify(s)}:{status:404,headers:H,body:'{}'});}
  if(m==='PUT'){const b=JSON.parse(r.request().postData());const cur=store[code]||{v:0};if(b.base!==cur.v)return r.fulfill({status:409,headers:H,body:JSON.stringify(cur)});store[code]={v:cur.v+1,doc:b.doc};return r.fulfill({status:200,headers:H,body:JSON.stringify({v:cur.v+1})});}
  return r.fulfill({status:204,headers:H});});}
(async()=>{const b=await chromium.launch();const errs=[];
const cL=await b.newContext({viewport:{width:390,height:844}}),cJ=await b.newContext({viewport:{width:390,height:844}});await mock(cL);await mock(cJ);
const L=await cL.newPage(),J=await cJ.newPage();[L,J].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());});
await L.goto(B+'?home=1');await L.waitForTimeout(400);await L.click('[data-act=more]');await L.click('[data-act=stab][data-v=link]');await L.click('[data-act=start]');await L.waitForTimeout(1200);
const code=await L.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')).code);
await L.click('[data-act=home]');await L.click('[data-act=stage][data-k=pay]');await L.setInputFiles('#tfile',process.argv[2]);await L.waitForTimeout(2500);
await J.goto(B+'?home=1');await J.waitForTimeout(300);await J.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.me=1;l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});await J.reload();await J.waitForTimeout(300);await J.click('[data-act=more]');await J.click('[data-act=stab][data-v=link]');await J.fill('#jc',code);await J.click('[data-act=join]');await J.waitForTimeout(1500);
await J.click('[data-act=home]');await J.click('[data-act=stage][data-k=pay]');await J.waitForTimeout(300);
console.log('Josh sees triage rows:',await J.locator('.trow').count());
await J.locator('.trow',{hasText:'TV licence'}).locator('[data-act=tadd]').click();await J.waitForTimeout(2500);
// give it to Lauren on Share out from Josh's device
await J.click('[data-act=stage][data-k=share]');await J.locator('article.card',{hasText:'Pay TV licence'}).locator('[aria-label="Give to Lauren"]').click();await J.waitForTimeout(2500);
await L.goto(B+'?home=1');await L.waitForTimeout(2000);await L.click('[data-act=home]');await L.click('[data-act=stage][data-k=pay]');
console.log('Lauren sees TV licence as added:',(await L.locator('details').last().textContent()).includes('TV licence'));
await L.goto(B+'tasks.html');await L.waitForTimeout(2000);
console.log('Lauren My day job:',await L.evaluate(()=>{var t=GAGH.S.tasks.find(x=>x.text==='Pay TV licence');return t&&(t.due+' '+t.rep+' '+t.activityId);}));
await L.getByRole('button',{name:'Small',exact:true}).last().click();await L.waitForTimeout(300);
await L.locator('.list').getByText('Pay TV licence',{exact:true}).click();await L.waitForTimeout(300);
console.log('phone repeat select shows:',await L.locator('select[aria-label=Repeats] option:checked').textContent());
await L.selectOption('select[aria-label=Repeats]','month');await L.waitForTimeout(200);await L.getByRole('button',{name:'Save',exact:true}).click();await L.waitForTimeout(500);
await L.evaluate(()=>{var t=GAGH.S.tasks.find(x=>x.text==='Pay TV licence');t.done=GAGH.iso();t.updated=GAGH.iso();GAGH.commit();});await L.waitForTimeout(3000);
const d=store[code].doc;console.log('after tick, copies in store:',d.tasks.filter(t=>t.text==='Pay TV licence').map(t=>(t.done?'done ':'open ')+t.due+' '+t.rep).join(', '));
console.log('triage kept in store:',(d.triage||[]).length);
console.log('errors',errs);await b.close();})();
