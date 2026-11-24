// CHECK: renew-details
// The AI prompt asks how to renew; a file with How to renew and Reference columns reaches the job's details, with tappable links on the phone.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
// Data file: tests/data/renew.md (made fresh, with dates relative to today, by tests/data/make.js)
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://localhost:8765'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(300);
console.log('tab:',(await p.locator('nav.tabs').textContent()).includes('🔁 Regular payments'));
await p.click('[data-act=stage][data-k=pay]');await p.click('[data-act=tcopy]');await p.waitForTimeout(200);
const pr=await p.evaluate(()=>navigator.clipboard.readText());
console.log('prompt asks how to renew:',pr.includes('ALSO FIND HOW TO RENEW'),' columns:',pr.includes('| How to renew | Reference |'),' never passwords:',pr.includes('NEVER include passwords'));
await p.setInputFiles('#tfile',process.argv[2]);await p.waitForTimeout(300);
console.log('set-up row shows:',(await p.locator('.trow',{hasText:'Renew Car insurance'}).textContent()).includes('How to renew: https://www.admiral.com/account'));
await p.click('[data-act=taddall]');await p.waitForTimeout(200);
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks.find(t=>t.text==='Renew Car insurance').notes);console.log('job notes:\n'+d);
// to Lauren, open on phone, link tappable?
await p.click('nav.tabs >> text=2 · Share out');await p.locator('article.card',{hasText:'Renew Car insurance'}).locator('[aria-label="Give to Lauren"]').click();
await p.evaluate(()=>{var x=JSON.parse(localStorage.getItem('household.doc.v2'));x.tasks.forEach(t=>{if(t.text==='Renew Car insurance'){t.due=new Date(Date.now()+5*864e5).toISOString().slice(0,10);t.updated=new Date().toISOString();}});localStorage.setItem('household.doc.v2',JSON.stringify(x));});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
await p.locator('[aria-label*="details" i]').first().click().catch(e=>console.log('no chevron',e.message.slice(0,60)));await p.waitForTimeout(300);
console.log('phone details has links:',await p.locator('a[href^="https://www.admiral.com"]').count(),await p.locator('a[href^="tel:"]').count());
await p.screenshot({path:'renew_phone.png'});
await p.goto(B+'#email');await p.waitForTimeout(300);console.log('old #email link opens:',await p.locator('nav.tabs button.on').textContent());
console.log('errors',errs);await b.close();})();
