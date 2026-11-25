// CHECK: flow-wall-to-my-day
// The basic flow: add a note on the wall, share it out to Lauren, find it in Getting a grip, set it up, give it to Josh, delete a step; nothing personal reaches the shared list.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')||'{"tasks":[]}'));
await p.goto(B);await p.waitForTimeout(800);
console.log('opens on:', await p.locator('.steps button.on').textContent());
await p.fill('#qa','Fix the gutter');await p.press('#qa','Enter');await p.waitForTimeout(300);
await p.click('[data-act=stage][data-k=share]');await p.waitForTimeout(300);
console.log('Both column?', (await p.locator('.col h3',{hasText:'Both'}).count())>0);
await p.screenshot({path:'share.png',fullPage:true});
const card=p.locator('article.card',{hasText:'Fix the gutter'});await card.locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(300);
await p.click('.sidebtn');await p.waitForTimeout(1200);
console.log('url:', p.url().replace(B,''));
await p.screenshot({path:'myday.png'});
await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
console.log('household job in Small list:', (await p.textContent('body')).includes('Fix the gutter'));
// personal task
const inp=p.locator('input:visible, textarea:visible').first();await inp.fill('PERSONAL SECRET');await inp.press('Enter');await p.waitForTimeout(800);
// edit household task in place: make big, add subtask, set duration via data
await p.evaluate(()=>{var S=GAGH.S,iso=GAGH.iso,uid=GAGH.uid,commit=GAGH.commit;var t=S.tasks.find(x=>x.text==='Fix the gutter');t.size='big';t.dur='60';t.notes='Ladder in the shed';t.updated=iso();var n={id:uid(),text:'Buy a gutter scoop',activityId:t.activityId,created:iso(),done:null,updated:iso(),parent:t.id};S.tasks.push(n);commit();});
await p.waitForTimeout(800);
let d=await doc();
console.log('doc has personal?', JSON.stringify(d).includes('PERSONAL SECRET'));
const g=d.tasks.find(t=>t.text==='Fix the gutter');console.log('doc job:', g.size, g.dur, g.notes, 'to', g.to);
console.log('doc step:', !!d.tasks.find(t=>t.text==='Buy a gutter scoop'&&t.parent===g.id));
// tick step in GaG -> doc
await p.evaluate(()=>{var S=GAGH.S,iso=GAGH.iso,uid=GAGH.uid,commit=GAGH.commit;var t=S.tasks.find(x=>x.text==='Buy a gutter scoop');t.done=iso();t.updated=iso();commit();});await p.waitForTimeout(800);
d=await doc();console.log('step ticked in doc:', !!d.tasks.find(t=>t.text==='Buy a gutter scoop').done);
// back to planning; card shows step; give job to Josh
await p.goto(B+'#share');await p.waitForTimeout(800);
console.log('share out shows step:', (await p.textContent('body')).includes('Buy a gutter scoop'));
await p.locator('article.card',{hasText:'Fix the gutter'}).locator('[aria-label="Give to Josh"]').click();await p.waitForTimeout(300);
await p.goto(B+'tasks.html');await p.waitForTimeout(1000);
const has=await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.text==='Fix the gutter'||t.text==='Buy a gutter scoop').length);
console.log('after giving to Josh, still in Lauren day:', has, ' personal still there:', await p.evaluate(()=>!!GAGH.S.tasks.find(t=>t.text==='PERSONAL SECRET')));
d=await doc();console.log('job survives in household:', !!d.tasks.find(t=>t.text==='Fix the gutter'&&t.to===1));
// switch device to Josh
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2'));l.me=1;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(1000);
console.log('as Josh, sees job with dur:', await p.evaluate(()=>{var S=GAGH.S,iso=GAGH.iso,uid=GAGH.uid,commit=GAGH.commit;var t=S.tasks.find(x=>x.text==='Fix the gutter');return t&&t.dur+' '+t.size+' '+t.activityId;}));
// delete in GaG -> tombstone
await p.evaluate(()=>{var S=GAGH.S,iso=GAGH.iso,uid=GAGH.uid,commit=GAGH.commit;var t=S.tasks.find(x=>x.text==='Buy a gutter scoop');S.gone.push({id:t.id,at:iso()});GAGH.S.tasks=S.tasks.filter(x=>x!==t);commit();});await p.waitForTimeout(800);
d=await doc();console.log('deleted step gone from household:', !d.tasks.find(t=>t.text==='Buy a gutter scoop'));
console.log('errors',errs);await b.close();})();
