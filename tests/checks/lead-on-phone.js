// CHECK: lead-on-phone
// The phone's Comes-into-the-list choice saves to the shared list and a job not yet due stays hidden.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
require('../lib/owner-named')(require('playwright').chromium);
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(200);
await p.evaluate(()=>{var d=new Date(Date.now()+10*864e5).toISOString().slice(0,10);localStorage.setItem('household.doc.v2',JSON.stringify({tasks:[{id:'a',text:'Pay Car tax',size:'small',area:'car',to:0,done:false,n:1,due:d,rep:'year',lead:28,updated:'2026-11-24T10:00:00Z'}],gone:[],day:{},cats:[],triage:[]}));});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
await p.locator('.list').getByText('Pay Car tax',{exact:true}).click();await p.waitForTimeout(300);
console.log('phone shows:',await p.locator('select[aria-label="Comes into the list"] option:checked').textContent());
await p.selectOption('select[aria-label="Comes into the list"]','7');await p.getByRole('button',{name:'Save',exact:true}).click();await p.waitForTimeout(1200);
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks[0].lead);console.log('shared lead now:',d);
await p.reload();await p.waitForTimeout(1000);await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
console.log('10 days away with a week lead, hidden:',!(await p.locator('.list').textContent()).includes('Pay Car tax'));
console.log('errors',errs);await b.close();})();
