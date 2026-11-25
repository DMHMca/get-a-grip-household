// CHECK: round-4-payments
// Regular payments is round 4 of Brainstorm; the top bar; Next goes to round 5; old links open round 4.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/agreed.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);
console.log('tabs:',(await p.locator('.steps button').allTextContents()).join(' | '));
console.log('rounds:',(await p.locator('.steps button').allTextContents()).map(x=>x.trim()).join(' | '));
await p.click('[data-act=stage][data-k=year]');await p.waitForTimeout(200);
const nx=await p.locator('.stage button',{hasText:/Next|round/}).allTextContents();console.log('year round buttons:',nx.join(' | '));
await p.click('[data-act=stage][data-k=pay]');await p.waitForTimeout(200);
console.log('round 4 shows payments:',(await p.locator('.paywrap h2').textContent()));
await p.setInputFiles('#tfile',process.argv[2]);await p.waitForTimeout(300);console.log('import:',await p.locator('#st').textContent());
await p.screenshot({path:'round4.png'});
await p.click('.paywrap [data-act=stage][data-k=group]');await p.waitForTimeout(200);console.log('next goes to:',(await p.locator('.steps button.on').textContent()).trim());
await p.goto(B+'#payments');await p.reload();await p.waitForTimeout(300);console.log('#payments opens:',(await p.locator('.steps button.on').textContent()).trim());
await p.goto(B);await p.reload();await p.waitForTimeout(300);console.log('plain open:',(await p.locator('.steps button.on').textContent()).trim());
console.log('errors',errs);await b.close();})();
