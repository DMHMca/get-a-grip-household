// CHECK: owner-needed
// H1.34: a device with no named owner takes no household jobs and signs up for no reminders; naming the owner brings Lauren's (or Josh's) jobs in at once.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate(()=>{const T=(id,text,to)=>({id,text,size:'small',area:'house',to,done:false,n:1,updated:'2026-11-24T09:00:00Z'});
 localStorage.setItem('household.doc.v2',JSON.stringify({tasks:[T('a','Lauren job',0),T('b','Josh job',1)],gone:[],day:{},cats:[]}));
 localStorage.setItem('household.local.v2',JSON.stringify({kind:'computer',whoSet:false,me:0}));});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
const names=()=>p.evaluate(()=>GAGH.S.tasks.map(t=>t.text));
console.log('1 no owner yet: household jobs on the device:',(await names()).join(',')||'none','| asked whose:',await p.locator('[aria-label="Whose device is this"]').count());
await p.locator('[aria-label="Whose device is this"] button',{hasText:'Josh'}).click();await p.waitForTimeout(800);
console.log('2 owner named Josh: jobs now:',(await names()).join(',')||'none');
await p.goto(B+'#set-reminders');await p.waitForTimeout(300);
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.whoSet=false;l.code='ABCDEFGH2345';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(500);
console.log('3 reminders without an owner say so:',/not been named/.test(await p.locator('.note2').allTextContents().then(a=>a.join(' '))));
console.log('errors',errs);await b.close();})();
