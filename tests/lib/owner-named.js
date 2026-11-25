// Makes every browser context in a check start with a NAMED owner (whoSet true). Since H1.34 a device with no named owner takes no household jobs,
// and most checks are about what happens after a device has been set up. First-run checks (device-kind, phone-fix, owner-needed) do not use this.
module.exports=function(chromium){
  const launch=chromium.launch.bind(chromium);
  chromium.launch=async function(...a){
    const b=await launch(...a);const nc=b.newContext.bind(b);
    b.newContext=async function(...c){const ctx=await nc(...c);
      await ctx.addInitScript(()=>{try{var l=JSON.parse(localStorage.getItem('household.local.v2')||'{}');if(l.whoSet!==true){l.whoSet=true;localStorage.setItem('household.local.v2',JSON.stringify(l));}}catch(e){}});return ctx;};
    return b;};
};
