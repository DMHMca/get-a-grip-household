// CHECK: device-kind
// Phone and computer layouts: the first-run card, a phone opening on My day with Plan together in its menu, Home, Devices, Household view.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const here=()=>p.url().replace(B,'')||'(planning start)';
const tabs=async()=>(await p.locator('nav.tabs button').allTextContents()).join(' | ');
await p.goto(B);await p.waitForTimeout(600);
console.log('1 first open: card shown:',await p.locator('[data-act=kindfirst]').count(),'| stays on planning:',here(),'| guess marked:',(await p.locator('[data-act=kindfirst].on').textContent()));
await p.screenshot({path:'kind.png'});
await p.click('[data-act=kindfirst][data-v=phone]');await p.waitForTimeout(1200);
console.log('2 chose phone, lands on:',here(),'| header Home link:',await p.getByRole('link',{name:/Home/}).count(),'| name:',(await p.locator('.apphead .brand').allTextContents()).join(','));
console.log('  quiet note:',(await p.locator('text=Nothing shared out yet').count()));
await p.screenshot({path:'phone_day.png'});
await p.locator('.menubtn').click();await p.waitForTimeout(300);
console.log('  menu has Plan together:',await p.locator('text=Plan together').count());
await p.click('text=Plan together');await p.waitForTimeout(900);console.log('3 Plan together opens planning:',here(),'| card gone:',await p.locator('[data-act=kindfirst]').count()===0,'| tab:',await tabs());
await p.click('[data-act=home]');await p.waitForTimeout(1200);console.log('4 Home on a phone goes to:',here());
await p.goto(B);await p.waitForTimeout(1200);console.log('5 reopening the app:',here());
await p.goto(B+'#share');await p.waitForTimeout(600);console.log('6 #share link not redirected:',here());
await p.goto(B+'?home=1');await p.click('nav.tabs >> text=Devices');await p.waitForTimeout(200);
console.log('7 Devices choice:',(await p.locator('[data-act=kindset].on').textContent()));
await p.screenshot({path:'dev_kind.png',fullPage:true});
await p.click('[data-act=kindset][data-v=computer]');await p.waitForTimeout(200);
await p.goto(B);await p.waitForTimeout(800);console.log('8 as a computer, opens on:',here(),'| round:',(await p.locator('.steps button.on').textContent()).trim());
await p.click('[data-act=home]');await p.waitForTimeout(300);console.log('  Home on a computer stays:',here());
// phone + Household view opens planning
await p.click('nav.tabs >> text=Devices');await p.click('[data-act=kindset][data-v=phone]');await p.waitForTimeout(200);
await p.click('[data-act=together]');await p.waitForTimeout(300);await p.fill('#pin1','1357');await p.fill('#pin2','1357');await p.click('[data-act=pinok]');await p.waitForTimeout(300);
await p.goto(B);await p.waitForTimeout(800);console.log('9 phone in Household view opens:',here());
// phone with a job shared out: no quiet note
await p.goto(B+'?home=1');await p.click('[data-act=together]');await p.fill('#pin1','1357');await p.press('#pin1','Enter');await p.waitForTimeout(300);
await p.fill('#qa','Redo the bathroom');await p.press('#qa','Enter');await p.waitForTimeout(150);
await p.click('nav.tabs >> text=2 · Share out');await p.locator('article.card',{hasText:'Redo the bathroom'}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(200);
await p.goto(B);await p.waitForTimeout(1500);console.log('10 job shared out, phone opens:',here(),'| quiet note gone:',(await p.locator('text=Nothing shared out yet').count())===0);
console.log('errors',errs);await b.close();})();
