// CHECK: home-button
// The Home button from Devices, Share out and Getting a grip.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const on=async()=>(await p.locator('nav.tabs button.on').textContent());
await p.goto(B);await p.waitForTimeout(300);
await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=link]');await p.click('[data-act=home]');await p.waitForTimeout(200);console.log('from Sharing:',await on());
await p.click('nav.tabs >> text=2 · Share out');await p.click('[data-act=home]');await p.waitForTimeout(200);console.log('from Share out:',await on());
await p.click('nav.tabs >> text=3 · Getting a grip');await p.waitForTimeout(900);await p.screenshot({path:'home_myday.png'});
await p.getByRole('button',{name:'Big',exact:true}).last().click();await p.waitForTimeout(200);
await p.getByRole('link',{name:/Home/}).click();await p.waitForTimeout(600);console.log('from My day Big:',p.url().replace(B,'')||'(start)',await on());
await p.screenshot({path:'home_plan.png'});
console.log('errors',errs);await b.close();})();
