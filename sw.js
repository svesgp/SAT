/* SAT Ascent service worker — offline support for the practice app.
   Strategy: network-first for the shell (index.html) and deploy-built files
   (app-config.js, update-log.json) so updates always arrive; cache-first for
   versioned data files (module banks, icons). Cross-origin API calls (AI tutor,
   Desmos, cloud save) are never cached. */
const VERSION  = "satasc-v4-20261121";
const SHELL    = ["./", "./index.html", "./manifest.webmanifest",
                  "./assets/icon-192.png", "./assets/icon-512.png"];
const NETFIRST = ["./assets/app-config.js", "./data/update-log.json", "./data/modules/extra.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // AI / Desmos / cloud APIs: live only
  const path = url.pathname.replace(/.*\/SAT\//, "/");
  const isNetFirst = req.mode === "navigate" ||
                     NETFIRST.some(p => path.endsWith(p.replace("./","/")) ) ||
                     url.pathname.endsWith("app-config.js") || url.pathname.endsWith("update-log.json");
  if (isNetFirst) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
    );
  } else {
    e.respondWith(
      caches.match(req).then(m => m ||
        fetch(req).then(r => {
          const copy = r.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
          return r;
        })
      )
    );
  }
});
