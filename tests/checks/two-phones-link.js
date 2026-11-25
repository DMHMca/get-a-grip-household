// CHECK: two-phones-link
// Two phones linking through a pretend store: jobs, steps and sizes go both ways and a private task never reaches the store.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
require('../lib/owner-named')(require('playwright').chromium);
const B='http://localhost:8765/get-a-grip-household/';
const store={};
async function mock(ctx){await ctx.route('https://household-store.dmhmca-apps.workers.dev/**',async r=>{
  const code=new URL(r.request().url()).pathname.split('/').pop(),m=r.request().method();
  const H={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(m==='GET'){const s=store[code];return r.fulfill(s?{status:200,headers:H,body:JSON.stringify(s)}:{status:404,headers:H,body:'{}'});}
  if(m==='PUT'){const b=JSON.parse(r.request().postData());const cur=store[code]||{v:0};if(b.base!==cur.v)return r.fulfill({status:409,headers:H,body:JSON.stringify(cur)});store[code]={v:cur.v+1,doc:b.doc};return r.fulfill({status:200,headers:H,body:JSON.stringify({v:cur.v+1})});}
  return r.fulfill({status:204,headers:H});});}
(async()=>{const b=await chromium.launch();const errs=[];
const cL=await b.newContext({viewport:{width:390,height:844}}),cJ=await b.newContext({viewport:{width:390,height:844}});await mock(cL);await mock(cJ);
const L=await cL.newPage(),J=await cJ.newPage();[L,J].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
await L.goto(B);await L.waitForTimeout(500);await L.click('[data-act=more]');await L.click('[data-act=stab][data-v=link]');await L.click('[data-act=start]');await L.waitForTimeout(1500);
const code=await L.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')).code);console.log('household started, code made:',!!code);
await L.click('[data-act=home]');await L.fill('#qa','Service the boiler');await L.press('#qa','Enter');await L.waitForTimeout(300);
await L.click('[data-act=stage][data-k=share]');await L.locator('article.card',{hasText:'Service the boiler'}).locator('[aria-label="Give to Josh"]').click();await L.waitForTimeout(2500);
await J.goto(B);await J.waitForTimeout(400);await J.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.me=1;l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});await J.reload();await J.waitForTimeout(300);await J.click('[data-act=more]');await J.click('[data-act=stab][data-v=link]');await J.fill('#jc',code);await J.click('[data-act=join]');await J.waitForTimeout(1500);
await J.goto(B+'tasks.html');await J.waitForTimeout(2000);
console.log('Josh header:',await J.locator('.apphead').textContent());
const has=await J.evaluate(()=>!!GAGH.S.tasks.find(t=>t.text==='Service the boiler'&&t.activityId==='hh'));console.log('Josh sees the job:',has);
await J.evaluate(()=>{var S=GAGH.S,t=S.tasks.find(x=>x.text==='Service the boiler');t.size='big';t.updated=GAGH.iso();S.tasks.push({id:GAGH.uid(),text:'Find the boiler manual',activityId:'hh',parent:t.id,created:GAGH.iso(),done:null,updated:GAGH.iso()});S.tasks.unshift({id:GAGH.uid(),text:'JOSH PRIVATE',activityId:null,created:GAGH.iso(),done:null,updated:GAGH.iso()});GAGH.commit();});
await J.waitForTimeout(3000);
console.log('private reached store?', JSON.stringify(store).includes('JOSH PRIVATE'));
await L.reload();await L.waitForTimeout(2000);await L.click('[data-act=stage][data-k=share]');await L.waitForTimeout(300);
const col=await L.locator('.col[data-to="1"]').textContent();console.log('Lauren sees Josh step:',col.includes('Find the boiler manual'),' big:',col.includes('Big'));
await L.goto(B+'tasks.html');await L.waitForTimeout(1500);console.log('Lauren day has Josh job?',await L.evaluate(()=>!!GAGH.S.tasks.find(t=>t.text==='Service the boiler')));
console.log('errors',errs);await b.close();})();
