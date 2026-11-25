// CHECK: device-kind
// Phone and computer layouts: the first-run card, a phone opening on Getting a grip with Planning in its menu, Home, Devices, Household view.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const here=()=>p.url().replace(B,'')||'(planning start)';
const tabs=async()=>(await p.locator('.steps button').allTextContents()).join(' | ');
await p.goto(B);await p.waitForTimeout(600);
console.log('1 first open: card shown:',await p.locator('[data-act=kindfirst]').count(),'| stays on planning:',here());
await p.screenshot({path:'kind.png'});
await p.click('[data-act=kindfirst][data-v=phone]');await p.waitForTimeout(300);console.log('  a phone then asks whose:',await p.locator('[data-act=whofirst]').count());await p.click('[data-act=whofirst][data-v="0"]');await p.waitForTimeout(1200);
console.log('2 chose phone, lands on:',here(),'| header Home link:',await p.getByRole('link',{name:/Home/}).count(),'| name:',(await p.locator('.apphead .brand').allTextContents()).join(','));
console.log('  quiet note:',(await p.locator('text=Nothing shared out yet').count()));
await p.screenshot({path:'phone_day.png'});
await p.locator('.menubtn').click();await p.waitForTimeout(300);
console.log('  menu has Planning:',await p.locator('span.l',{hasText:/^Planning$/}).count());
await p.locator('span.l',{hasText:/^Planning$/}).click();await p.waitForTimeout(900);console.log('3 Planning opens planning:',here(),'| card gone:',await p.locator('[data-act=kindfirst]').count()===0,'| tab:',await tabs());
await p.click('[data-act=home]');await p.waitForTimeout(1200);console.log('4 Home on a phone goes to:',here());
await p.goto(B);await p.waitForTimeout(1200);console.log('5 reopening the app:',here());
await p.goto(B+'#share');await p.waitForTimeout(600);console.log('6 #share link not redirected:',here());
await p.goto(B+'?home=1');await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=device]');await p.waitForTimeout(200);
console.log('7 Settings, This device tab, choice:',(await p.locator('[data-act=kindset].on').textContent()));
await p.screenshot({path:'dev_kind.png',fullPage:true});
await p.click('[data-act=kindset][data-v=computer]');await p.waitForTimeout(200);
await p.goto(B);await p.waitForTimeout(800);console.log('8 as a computer, opens on:',here(),'| round:',(await p.locator('.steps button.on').textContent()).trim());
await p.click('[data-act=home]');await p.waitForTimeout(300);console.log('  Home on a computer stays:',here());
// a phone has no Household view, no person chips and no PIN
await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=device]');await p.click('[data-act=kindset][data-v=phone]');await p.waitForTimeout(200);
await p.goto(B+'?home=1');await p.waitForTimeout(400);
console.log('9 phone: Household view button:',await p.locator('[data-act=together]').count(),'| person chips:',await p.locator('.who').count(),'| tabs:',await tabs());
// a phone that was left in Household view with a PIN is not trapped: it opens on Getting a grip with no PIN prompt
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.together=true;l.pin='abc';l.pinSalt='1';l.pinWho=0;l.kind='phone';l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B);await p.waitForTimeout(1500);console.log('9b stuck-in-Household-view phone opens:',here(),'| PIN panel shown:',await p.locator('#pin1').count());
// phone with a job shared out: no quiet note
await p.goto(B+'?home=1');await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=device]');await p.click('[data-act=kindset][data-v=computer]');await p.waitForTimeout(200);
await p.click('[data-act=home]');await p.waitForTimeout(200);
await p.fill('#qa','Redo the bathroom');await p.press('#qa','Enter');await p.waitForTimeout(150);
await p.click('[data-act=stage][data-k=share]');await p.locator('article.card',{hasText:'Redo the bathroom'}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(200);
await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=device]');await p.click('[data-act=kindset][data-v=phone]');await p.waitForTimeout(200);
await p.goto(B);await p.waitForTimeout(1500);console.log('10 job shared out, phone opens:',here(),'| quiet note gone:',(await p.locator('text=Nothing shared out yet').count())===0);
console.log('errors',errs);await b.close();})();
