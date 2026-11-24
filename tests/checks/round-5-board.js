// CHECK: round-5-board
// The two-column Big and Small board: drag above, across, onto the middle (a step), and the arrows; the order is saved.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(B);await p.waitForTimeout(300);
for(const [x,sz] of [['Redo the bathroom','big'],['Clear the loft','big'],['Book the MOT','small'],['Fix the tap','small'],['Choose tiles','small']]){await p.click('[data-act=dsize][data-v='+sz+']');await p.fill('#qa',x);await p.press('#qa','Enter');await p.waitForTimeout(120);}
await p.click('[data-act=stage][data-k=group]');await p.waitForTimeout(300);
const col=async s=>(await p.locator('.gcol.'+s+' .gcard > .gtx > .tt2').allTextContents()).join(' > ');
console.log('Big:',await col('big'),' | Small:',await col('small'));
// drag Clear the loft above Redo the bathroom (top edge)
const tgt=p.locator('.gcard',{hasText:'Clear the loft'});const bb=await tgt.boundingBox();
await p.locator('.gcard',{hasText:'Redo the bathroom'}).dragTo(tgt,{targetPosition:{x:bb.width/2,y:4}});await p.waitForTimeout(300);
console.log('after drag above, Big:',await col('big'));
// drag Fix the tap into Big column (empty part)
await p.locator('.gcard',{hasText:'Fix the tap'}).dragTo(p.locator('.gcol.big'),{targetPosition:{x:100,y:10}});await p.waitForTimeout(300);
console.log('after moving across, Big:',await col('big'),' | Small:',await col('small'));
// drop Choose tiles onto middle of Redo the bathroom -> step
const t2=p.locator('.gcard',{hasText:'Redo the bathroom'});const b2=await t2.boundingBox();
await p.locator('.gcard',{hasText:'Choose tiles'}).dragTo(t2,{targetPosition:{x:b2.width/2,y:b2.height*0.7}});await p.waitForTimeout(300);
console.log('after drop onto middle, Small:',await col('small'),' bathroom has step:',(await p.locator('.gcard',{hasText:'Redo the bathroom'}).textContent()).includes('Choose tiles'));
// arrows
await p.locator('.gcard',{hasText:'Fix the tap'}).locator('[data-act=gup]').click();await p.waitForTimeout(200);console.log('after ▲ on tap, Big:',await col('big'));
await p.screenshot({path:'board.png'});
// order carries to Share out / Tasks for Lauren
const d=await p.evaluate(()=>JSON.parse(localStorage.getItem('household.doc.v2')).tasks.filter(t=>!t.parent).map(t=>t.text+':'+t.size+':'+t.r).join(', '));console.log('stored:',d);
console.log('errors',errs);await b.close();})();
