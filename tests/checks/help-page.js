// CHECK: help-page
// The Help page: reachable from the planning ⋮ More panel, the welcome card and My day's ⋮ menu; its three parts and how-tos are there;
// a link with a #address opens the right section; it follows the dark setting; nothing runs off the side of a phone screen; Back returns.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(400);
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(300);
console.log('welcome card link:',await p.locator('.welcome a[href="help.html"]').count());
await p.click('[data-act=more]');await p.waitForTimeout(200);
console.log('More panel link:',await p.locator('.gpanel a[href="help.html"]').count());
await p.click('.gpanel a[href="help.html"]');await p.waitForTimeout(500);
console.log('opens Help:',await p.locator('h1').textContent());
console.log("headings:",(await p.locator("h2").allTextContents()).join(" | "));
console.log('essence paragraphs:',await p.locator('.essence h3').allTextContents());
const hows=await p.locator('details[id^=h-] > summary').allTextContents();console.log('how-tos:',hows.length);
console.log('all collapsed to start:',(await p.locator('details[id^=h-][open]').count())===0);
await p.locator('#h-board summary').click();console.log('one opens:',await p.locator('#h-board').evaluate(e=>e.open));
await p.goto(B+'help.html#h-quiet');await p.waitForTimeout(400);console.log('#h-quiet opens that section:',await p.locator('#h-quiet').evaluate(e=>e.open));
const over=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);console.log('sideways overflow at phone width (px):',over);
await p.evaluate(()=>{document.querySelectorAll('details').forEach(d=>d.open=true);});
const over2=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);console.log('overflow with everything open:',over2);
await p.screenshot({path:'help_top.png'});
await p.locator('#tech').scrollIntoViewIfNeeded();await p.screenshot({path:'help_tech.png'});
await p.evaluate(()=>localStorage.setItem('gagh.gag.theme','dark'));await p.reload();await p.waitForTimeout(300);
console.log('dark follows the app:',await p.evaluate(()=>document.documentElement.getAttribute('data-theme')),await p.evaluate(()=>getComputedStyle(document.body).backgroundColor));
await p.screenshot({path:'help_dark.png'});
await p.evaluate(()=>localStorage.removeItem('gagh.gag.theme'));
// from My day
await p.goto(B+'tasks.html');await p.waitForTimeout(900);await p.locator('.menubtn').click();await p.waitForTimeout(300);
console.log('My day menu link:',await p.locator('a[href="help.html"]').count());
await p.locator('a[href="help.html"]').click();await p.waitForTimeout(500);
await p.locator('.back').first().click();await p.waitForTimeout(700);console.log('Back returns to:',p.url().replace(B,'')||'(planning)');
console.log('errors',errs);await b.close();})();
