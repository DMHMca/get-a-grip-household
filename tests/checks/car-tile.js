// CHECK: car-tile
// The Car tile walks through its seven parts.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/get-a-grip-household/');await p.waitForTimeout(600);
await p.click('[data-act=stage][data-k=areas]');await p.waitForTimeout(300);
await p.click('[data-act=area][data-k=car]');await p.waitForTimeout(400);
const t=await p.locator('.stage').textContent();
console.log(['Insurance','Tax','MOT','Service','Tyres','Brakes','Coolant level'].map(x=>x+':'+t.includes(x)).join(' '));
await p.locator('.stage').screenshot({path:'car.png'});
await p.click('[data-act=nextpart]');await p.waitForTimeout(300);console.log('after Next:',(await p.locator('.stage').textContent()).includes('road tax'));
console.log('errors',errs);await b.close();})();
