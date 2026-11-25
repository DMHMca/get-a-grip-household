// CHECK: qr-link
// H1.35: the household code (and the personal code) can be passed on as a QR code or a link. The QR code is drawn on the Link tab and decoded with a real
// QR reader (jsQR; skipped with a note if it is not installed: NODE_PATH must reach it), a second device opens the link and is linked at once,
// a link to a different household asks first, and the email / copy buttons carry the link.
const {chromium}=require('playwright');
const B='http://localhost:8765/get-a-grip-household/';
let jsQR=null;try{jsQR=require('jsqr');}catch(e){}
(async()=>{const b=await chromium.launch();
const mk=async()=>{const c=await b.newContext({viewport:{width:1100,height:1200},permissions:['clipboard-read','clipboard-write']});const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());return p;};
const A=await mk();
await A.goto(B+'?home=1');await A.waitForTimeout(300);
await A.evaluate(()=>{localStorage.setItem('household.local.v2',JSON.stringify({kind:'computer',whoSet:true,me:0,code:'K7QD4XMB92TH'}));});
await A.reload();await A.waitForTimeout(300);await A.goto(B+'#set-link');await A.waitForTimeout(500);
console.log('1 QR drawn on the Link tab:',await A.locator('.sharebox .qr svg').count(),'| buttons:',(await A.locator('.sharebox button').allTextContents()).join(' / '));
if(jsQR){
  const png=await A.locator('.sharebox .qr').screenshot();
  const dec=await A.evaluate(async(b64)=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);return {w:c.width,h:c.height,data:Array.from(d.data)};},png.toString('base64'));
  const r=jsQR(Uint8ClampedArray.from(dec.data),dec.w,dec.h);
  console.log('2 a real QR reader decodes it to:',r&&r.data);
}else console.log('2 (QR reader not installed here: decode check skipped)');
await A.locator('button[data-act=joincopy]').first().click();await A.waitForTimeout(200);
console.log('3 Copy the link puts this on the clipboard:',await A.evaluate(()=>navigator.clipboard.readText()));
// a second device opens the link
const P=await mk();
await P.goto(B+'?home=1');await P.waitForTimeout(200);
await P.goto(B+'?join=K7QD-4XMB-92TH');await P.waitForTimeout(700);
const l=await P.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'));
console.log('4 opening the link links the device:',l.code,'| address cleaned:',P.url().replace(B,'')||'(clean)','| status:',(await P.locator('#st').textContent()));
// a different household asks first (dialogs accepted in this test)
let asked=false;P.removeAllListeners('dialog');P.on('dialog',d=>{asked=true;d.dismiss();});
await P.goto(B+'?join=ZZZZZZZZZZZZ');await P.waitForTimeout(500);
console.log('5 a link to another household asks, and "no" keeps the old one:',asked,'|',(await P.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'))).code);
// personal link
const Q=await mk();await Q.goto(B+'?pjoin=ABCD-EFGH-JKLM-NPQR');await Q.waitForTimeout(600);
const ql=await Q.evaluate(()=>JSON.parse(localStorage.getItem('household.local.v2')||'{}'));
console.log('6 a personal link joins personal sync:',ql.pcode,'| join flag:',ql.pjoin,'| household untouched:',!ql.code);
console.log('errors',[...A.errs,...P.errs,...Q.errs]);await b.close();})();
