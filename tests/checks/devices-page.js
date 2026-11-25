// CHECK: devices-page
// The Devices page before and after creating a household code.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:1000}});await c.addInitScript(()=>{Object.defineProperty(Notification,'permission',{get:()=>'default'});});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=link]');await p.waitForTimeout(200);
await p.locator('.day').screenshot({path:'dev1.png'});
await p.click('[data-act=start]');await p.waitForTimeout(1500);
await p.locator('.day').screenshot({path:'dev2.png'});
console.log((await p.locator('.day').textContent()).replace(/\s+/g,' ').slice(0,600));
console.log('errors',errs.filter(e=>!/fetch/i.test(e)));await b.close();})();
