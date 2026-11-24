// CHECK: household-view
// Household view: hides My day, asks to set a PIN, asks for it to leave; an old shared-screen device becomes Household view.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const tabs=async()=>(await p.locator('nav.tabs button').allTextContents()).join(' | ');
// an old shared-screen device turns into Household view
await p.goto(B);await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.shared=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(300);
console.log('old shared device:',await tabs(),'| button:',await p.locator('[data-act=together]').textContent());
console.log('device choices:',(await p.locator('.who button').allTextContents()).join(' | '));
await p.click('[data-act=together]');await p.waitForTimeout(200);console.log('leaving (no PIN yet):',await tabs());
await p.click('[data-act=together]');await p.waitForTimeout(200);console.log('first time asks:',await p.locator('.gpanel h3').textContent());
await p.fill('#pin1','1357');await p.fill('#pin2','1357');await p.click('[data-act=pinok]');await p.waitForTimeout(300);
console.log('in Household view:',await tabs());
await p.goto(B+'tasks.html');await p.waitForTimeout(600);console.log('My day address goes to:',p.url().replace(B,''));
await p.click('[data-act=together]');await p.waitForTimeout(200);console.log('leaving asks:',await p.locator('.gpanel h3').textContent());
await p.fill('#pin1','1357');await p.press('#pin1','Enter');await p.waitForTimeout(300);console.log('back to own view:',await tabs());
await p.screenshot({path:'hv.png'});
console.log('errors',errs);await b.close();})();
