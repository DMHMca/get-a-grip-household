// CHECK: opening
// Opening and Home land on Warm up, question 1; #links still open their tabs.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const where=async()=>[(await p.locator('nav.tabs button.on').textContent()),(await p.locator('.steps button.on').textContent().catch(()=>'-')).trim(),(await p.locator('.stage').first().textContent().catch(()=>'')).slice(0,60)].join(' / ');
await p.goto(B);await p.waitForTimeout(300);
await p.click('[data-act=stage][data-k=group]');await p.waitForTimeout(200);
await p.reload();await p.waitForTimeout(400);console.log('after reopening:',await where());
await p.click('[data-act=stage][data-k=areas]');await p.click('[data-act=area][data-k=car]');await p.click('nav.tabs >> text=2 · Share out');await p.click('[data-act=home]');await p.waitForTimeout(200);console.log('after Home:',await where());
await p.goto(B+'#email');await p.waitForTimeout(300);console.log('#email still opens:',(await p.locator('nav.tabs button.on').textContent()));
console.log('errors',errs);await b.close();})();
