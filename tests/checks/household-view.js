// CHECK: household-view (now: there is NO PIN, lock or Household view)
// H1.31 (owner: "you have the same risk for anything on your computer"): no PIN anywhere. The Planning ⇄ Getting a grip switch just goes in, there is
// no Security tab, no Lock or Household view button, nothing asks for a PIN, and anything an older version stored (PINs, locked flags) is cleared.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const here=()=>p.url().replace(B,'')||'(planning)';
const L=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'));
// an old device that had a PIN and was locked in Household view
await p.goto(B);await p.evaluate(()=>{localStorage.setItem('household.local.v2',JSON.stringify({kind:'computer',whoSet:true,me:0,together:true,shared:true,pin:'abc',pinSalt:'1',pinWho:0,pins:{0:{h:'x',s:'y'}},nopin:true,lockMin:2}));});
await p.reload();await p.waitForTimeout(400);
const l=await L();
console.log('1 old PIN and lock settings cleared:',['together','shared','pin','pinSalt','pinWho','pins','nopin','lockMin'].every(k=>!(k in l)||k==='pins'&&Object.keys(l.pins||{}).length===0));
console.log('2 no Lock / Household view button:',await p.locator('[data-act=together]').count()===0,'| Getting a grip switch shown:',await p.locator('.sidebtn').count());
await p.click('[data-act=more]');await p.waitForTimeout(200);
console.log('3 Settings tabs:',(await p.locator('.stabs button').allTextContents()).join(' | '));
await p.click('[data-act=home]');await p.click('.sidebtn');await p.waitForTimeout(900);
console.log('4 the switch just goes in:',here(),'| PIN panel:',await p.locator('#pin1').count());
await p.goto(B+'tasks.html');await p.waitForTimeout(500);console.log('5 the Getting a grip address is not bounced:',here());
await p.getByRole('link',{name:/Switch to Planning/}).click();await p.waitForTimeout(700);console.log('6 and back to Planning:',here());
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='phone';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B+'tasks.html');await p.waitForTimeout(600);console.log('7 a phone opens on Getting a grip:',here());
console.log('errors',errs);await b.close();})();
