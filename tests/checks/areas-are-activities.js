// CHECK: areas-are-activities
// Each planning area is its own household activity on the phone; moving a job between them, or into a personal activity, behaves correctly.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
// an old-style device: a job already sitting in the single 'Household' activity
await p.goto(B);await p.waitForTimeout(300);
await p.evaluate(()=>{localStorage.setItem('household.doc.v2',JSON.stringify({tasks:[
 {id:'j1',text:'Book the MOT',size:'small',area:'car',to:0,done:false,n:3,updated:'2026-11-22T10:00:00Z'},
 {id:'j2',text:'Redo the bathroom',size:'big',area:'house',to:0,done:false,n:2,updated:'2026-11-22T10:00:00Z'},
 {id:'j3',text:'Choose tiles',size:'small',area:'house',parent:'j2',to:0,done:false,n:4,updated:'2026-11-22T10:00:00Z'},
 {id:'j4',text:'Book the dentist',size:'small',area:'health',to:0,done:false,n:1,updated:'2026-11-22T10:00:00Z'}],gone:[],day:{},cats:[]}));
 localStorage.setItem('gagh.tasks.v1',JSON.stringify({v:1,updatedAt:1,activities:[{id:'hh',name:'Household',created:'x',archived:null},{id:'p1',name:'My hobbies',created:'x',archived:null}],tasks:[{id:'j1',text:'Book the MOT',activityId:'hh',created:'x',done:null,updated:'2026-11-22T10:00:00Z'},{id:'pp',text:'Practise guitar',activityId:'p1',created:'x',done:null,updated:'x'}]}));
 localStorage.setItem('gagh.hh.mirror','["j1"]');});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
console.log('activities:',await p.evaluate(()=>GAGH.S.activities.map(a=>a.id+'='+a.name).join(' | ')));
console.log('where jobs are:',await p.evaluate(()=>GAGH.S.tasks.map(t=>t.text+'→'+t.activityId).join(' | ')));
await p.getByRole('button',{name:'Activities',exact:true}).last().click();await p.waitForTimeout(300);await p.screenshot({path:'acts.png'});
// move MOT into Health activity on phone -> area changes in doc
await p.evaluate(()=>{var t=GAGH.S.tasks.find(x=>x.text==='Book the MOT');t.activityId='hh:health';t.updated=GAGH.iso();GAGH.commit();});await p.waitForTimeout(1200);
let d=await doc();console.log('MOT area now:',d.tasks.find(t=>t.id==='j1').area);
// move dentist to personal activity -> leaves household
await p.evaluate(()=>{var t=GAGH.S.tasks.find(x=>x.text==='Book the dentist');t.activityId='p1';t.updated=GAGH.iso();GAGH.commit();});await p.waitForTimeout(1200);
d=await doc();console.log('dentist still household?',!!d.tasks.find(t=>t.id==='j4'),' guitar in household?',JSON.stringify(d).includes('guitar'));
console.log('scope Household shows:',await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.activityId&&t.activityId.indexOf('hh')===0).map(t=>t.text).join(', ')));
// planning panel area select
await p.goto(B+'?home=1');await p.waitForTimeout(400);await p.click('[data-act=stage][data-k=group]');await p.waitForTimeout(300);
await p.locator('.gcard .tt2',{hasText:'Redo the bathroom'}).click();await p.waitForTimeout(200);
await p.selectOption('.gpanel select[data-g=area]','garden');await p.waitForTimeout(300);
d=await doc();console.log('bathroom area:',d.tasks.find(t=>t.id==='j2').area,' step area:',d.tasks.find(t=>t.id==='j3').area);
await p.goto(B+'tasks.html');await p.waitForTimeout(1000);
console.log('bathroom now in:',await p.evaluate(()=>GAGH.S.tasks.filter(t=>t.text==='Redo the bathroom'||t.text==='Choose tiles').map(t=>t.activityId).join(',')));
console.log('errors',errs);await b.close();})();
