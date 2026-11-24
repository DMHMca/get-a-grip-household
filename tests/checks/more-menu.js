// CHECK: more-menu
// The More menu: version, appearance (light and dark), backup download, update check.
// Run through tests/run.sh (it serves the repository at http://localhost:8765/get-a-grip-household/ and passes a sample data file where one is named).
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B);await p.waitForTimeout(1500);
const bg=()=>p.evaluate(()=>getComputedStyle(document.body).color);
console.log('foot:',await p.locator('p.sub',{hasText:'version'}).last().textContent());
await p.click('[data-act=more]');await p.waitForTimeout(200);
console.log('More shows version:',(await p.locator('.gpanel').textContent()).match(/version H\d+\.\d+|version H\d+/)!==null);
await p.screenshot({path:'more.png'});
const before=await bg();await p.click('[data-act=mtheme][data-v=dark]');await p.waitForTimeout(200);const after=await bg();console.log('dark applied (text colour changed):',before!==after,before,after);
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=mbackup]')]);console.log('backup file:',dl.suggestedFilename());
await p.click('[data-act=mcheck]');await p.waitForTimeout(3500);console.log('check:',await p.locator('.gpanel').textContent().then(t=>t.match(/You have the newest version \(H[\d.]+\)|A new version is ready|Checking/)?.[0]));
await p.click('.gpanel [data-act=mclose].on');await p.waitForTimeout(200);console.log('closed:',await p.locator('.gpanel').count()===0);
await p.goto(B+'tasks.html');await p.waitForTimeout(800);console.log('My day dark too:',await p.evaluate(()=>document.documentElement.getAttribute('data-theme')));
await p.locator('.menubtn').click();await p.waitForTimeout(200);console.log('My day version:',(await p.textContent('body')).match(/Version H\d/)!==null);
await p.goto(B);await p.waitForTimeout(500);await p.screenshot({path:'dark.png'});
console.log('errors',errs);await b.close();})();
