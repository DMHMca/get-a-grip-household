// CHECK: due-queue-and-reminders-card
// A job due within a week goes to the top of Today; the Devices page shows the reminders card.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/agreed.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});
await c.addInitScript(()=>{Object.defineProperty(Notification,'permission',{get:()=>'default'});});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);
for(const x of ['Job A','Job B','Job C','Pay the TV licence']){await p.fill('#qa',x);await p.press('#qa','Enter');await p.waitForTimeout(100);}
await p.click('nav.tabs >> text=2 · Share out');await p.waitForTimeout(200);
for(const x of ['Job A','Job B','Job C','Pay the TV licence']){await p.locator('article.card',{hasText:x}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(100);}
await p.goto(B+'tasks.html');await p.waitForTimeout(900);
await p.evaluate(()=>{var S=GAGH.S,t=S.tasks.find(x=>x.text==='Pay the TV licence');t.due=new Date(Date.now()+6*864e5).toISOString().slice(0,10);t.updated=GAGH.iso();S.tasks=S.tasks.filter(x=>x!==t).concat([t]);GAGH.commit();});
await p.evaluate(()=>{var S=GAGH.S;S.plans=[];GAGH.commit();});
console.log('Small list (own order):',(await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.activityId==='hh').map(t=>t.text).join(' | '))));
await p.getByRole('button',{name:'Automatic',exact:true}).click();await p.waitForTimeout(400);
console.log('Today (automatic):',await p.evaluate(()=>{var pl=GAGH.S.plans[GAGH.S.plans.length-1];return pl.items.map(i=>GAGH.S.tasks.find(t=>t.id===i.tid).text).join(' | ');}));
await p.screenshot({path:'today3.png'});
await p.goto(B+'?home=1');await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2'));l.code='ABCDEFGH2345';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(400);await p.click('[data-act=more]');await p.click('[data-act=stab][data-v=link]');await p.waitForTimeout(300);
await p.locator('.day').screenshot({path:'sharing2.png'});
console.log('card:',(await p.locator('.day .note2').first().textContent()));
console.log('errors',errs);await b.close();})();
