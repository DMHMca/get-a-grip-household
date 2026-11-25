// CHECK: task-rules
// The adopted Get a grip task rules: nesting, merging steps, Part of a big job, a small job finishing itself, and the same-side rule on the phone.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
require('../lib/owner-named')(require('playwright').chromium);
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:1300}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
await p.goto(B+'?home=1');await p.waitForTimeout(300);await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.evaluate(()=>{const T=(id,text,o)=>Object.assign({id,text,size:'small',area:'wild',to:0,done:false,n:1,updated:'2026-11-24T09:00:00Z'},o);
 localStorage.setItem('household.doc.v2',JSON.stringify({tasks:[
  T('big1','Redo the bathroom',{size:'big',area:'house',n:5,notes:'Budget £4k'}),
  T('s1','Sort the tiles',{n:4,area:'garden',notes:'Ask Sam about tiles'}),T('k1','Measure the walls',{parent:'s1',n:10,done:'2026-11-20T10:00:00Z'}),T('k2','Pick a colour',{parent:'s1',n:11}),
  T('lone','Buy grout',{n:3,area:'car'}),
  T('sm','Fix the tap',{n:2}),T('st1','Buy washer',{parent:'sm',n:12}),T('st2','Fit washer',{parent:'sm',n:13})],gone:[],day:{},cats:[]}));});
await p.reload();await p.waitForTimeout(400);
await p.click('[data-act=stage][data-k=group]');await p.waitForTimeout(300);
// rule 6 on the board: drop Sort the tiles (has steps) onto middle of bathroom
const tg=p.locator('.gcard',{hasText:'Redo the bathroom'});const bb=await tg.boundingBox();
await p.locator('.gcard',{hasText:'Sort the tiles'}).dragTo(tg,{targetPosition:{x:bb.width/2,y:bb.height*0.7}});await p.waitForTimeout(300);
let d=await doc();const by=id=>d.tasks.find(t=>t.id===id);
console.log('rule 6 board: emptied job gone:',!by('s1'),' steps moved in order:',d.tasks.filter(t=>t.parent==='big1').sort((a,b)=>a.n-b.n).map(t=>t.text+(t.done?'✓':'')+'@'+t.area).join(', '),' notes:',JSON.stringify(by('big1').notes));
// rule 4+2: drop Buy grout (small, no steps) onto Fix the tap (small) -> step, Fix the tap stays small
const tg2=p.locator('.gcard',{hasText:'Fix the tap'});const b2=await tg2.boundingBox();
await p.locator('.gcard',{hasText:'Buy grout'}).dragTo(tg2,{targetPosition:{x:b2.width/2,y:b2.height*0.7}});await p.waitForTimeout(300);
d=await doc();console.log('rule 4/2: grout under tap, last:',d.tasks.filter(t=>t.parent==='sm').sort((a,b)=>a.n-b.n).map(t=>t.text).join(', '),' area:',by('lone').area,' tap still:',by('sm').size);
// panel: Part of a big job -> None
await p.locator('.gcard',{hasText:'Fix the tap'}).locator('.ns span',{hasText:'Buy grout'}).click();await p.waitForTimeout(200);
await p.selectOption('.gpanel select[data-g=partof]','');await p.waitForTimeout(300);
d=await doc();console.log('None: grout on its own:',!by('lone').parent);
await p.click('.gpanel [data-act=gclose].on').catch(()=>{});await p.waitForTimeout(200);
// rule 7 on planning: tick all steps of small job Fix the tap
await p.locator('.gcard .tt2',{hasText:'Fix the tap'}).click();await p.waitForTimeout(200);
for(const id of ['st1','st2'])await p.check('.gpanel input[data-act=tick][data-id='+id+']');await p.waitForTimeout(300);
d=await doc();console.log('rule 7: small job finished by itself:',!!by('sm').done,by('sm').ad);
await p.uncheck('.gpanel input[data-act=tick][data-id=st2]');await p.waitForTimeout(300);d=await doc();console.log('rule 7: reopens:',!by('sm').done);
await p.click('.gpanel [data-act=gclose].on');
// panel merge for job with steps
await p.locator('.gcard .tt2',{hasText:'Fix the tap'}).click();await p.waitForTimeout(200);
console.log('panel offers move-steps:',await p.locator('.gpanel select[data-g=mergeinto]').count());
await p.click('.gpanel [data-act=gclose].on');
// ---- phone side
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2'));l.me=0;localStorage.setItem('household.local.v2',JSON.stringify(l));localStorage.setItem('gagh.tasks.v1',JSON.stringify({v:1,updatedAt:1,activities:[{id:'p1',name:'Me',created:'x',archived:null}],tasks:[{id:'pb',text:'PERSONAL BIG',size:'big',activityId:'p1',created:'x',done:null,updated:'x'},{id:'ps',text:'Personal small',activityId:'p1',created:'x',done:null,updated:'x'}]}));});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
await p.setViewportSize({width:390,height:844});
await p.getByRole('button',{name:'Small',exact:true}).last().click();await p.waitForTimeout(300);
await p.locator('.list').getByText('Buy grout',{exact:true}).click();await p.waitForTimeout(300);
const opts=await p.locator('select[aria-label="Part of a big task"] option').allTextContents();console.log('phone options for household task:',opts.join(' | '));
await p.selectOption('select[aria-label="Part of a big task"]',{label:'Redo the bathroom'});await p.waitForTimeout(1500);
d=await doc();console.log('phone attach reached shared list:',by('lone').parent==='big1',' area:',by('lone').area);
await p.locator('.list').getByText('Personal small',{exact:true}).click();await p.waitForTimeout(300);
console.log('phone options for personal task:',(await p.locator('select[aria-label="Part of a big task"] option').allTextContents()).join(' | '));
await p.getByRole('button',{name:'Cancel',exact:true}).click();await p.waitForTimeout(200);
// phone rule 6: Fix the tap (small with subtasks) into bathroom
await p.locator('.list').getByText('Fix the tap',{exact:true}).first().click();await p.waitForTimeout(300);
await p.selectOption('select[aria-label="Move its subtasks into a big task"]',{label:'Redo the bathroom'});await p.waitForTimeout(1500);
d=await doc();console.log('phone rule 6: tap gone:',!by('sm'),' bathroom steps:',d.tasks.filter(t=>t.parent==='big1').map(t=>t.text).join(', '));
console.log('personal leaked?',JSON.stringify(d).includes('PERSONAL')||JSON.stringify(d).includes('Personal small'));
console.log('errors',errs);await b.close();})();
