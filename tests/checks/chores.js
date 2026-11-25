// CHECK: chores
// H1.14: "how often" for routine chores. A starter from the Cleaning tile arrives with a how-often; ticking a chore (no due date) brings the next one
// back, counted from today, quiet until shortly before it is wanted, going to the other person when "take turns" is on; a bill with a due date keeps
// counting from its due date; the phone sets and ticks a chore the same way; no due date means no reminder.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:1400}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
const ymd=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);};
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(400);
await p.click('[data-act=stage][data-k=areas]');await p.waitForTimeout(200);
await p.click('[data-act=area][data-k=clean]');await p.waitForTimeout(300);
await p.locator('[data-act=starter]',{hasText:'Put things back where they live'}).click();await p.waitForTimeout(200);
await p.locator('[data-act=starter]',{hasText:'Empty the kitchen bin when full'}).click();await p.waitForTimeout(200);
let d=await doc();const g=x=>d.tasks.find(t=>t.text===x);
console.log('1 starters carry how often:',g('Put things back where they live').rep,g('Empty the kitchen bin when full').rep,'| due:',g('Put things back where they live').due);
// set up: a weekly chore taking turns (Lauren), a daily one, a bill with a due date and a yearly repeat
await p.evaluate((x)=>{var d=JSON.parse(localStorage.getItem('household.doc.v2'));var t=(id,text,o)=>Object.assign({id,text,size:'small',area:'clean',to:0,done:false,n:1,updated:'2026-11-24T09:00:00Z'},o);
 d.tasks.push(t('w1','Hoover downstairs',{rep:'week',alt:true}),t('d1','Wipe the kitchen surfaces',{rep:'day'}),t('b1','Renew the TV licence',{area:'bills',rep:'year',due:x.due,lead:28}));localStorage.setItem('household.doc.v2',JSON.stringify(d));},{due:ymd(10)});
await p.reload();await p.waitForTimeout(400);
await p.click('nav.tabs >> text=2 · Share out');await p.waitForTimeout(300);
for(const x of ['Hoover downstairs','Wipe the kitchen surfaces','Renew the TV licence']){await p.locator('article.card',{hasText:x}).locator('input.tk').first().click();await p.waitForTimeout(250);}
d=await doc();
const nw=d.tasks.filter(t=>t.text==='Hoover downstairs'&&!t.done)[0],nd=d.tasks.filter(t=>t.text==='Wipe the kitchen surfaces'&&!t.done)[0],nb=d.tasks.filter(t=>t.text==='Renew the TV licence'&&!t.done)[0];
console.log('2 weekly chore: next copy waits until',nw&&nw.wait,'(want',ymd(6)+')','| no due:',nw&&!nw.due,'| goes to Josh (take turns):',nw&&nw.to===1,'| still taking turns:',nw&&nw.alt);
console.log('3 daily chore: back tomorrow:',nd&&nd.wait===ymd(1),'| same person:',nd&&nd.to===0);
const yr=new Date();yr.setDate(yr.getDate()+10);yr.setFullYear(yr.getFullYear()+1);
console.log('4 bill: next due counted from the old due date:',nb&&nb.due===yr.toISOString().slice(0,10)||(nb&&nb.due),'| lead kept:',nb&&nb.lead);
console.log('5 only one next copy each:',['Hoover downstairs','Wipe the kitchen surfaces','Renew the TV licence'].map(x=>d.tasks.filter(t=>t.text===x&&!t.done).length).join(','));
// the set-up panel offers how often and take turns
await p.locator('article.card',{hasText:'Put things back where they live'}).locator('[data-act=edit]').first().click().catch(()=>{});await p.waitForTimeout(300);
if(!(await p.locator('.gpanel').count())){await p.click('nav.tabs >> text=1 · Brainstorm');}
console.log('6 panel open:',await p.locator('.gpanel').count());
// phone
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='phone';l.me=1;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
const nm=await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.text==='Hoover downstairs').map(t=>({w:t.wait,done:!!t.done})));
console.log('7 phone (Josh) sees the new Hoover job:',JSON.stringify(nm));
await p.evaluate(()=>{var t=GAGH.S.tasks.find(t=>t.text==='Hoover downstairs'&&!t.done);t.done=GAGH.iso();t.updated=GAGH.iso();GAGH.commit(true);GAGH.push&&GAGH.push();});await p.waitForTimeout(1500);
d=await doc();const again=d.tasks.filter(t=>t.text==='Hoover downstairs'&&!t.done)[0];
console.log('8 ticked on the phone: next one goes back to Lauren:',again&&again.to===0,'| waits until',again&&again.wait);
console.log('errors',errs);await b.close();})();
