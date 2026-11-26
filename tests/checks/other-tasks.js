// CHECK: other-tasks
// H1.39: on the phone a fourth button (the other person's name) beside Household / Personal / Everything shows THEIR household Big and Small lists, in their
// order, with a Waiting marker, finished tasks in view, and lets you tick, move up and down, and add. It never shows their personal tasks, and nothing
// personal reaches the shared list.
const {chromium}=require('playwright');
require('../lib/owner-named')(require('playwright').chromium);
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:900}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const doc=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')));
const ymd=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);};
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate((x)=>{
  localStorage.setItem('household.local.v2',JSON.stringify({kind:'phone',whoSet:true,me:0,code:'TESTCODE1234'}));
  const t=(id,text,o)=>Object.assign({id,text,size:'small',area:'house',to:1,done:false,n:1,updated:'2026-11-24T09:00:00Z'},o);
  localStorage.setItem('household.doc.v2',JSON.stringify({tasks:[
    t('j1','Redo the bathroom',{size:'big',r:0}),t('j1a','Choose the tiles',{parent:'j1'}),t('j1b','Get three quotes',{parent:'j1',done:'2026-11-25T10:00:00Z'}),
    t('j2','Plan the Scotland trip',{size:'big',r:10,wait:x.later}),
    t('j3','Fix the dripping tap',{r:0}),t('j4','Paint the fence',{r:10,wf:'j1'}),t('j5','Book the dentist',{r:20}),
    t('j6','Order the boiler service',{done:'2026-11-25T09:00:00Z'}),
    t('l1','Pay the house insurance',{to:0,r:0})],gone:[],day:{},cats:[]}));
},{later:ymd(9)});
await p.goto(B+'tasks.html');await p.waitForTimeout(1200);
const btns=await p.locator('.sorts .btn').allTextContents();
console.log('1 fourth button names Josh:',btns.join(' | '));
await p.locator('.sorts .btn',{hasText:'Josh'}).click();await p.waitForTimeout(500);
const txt=(await p.locator('.list').innerText());
console.log('2 shows Josh\'s tasks, not Lauren\'s:',['Redo the bathroom','Plan the Scotland trip','Fix the dripping tap','Book the dentist'].every(x=>txt.includes(x)),'| Lauren\'s hidden:',!txt.includes('Pay the house insurance'));
console.log('3 waiting markers:',await p.locator('.owait').count(),'|',(await p.locator('.owait').allTextContents()).join(' ; '));
console.log('4 done in view:',await p.locator('.odone').count(),(await p.locator('.odone').innerText()).replace(/\s+/g,' ').slice(0,60));
console.log('5 steps shown:',txt.includes('Choose the tiles'),txt.includes('Get three quotes'));
// order: Big list Redo the bathroom then Scotland; move Scotland up
const order=async()=>p.locator('.orow.big > .otext, .orow.big .otext').evaluateAll(es=>es.filter(e=>e.parentElement.classList.contains('orow')).map(e=>e.firstChild.textContent));
console.log('6 big order before:',(await order()).join(' > '));
await p.locator('[aria-label="Move up: Plan the Scotland trip"]').click();await p.waitForTimeout(500);
console.log('  big order after :',(await order()).join(' > '));
let d=await doc();console.log('7 saved to the shared list (r):',d.tasks.find(t=>t.id==='j2').r,d.tasks.find(t=>t.id==='j1').r,'| updated stamp moved:',d.tasks.find(t=>t.id==='j2').updated>'2026-11-25');
// tick a small one: becomes done and goes to Done
await p.locator('[aria-label="Tick: Book the dentist"]').click();await p.waitForTimeout(500);
d=await doc();console.log('8 tick marks done in the shared list:',!!d.tasks.find(t=>t.id==='j5').done,'| now in Done:',(await p.locator('.odone').innerText()).includes('Book the dentist'));
// untick
await p.locator('.odone [aria-label="Untick: Book the dentist"]').click();await p.waitForTimeout(500);
d=await doc();console.log('9 untick brings it back:',!d.tasks.find(t=>t.id==='j5').done);
// add
await p.fill('#oaddin','Clear the gutters');await p.locator('.oadd .btn',{hasText:'Add big task'}).click();await p.waitForTimeout(500);
d=await doc();const nt=d.tasks.find(t=>t.text==='Clear the gutters');
console.log('10 added for Josh:',!!nt&&nt.to===1&&nt.size==='big'&&!nt.done,'| shows:',(await p.locator('.list').innerText()).includes('Clear the gutters'));
// nothing personal reaches the shared list
await p.evaluate(()=>{const S=GAGH.S,n=GAGH.iso();S.activities.push({id:'w',name:'Work',created:n,updated:n});S.tasks.push({id:GAGH.uid(),text:'Private conference notes',activityId:'w',created:n,updated:n});GAGH.commit();});
await p.waitForTimeout(800);d=await doc();
console.log('11 personal task never in the shared list:',!d.tasks.some(t=>/Private conference/.test(t.text)),'| not shown on Josh\'s screen:',!(await p.locator('.list').innerText()).includes('Private conference'));
// back to Household
await p.locator('.sorts .btn',{hasText:'Household'}).click();await p.waitForTimeout(400);
console.log('12 Household button returns to own list:',(await p.locator('h2.title').first().innerText()).trim(),'| Josh\'s hidden:',!(await p.locator('body').innerText()).includes('Plan the Scotland trip'));
// no code, no button
await p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('household.local.v2'));delete l.code;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B+'tasks.html');await p.waitForTimeout(800);
console.log('13 no household code: no Josh button:',!(await p.locator('.sorts .btn',{hasText:'Josh'}).count()));
console.log('errors',JSON.stringify(errs));
await b.close();})();
