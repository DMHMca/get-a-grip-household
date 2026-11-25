// CHECK: due-dates-and-repeats
// Due date and yearly repeat in the set-up panel, a due job jumping the queue on Today, next year's copy when ticked, no due field on personal tasks.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/agreed.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
await p.goto(B);await p.waitForTimeout(500);
for(const x of ['Clean the oven','Sort the freezer','Wash the car','Renew the car insurance']){await p.fill('#qa',x);await p.press('#qa','Enter');await p.waitForTimeout(150);}
await p.click('[data-act=stage][data-k=share]');await p.waitForTimeout(300);
for(const x of ['Clean the oven','Sort the freezer','Wash the car','Renew the car insurance']){await p.locator('article.card',{hasText:x}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(150);}
await p.goto(B+'tasks.html');await p.waitForTimeout(1000);
await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
const order=await p.locator('.list').textContent();console.log('Small list order starts:',order.slice(0,60));
await p.locator('.list').getByText('Renew the car insurance',{exact:true}).click();await p.waitForTimeout(400);
const due=p.locator('input[type=date]');console.log('due field on household job:',await due.count());
const d5=new Date(Date.now()+5*864e5).toISOString().slice(0,10);
await due.fill(d5);await due.dispatchEvent('change');await p.selectOption('select[aria-label=Repeats]','year');await p.waitForTimeout(200);
await p.screenshot({path:'edit.png'});
await p.getByRole('button',{name:'Save',exact:true}).click();await p.waitForTimeout(1200);
let d=await doc();let j=d.tasks.find(t=>t.text==='Renew the car insurance');console.log('doc due/rep:',j.due===d5,j.rep);
console.log('list after save shows date?',(await p.locator('.list').textContent()).includes(d5));
// Today automatic: due job first
await p.getByRole('button',{name:'Today',exact:true}).last().click();await p.waitForTimeout(300);
await p.getByRole('button',{name:'Automatic',exact:true}).click();await p.waitForTimeout(500);
const tiles=await p.evaluate(()=>{var pl=GAGH.S.plans[GAGH.S.plans.length-1];return pl.items.map(i=>GAGH.S.tasks.find(t=>t.id===i.tid).text);});
console.log('Today order:',tiles.join(' | '));
await p.screenshot({path:'today2.png'});
// tick it -> next year copy
await p.evaluate(()=>{var t=GAGH.S.tasks.find(x=>x.text==='Renew the car insurance');t.done=GAGH.iso();t.updated=GAGH.iso();GAGH.commit();});await p.waitForTimeout(1500);
d=await doc();const reps=d.tasks.filter(t=>t.text==='Renew the car insurance');console.log('copies:',reps.map(t=>(t.done?'done ':'open ')+t.due).join(', '));
console.log('next year copy in My day:',await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.text==='Renew the car insurance'&&!t.done).length));
// personal task has no due field
await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
await p.getByRole('button',{name:'Personal',exact:true}).first().click();
const inp=p.locator('input:visible, textarea:visible').first();await inp.fill('Ring mum');await inp.press('Enter');await p.waitForTimeout(400);
await p.locator('.list').getByText('Ring mum',{exact:true}).click();await p.waitForTimeout(300);
console.log('due field on personal task:',await p.locator('input[type=date]').count());
// Sharing tab reminders card
await c.grantPermissions(['notifications']);
await p.goto(B+'?home=1');await p.waitForTimeout(400);await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2'));l.code='ABCDEFGH2345';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(500);await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=link]');await p.waitForTimeout(300);
console.log('reminders card:',(await p.locator('.day').textContent()).includes('Turn on reminders'));
await p.locator('.day').screenshot({path:'sharing.png'});
console.log('errors',errs.filter(e=>!/Failed to fetch|NetworkError/.test(e)));await b.close();})();
