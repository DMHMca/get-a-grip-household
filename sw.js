const CACHE='gagh-v6';
const SCOPE=new URL(self.registration.scope).pathname;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./manifest.webmanifest']).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gagh-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(SCOPE))return;
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{});return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));
});

/* REMINDERS. The household store sends an empty push; the text waits on the store and is collected here. */
const STORE='https://household-store.dmhmca-apps.workers.dev';
self.addEventListener('push',e=>{
  e.waitUntil(self.registration.pushManager.getSubscription()
    .then(s=>s?fetch(STORE+'/msg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:s.endpoint})}).then(r=>r.json()):[])
    .catch(()=>[])
    .then(list=>{
      if(!list||!list.length)list=[{title:'Get a Grip Household',body:'A household job is coming up. Open My day to see it.'}];
      return Promise.all(list.map((m,i)=>self.registration.showNotification(m.title,{body:m.body,icon:'icon-192.png',badge:'icon-192.png',tag:'gagh-'+Date.now()+'-'+i})));
    }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL('tasks.html',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.indexOf('/get-a-grip-household/')>-1&&'focus' in w){w.navigate(url);return w.focus();}}return clients.openWindow(url);}));
});
