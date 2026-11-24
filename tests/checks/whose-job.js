// CHECK: whose-job
// Whose job per item and for all items when bringing payments in; they land in the right Share out columns.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/agreed.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);
console.log('tabs:',(await p.locator('nav.tabs button').allTextContents()).join(' | '));
await p.click('[data-act=stage][data-k=pay]');await p.setInputFiles('#tfile',process.argv[2]);await p.waitForTimeout(300);
await p.click('[data-act=twhoall][data-v="0"]');await p.waitForTimeout(150);
await p.locator('.trow',{hasText:'Pay Car tax'}).locator('[data-act=twho][data-v="1"]').click();await p.waitForTimeout(150);
await p.locator('.trow',{hasText:'Renew Travel insurance'}).locator('[data-act=twho][data-v=""]').click();await p.waitForTimeout(150);
await p.screenshot({path:'who.png',fullPage:true});
await p.click('[data-act=taddall]');await p.waitForTimeout(200);console.log('status:',await p.locator('#st').textContent());
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks.map(t=>t.text+'→'+t.to).join(' | '));console.log(d);
await p.click('nav.tabs >> text=2 · Share out');await p.waitForTimeout(200);
console.log('Lauren column:',(await p.locator('.col[data-to="0"] .ctext').allTextContents()).join(', '),'| Josh:',(await p.locator('.col[data-to="1"] .ctext').allTextContents()).join(', '),'| still to share:',(await p.locator('.col.ideas .ctext').allTextContents()).join(', '));
console.log('errors',errs);await b.close();})();
