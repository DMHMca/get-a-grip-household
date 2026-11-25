// CHECK: phone-fix
// The phone fixes: the first open asks whose device it is; a phone that was stuck in Household view behind a PIN opens straight on
// Getting a grip with no PIN prompt; a phone's planning header has no person chips or Household view; and the header and buttons are slim.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const here=()=>p.url().replace(B,'')||'(planning start)';
await p.goto(B);await p.waitForTimeout(600);
console.log('1 first open asks whose device:',await p.locator('.kindbar [data-act=whoset]').count()===2);
await p.click('.kindbar [data-act=whoset][data-v="1"]');await p.waitForTimeout(200);
await p.click('[data-act=kindfirst][data-v=phone]');await p.waitForTimeout(1200);
console.log('2 chose Josh and phone:',here(),'|',await p.locator('.apphead .brand').allTextContents());
// the trap: a phone left in Household view with a PIN
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='phone';l.together=true;l.pin='abc';l.pinSalt='1';l.pinWho=0;l.me=0;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.goto(B);await p.waitForTimeout(1500);
console.log('3 stuck phone opens on:',here(),'| PIN panel:',await p.locator('#pin1').count(),'| Household view still on:',await p.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')).together));
// the planning header on a phone
await p.goto(B+'?home=1');await p.waitForTimeout(500);
console.log('4 planning header on a phone: person chips',await p.locator('.who').count(),'| Household view button',await p.locator('[data-act=together]').count(),'| tabs',(await p.locator('nav.tabs button').allTextContents()).join(' | '));
const m=await p.evaluate(()=>{var t=document.querySelector('nav.tabs').getBoundingClientRect(),b=document.querySelector('nav.tabs button').getBoundingClientRect(),h=document.querySelector('[data-act=home]').getBoundingClientRect();return {headerBottom:Math.round(t.bottom),tabHeight:Math.round(b.height),homeHeight:Math.round(h.height),overflowX:document.documentElement.scrollWidth-innerWidth};});
console.log('5 sizes (px):',JSON.stringify(m),'| slim header:',m.headerBottom<130&&m.tabHeight<=38&&m.homeHeight<=38&&m.overflowX<=0);
await p.screenshot({path:'phone_plan.png'});
// Settings on a phone: tabs scroll, nothing runs off the side
await p.click('[data-act=more]');await p.waitForTimeout(300);
const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);console.log('6 Settings on a phone, sideways overflow:',o);
await p.screenshot({path:'phone_settings.png'});
console.log('errors',errs);await b.close();})();
