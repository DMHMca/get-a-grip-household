// CHECK: household-view (now: the PIN gate on Getting a grip)
// H1.27: on a computer the Planning ⇄ Getting a grip switch is the doorway to personal tasks. No PIN yet: it OFFERS to set one (or "No PIN on this computer").
// With a PIN: leaving Getting a grip locks it, and the next press of the switch asks for the PIN. A phone is never asked. There is no Household view button.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const here=()=>p.url().replace(B,'')||'(planning)';
const L=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'));
await p.goto(B);await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(300);
console.log('1 no Household view or Lock button in the header:',await p.locator('[data-act=together]').count()===0);
await p.click('.sidebtn');await p.waitForTimeout(300);
console.log('2 first press offers a PIN:',await p.locator('.gpanel h3').textContent(),'| buttons:',(await p.locator('.gpanel button').allTextContents()).join(' / '));
await p.click('[data-act=pinoffer][data-v=skip]');await p.waitForTimeout(900);
console.log('3 "No PIN on this computer" goes in:',here(),'| nopin:',(await L()).nopin);
await p.getByRole('link',{name:/Switch to Planning/}).click();await p.waitForTimeout(700);await p.click('.sidebtn');await p.waitForTimeout(800);
console.log('4 not asked again:',here());
// set a PIN in Settings, then the doorway asks
await p.goto(B+'?side=plan');await p.waitForTimeout(400);await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=device]');await p.click('[data-act=pinset]');await p.waitForTimeout(200);
await p.fill('#pin1','1357');await p.fill('#pin2','1357');await p.click('[data-act=pinok]');await p.waitForTimeout(300);
console.log('5 PIN set; nopin cleared:',(await L()).nopin===false);
await p.click('[data-act=home]');await p.click('.sidebtn');await p.waitForTimeout(800);console.log('6 right after setting it you are let in:',here());
await p.getByRole('link',{name:/Switch to Planning/}).click();await p.waitForTimeout(800);
console.log('7 leaving Getting a grip locked it:',(await L()).together);
await p.click('.sidebtn');await p.waitForTimeout(300);console.log('8 the switch now asks:',await p.locator('.gpanel h3').textContent());
await p.fill('#pin1','9999');await p.press('#pin1','Enter');await p.waitForTimeout(300);console.log('9 wrong PIN stays out:',here(),'|',(await p.locator('.gpanel .gnote').filter({hasText:'not right'}).count())>0);
await p.fill('#pin1','1357');await p.press('#pin1','Enter');await p.waitForTimeout(900);console.log('10 right PIN goes in:',here(),'| unlocked:',(await L()).together===false);
await p.goto(B+'tasks.html');await p.waitForTimeout(500);await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.together=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B+'tasks.html');await p.waitForTimeout(700);console.log('11 the address typed while locked goes to planning:',here());
// a phone is never asked
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='phone';l.together=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B+'tasks.html');await p.waitForTimeout(700);console.log('12 a phone is not asked or bounced:',here());
console.log('errors',errs);await b.close();})();
