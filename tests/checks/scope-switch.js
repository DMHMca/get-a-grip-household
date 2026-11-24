// CHECK: scope-switch
// The Everything / Household / Personal switch on My day, adding a job under Household, and Today building only from household jobs.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(500);
await p.fill('#qa','Clear the gutters');await p.press('#qa','Enter');await p.waitForTimeout(200);
await p.click('nav.tabs >> text=2 · Share out');await p.waitForTimeout(500);
await p.locator('article.card',{hasText:'Clear the gutters'}).locator('[aria-label="Give to Lauren"]').click();await p.waitForTimeout(300);
await p.goto(B+'tasks.html');await p.waitForTimeout(900);
const small=()=>p.getByRole('button',{name:'Small',exact:true}).last().click();
await small();await p.waitForTimeout(300);
const inp=p.locator('input:visible, textarea:visible').first();await inp.fill('Ring the dentist');await inp.press('Enter');await p.waitForTimeout(500);
const show=async(n)=>{await p.getByRole('button',{name:n,exact:true}).first().click();await p.waitForTimeout(300);const t=await p.locator('.list').textContent();return [t.includes('Clear the gutters'),t.includes('Ring the dentist')];};
console.log('Everything [hh,personal]:',await show('Everything'));
console.log('Household:',await show('Household'));
await p.screenshot({path:'scope.png'});
console.log('Personal:',await show('Personal'));
await show('Household');
const inp2=p.locator('input:visible, textarea:visible').first();await inp2.fill('Bleed the radiators');await inp2.press('Enter');await p.waitForTimeout(1200);
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
console.log('added under Household reaches shared list:', !!d.tasks.find(t=>t.text==='Bleed the radiators'&&t.to===0), ' dentist in shared:', JSON.stringify(d).includes('dentist'));
await p.goto(B+'#share');await p.waitForTimeout(500);
console.log('Share out shows new job under Lauren:', (await p.locator('.col[data-to="0"]').textContent()).includes('Bleed the radiators'));
// Today automatic under Household only
await p.goto(B+'tasks.html');await p.waitForTimeout(800);
await p.getByRole('button',{name:'Household',exact:true}).first().click();await p.getByRole('button',{name:'Automatic',exact:true}).click();await p.waitForTimeout(500);
const tt=await p.textContent('body');console.log('Today household-only: gutters',tt.includes('Clear the gutters'),'dentist',tt.includes('Ring the dentist'));
await p.screenshot({path:'today.png'});
console.log('errors',errs);await b.close();})();
