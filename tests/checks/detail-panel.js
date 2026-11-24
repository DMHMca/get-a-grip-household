// CHECK: detail-panel
// Tapping a job on the wall opens the set-up panel and My day shows the same size, time, details and steps.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
await p.goto(B);await p.waitForTimeout(400);
await p.fill('#qa','Redo the bathroom');await p.press('#qa','Enter');await p.waitForTimeout(200);
await p.locator('.note .ctext',{hasText:'Redo the bathroom'}).click();await p.waitForTimeout(300);
console.log('panel open:',await p.locator('.gpanel').count());
await p.click('.gpanel [data-act=gsize][data-v=big]');
await p.fill('.gpanel input[data-brk]','Choose the tiles');await p.press('.gpanel input[data-brk]','Enter');await p.waitForTimeout(200);
await p.fill('.gpanel input[data-brk]','Book a plumber');await p.press('.gpanel input[data-brk]','Enter');await p.waitForTimeout(200);
await p.click('.gpanel [data-act=gdur][data-v="day"]');await p.click('.gpanel [data-act=gdev][data-v="none"]');
await p.fill('.gpanel textarea','Budget about £4,000');await p.locator('.gpanel textarea').blur();await p.waitForTimeout(200);
await p.click('.gpanel [data-act=gwho][data-v="0"]');await p.waitForTimeout(200);
await p.screenshot({path:'panel.png'});
// open a step
await p.locator('.gpanel .gt',{hasText:'Book a plumber'}).click();await p.waitForTimeout(200);
console.log('step panel:',(await p.locator('.gpanel h3').textContent()));
await p.click('.gpanel [data-act=gdur][data-v="quick"]');await p.click('.gpanel [data-act=gdev][data-v="phone"]');
await p.click('.gpanel [data-act=gclose].on');await p.waitForTimeout(200);
console.log('panel closed:',await p.locator('.gpanel').count()===0);
let d=await doc();const j=d.tasks.find(t=>t.text==='Redo the bathroom'),st=d.tasks.filter(t=>t.parent===j.id);
console.log('job:',j.size,j.dur,j.dev,j.notes,'to',j.to,' steps:',st.map(s=>s.text+'/'+(s.dur||'-')+'/'+(s.dev||'-')).join(', '));
// My day shows the same
await p.click('nav.tabs >> text=3 · My day');await p.waitForTimeout(1000);
console.log('My day sees:',await p.evaluate(()=>{var S=GAGH.S,t=S.tasks.find(x=>x.text==='Redo the bathroom');var k=S.tasks.filter(x=>x.parent===t.id);return t.size+' '+t.dur+' '+t.notes+' | '+k.map(x=>x.text+':'+x.dur+':'+x.dev).join(', ');}));
console.log('errors',errs);await b.close();})();
