const CACHE="biopulse-v3";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener("activate",function(e){
  e.waitUntil(
    caches.keys().then(function(keys){return Promise.all(
      keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})
    );})
  );
  self.clients.claim();
});

self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached)return cached;
      return fetch(e.request).then(function(res){
        if(res.ok&&e.request.url.startsWith(self.location.origin)){
          var clone=res.clone();
          caches.open(CACHE).then(function(c){c.put(e.request,clone);});
        }
        return res;
      }).catch(function(){return caches.match("./index.html");});
    })
  );
});

self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var data=e.notification.data||{};
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      var c=list[i];
      if(c.url.includes("index.html")){
        c.postMessage({type:"alarm-fire",data:data});
        return c.focus();
      }
    }
    return clients.openWindow("./#alarm-fired");
  }));
});

self.addEventListener("message",function(e){
  if(e.data&&e.data.type==="alarm-ring"){
    var d=e.data.data||{};
    var title="\uD83D\uDD14 ALARM";
    var body=d.label||"Time is up!";
    var high=d.priority==="high";
    self.registration.showNotification(title,{
      body:body,
      icon:"icon-192.png",
      badge:"icon-192.png",
      vibrate:[400,200,400,200,800],
      tag:"alarm-"+(d.id||Date.now()),
      renotify:true,
      requireInteraction:true,
      data:{alarmId:d.id,label:d.label,priority:d.priority},
      actions:[{action:"open",title:"\u2714 Open & Dismiss"}]
    });
  }
});