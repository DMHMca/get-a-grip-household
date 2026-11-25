// CHECK: side-and-lock
// H1.12/H1.13: the title that switches side, each computer remembering its last page and side, Home meaning "start of this side".
// (The PIN timeout part was removed with the PIN in H1.31.)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:1000}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const here=()=>p.url().replace(B,'')||'(planning)';
const L=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'));
const setL=o=>p.evaluate(o=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');Object.assign(l,o);localStorage.setItem('household.local.v2',JSON.stringify(l));},o);
const tabOn=async()=>((await p.locator('.steps button.on').allTextContents())[0]||'');
await p.goto(B);await p.waitForTimeout(500);
await p.click('[data-act=kindfirst][data-v=computer]');await p.waitForTimeout(300);
console.log('1 first open: tab',await tabOn(),'| side pill:',await p.locator('.sidebtn').count());
await p.click('[data-act=stage][data-k=share]');await p.waitForTimeout(200);
await p.goto(B);await p.waitForTimeout(500);console.log('2 reopened: remembers',await tabOn(),'(want 2 · Share out)');
await p.goto(B+'?home=1');await p.waitForTimeout(500);console.log('3 Home link: goes to',await tabOn(),'| url',here());
await p.click('[data-act=stage][data-k=share]');await p.click('.sidebtn');await p.waitForTimeout(900);
console.log('4 the title switched to:',here(),'| side saved:',(await L()).side);
await p.goto(B);await p.waitForTimeout(900);console.log('5 reopened: lands on',here(),'(want tasks.html)');
console.log('5b a computer is asked whose, here on Getting a grip:',await p.locator('[aria-label="Whose device is this"]').count(),'| none on the planning side');
await p.locator('[aria-label="Whose device is this"] button',{hasText:'Josh'}).click();await p.waitForTimeout(600);
console.log('   answered: bar gone',await p.locator('[aria-label="Whose device is this"]').count()===0,'| me:',(await L()).me,'| whoSet:',(await L()).whoSet,'| header:',(await p.locator('.apphead').textContent()).replace(/\s+/g,' '));
await p.getByRole('link',{name:/Switch to Planning/}).click();await p.waitForTimeout(800);console.log('6 title back: ',here(),await tabOn(),'| side:',(await L()).side);
await p.goto(B);await p.waitForTimeout(500);console.log('7 reopened after planning: stays on',here());
console.log('errors',errs);await b.close();})();
