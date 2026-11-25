// CHECK: payments-setup
// Bringing in a file, setting up each item (small or big, when it comes in, add, skip, bring back, add all) and the choice in the panel.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/agreed.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
await p.goto(B+'#email');await p.waitForTimeout(300);
await p.setInputFiles('#tfile',process.argv[2]);await p.waitForTimeout(400);
console.log('status:',await p.locator('#st').textContent());
let d=await doc();console.log('jobs before set-up:',d.tasks.length,' to set up:',await p.locator('[data-act=tadd]').count());
await p.screenshot({path:'setup.png',fullPage:true});
const row=x=>p.locator('.trow',{hasText:x});
await row('Renew Car insurance').locator('[data-act=tsize][data-v=big]').click();await p.waitForTimeout(150);
await p.selectOption('select[data-tlead]:near(:text("Renew Car insurance"))','56').catch(async()=>{await row('Renew Car insurance').locator('select').selectOption('56');});
await row('Renew Car insurance').locator('select').selectOption('56');await p.waitForTimeout(150);
await row('Renew Car insurance').locator('[data-act=tadd]').click();await p.waitForTimeout(200);
await row('Pay TV licence').locator('select').selectOption('7');await p.waitForTimeout(150);
await row('Pay TV licence').locator('[data-act=tskip]').click();await p.waitForTimeout(150);
await p.click('[data-act=taddall]');await p.waitForTimeout(200);
d=await doc();console.log('jobs:',d.tasks.map(t=>t.text+' '+t.size+' lead '+t.lead).join(' | '));
await p.locator('summary',{hasText:'Already added or skipped'}).click();await row('TV licence').locator('[data-act=tback]').click();await p.waitForTimeout(200);
await row('Pay TV licence').locator('select').selectOption('7');await row('Pay TV licence').locator('[data-act=tadd]').click();await p.waitForTimeout(200);
d=await doc();const tv=d.tasks.find(t=>t.text==='Pay TV licence');console.log('brought back and added:',tv.size,tv.lead);
// panel shows lead
await p.click('[data-act=stage][data-k=share]');await p.locator('article.card .ctext',{hasText:'Renew Car insurance'}).click();await p.waitForTimeout(200);
console.log('panel comes-in shows:',await p.locator('.gpanel select[data-g=lead] option:checked').textContent());
await p.selectOption('.gpanel select[data-g=lead]','14');await p.waitForTimeout(200);d=await doc();console.log('changed in panel:',d.tasks.find(t=>t.text==='Renew Car insurance').lead);
await p.click('.gpanel [data-act=gclose].on');
// phone edit sheet
for(const x of ['Renew Car insurance','Pay TV licence','Pay Car tax','Renew Travel insurance']){await p.locator('article.card',{hasText:x}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(80);}
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
await p.getByRole('button',{name:'Activities',exact:true}).last().click();await p.waitForTimeout(200);
console.log('errors',errs);await b.close();})();
