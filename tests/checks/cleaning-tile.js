// CHECK: cleaning-tile
// The Cleaning tile has its nine parts and tapped chores land on the wall under Cleaning.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);
await p.click('[data-act=stage][data-k=areas]');await p.waitForTimeout(200);
console.log('tiles:',(await p.locator('[data-act=area]').allTextContents()).map(x=>x.trim()).join(' | '));
await p.click('[data-act=area][data-k=clean]');await p.waitForTimeout(300);
const t=await p.locator('.stage').textContent();console.log('parts:',['Every day','Kitchen','Bathrooms','Bedrooms','Living areas','Floors','Laundry','Bins and recycling','Deep cleans'].every(x=>t.includes(x)));
await p.locator('.stage').screenshot({path:'clean.png'});
await p.locator('[data-act=starter]',{hasText:'Wipe the kitchen surfaces'}).click();await p.waitForTimeout(200);
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks.find(x=>x.text==='Wipe the kitchen surfaces'));
console.log('note area/tag:',d.area,d.tag);
console.log('errors',errs);await b.close();})();
