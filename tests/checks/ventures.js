// CHECK: ventures
// H1.36: a Business ventures round after Walk each area, in the same format: three tiles (Well Spent, Bot League, StoryBella) plus Add your own,
// each walked part by part with tappable starters; notes land on the wall under the venture; the walk's own tiles do not include the ventures.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:1300}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept('Allotment Co'));
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate(()=>{localStorage.setItem('household.local.v2',JSON.stringify({kind:'computer',whoSet:true,me:0,opened:true}));});await p.reload();await p.waitForTimeout(400);
console.log('1 rounds:',(await p.locator('.steps button').allTextContents()).map(x=>x.replace(/^\d/,'')).join(' | '));
await p.click('[data-act=stage][data-k=areas]');await p.waitForTimeout(200);
console.log('2 the walk tiles do not include the ventures:',!/Well Spent|Bot League|StoryBella/.test((await p.locator('.areas').textContent())));
await p.click('[data-act=stage][data-k=vent]');await p.waitForTimeout(300);
console.log('3 venture tiles:',(await p.locator('.areas .area').allTextContents()).map(x=>x.trim()).join(' | '));
await p.click('[data-act=area][data-k=wellspent]');await p.waitForTimeout(300);
const st=await p.locator('.stage').textContent();
console.log('4 walk of Well Spent, part by part:',/Well Spent · walk round · 1 of 6/.test(st),'| first part Product:',/Product/.test(st));
await p.locator('[data-act=starter]',{hasText:'Plan the next release'}).click();await p.waitForTimeout(200);
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks.find(t=>t.text==='Plan the next release'));
console.log('5 a starter becomes a note under the venture:',d&&d.area,'| tag:',d&&d.tag);
await p.click('[data-act=nextpart]');await p.waitForTimeout(200);console.log('6 next part:',/2 of 6/.test(await p.locator('.stage').textContent()));
await p.click('[data-act=allareas]');await p.waitForTimeout(200);
await p.click('[data-act=addcat]');await p.waitForTimeout(400);
console.log('7 Add your own venture opens its walk:',/Allotment Co · walk round · 1 of 6/.test(await p.locator('.stage').textContent()),'| remove link:',await p.locator('[data-act=delcat]').count());
await p.click('[data-act=allareas]');await p.waitForTimeout(200);
console.log('8 the new venture is a tile in the ventures round:',/Allotment Co/.test(await p.locator('.areas').textContent()));
await p.click('[data-act=stage][data-k=areas]');await p.waitForTimeout(200);
console.log('9 ...and not in the walk round:',!/Allotment Co/.test(await p.locator('.areas').textContent()));
await p.click('[data-act=stage][data-k=group]');await p.waitForTimeout(300);
console.log('10 the note shows on the board with its venture:',/Well Spent/.test(await p.locator('.gboard').textContent()));
console.log('errors',errs);await b.close();})();
