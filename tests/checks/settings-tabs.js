// CHECK: settings-tabs
// The Settings page: opened by the ⋮ button; tabs General, Link, This device, Reminders (and Help and Privacy as their own pages with the same
// row of tabs); version and update check, appearance, backup, household code, whose device, phone or computer, reminders; My day's menu has a Settings line.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(B+'?home=1');await p.waitForTimeout(300);
await p.evaluate(()=>{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');l.kind='computer';l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));});
await p.reload();await p.waitForTimeout(300);
console.log('top bar tabs:',(await p.locator('.steps button').allTextContents()).join(' | '));
await p.click('[data-act=more]');await p.waitForTimeout(200);
console.log('settings tabs:',(await p.locator('.settings .stabs').first().locator('button,a').allTextContents()).join(' | '));
console.log('General has version:',/H\d+\.\d+/.test(await p.locator('.settings').textContent()));
await p.screenshot({path:'settings_general.png'});
const before=await p.evaluate(()=>getComputedStyle(document.body).color);
await p.click('[data-act=mtheme][data-v=dark]');await p.waitForTimeout(200);
console.log('dark applied:',before!==await p.evaluate(()=>getComputedStyle(document.body).color));
await p.click('[data-act=mtheme][data-v=auto]');
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=mbackup]')]);console.log('backup file:',dl.suggestedFilename());
await p.click('[data-act=mcheck]');await p.waitForTimeout(3500);console.log('update check says:',(await p.locator('.settings').textContent()).match(/You have the newest version \(H[\d.]+\)|A new version is ready|Checking/)?.[0]);
await p.click('[data-act=stab][data-v=link]');await p.waitForTimeout(150);
console.log('Link tab, no code yet:',await p.locator('[data-act=start]').count());
await p.click('[data-act=start]');await p.waitForTimeout(1500);console.log('Link tab shows a code:',/[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(await p.locator('.settings').textContent()));
await p.click('[data-act=stab][data-v=device]');await p.waitForTimeout(150);
console.log('This device tab:',(await p.locator('.settings [data-act=whoset]').count()),'whose buttons,',(await p.locator('.settings [data-act=kindset]').count()),'kind buttons');
await p.click('[data-act=stab][data-v=reminders]');await p.waitForTimeout(150);console.log('Reminders tab:',(await p.locator('.settings').textContent()).includes('Turn on reminders')||(await p.locator('.settings').textContent()).includes('cannot show reminders'));
await p.locator('.stabs a[href="help.html"]').first().click();await p.waitForTimeout(500);
console.log('Help page tab strip:',(await p.locator('.stabs a').allTextContents()).join(' | '),'| current:',await p.locator('.stabs a.on').textContent());
await p.locator('.stabs a[href="privacy.html"]').click();await p.waitForTimeout(400);console.log('Privacy page current tab:',await p.locator('.stabs a.on').textContent());
await p.locator('.stabs a[href="./#set-link"]').click();await p.waitForTimeout(700);console.log('back in Settings, Link tab active:',await p.locator('.stabs button.on').first().textContent());
// My day's menu
await p.goto(B+'tasks.html');await p.waitForTimeout(900);await p.locator('.menubtn').click();await p.waitForTimeout(300);
console.log('Getting a grip menu has Settings:',await p.locator('span.l',{hasText:/^Settings$/}).count());
await p.locator('span.l',{hasText:/^Settings$/}).click();await p.waitForTimeout(800);console.log('it opens:',p.url().replace(B,''),'|',await p.locator('.settings h2').textContent());
console.log('errors',errs);await b.close();})();
