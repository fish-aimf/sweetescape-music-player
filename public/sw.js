const CACHE_PREFIX = "se-cache-";

const THUMB_CACHE = "se-thumbs-v1";

const THUMB_HOSTS = [ "i.ytimg.com", "img.youtube.com" ];

const THUMB_LIMIT = 400;

const VERSION_TIMEOUT_MS = 2500;

let activeCacheName = null;

let thumbTrimPending = false;

async function getActiveCacheName() {
  if (activeCacheName) return activeCacheName;
  const names = await caches.keys();
  activeCacheName = names.find(n => n.startsWith(CACHE_PREFIX)) || null;
  return activeCacheName;
}

const STATIC_ASSETS = [ "/", "/index.html", "/style.css", "/ui-system.css", "/all.min.css", "/script.js", "/karaoke-encoder.js", "/favicon.svg" ];

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function getStoredVersion(cacheName) {
  const cache = await caches.open(cacheName);
  const res = await cache.match("__version_marker__");
  if (!res) return null;
  return (await res.text()).trim();
}

async function setStoredVersion(cacheName, version) {
  const cache = await caches.open(cacheName);
  await cache.put("__version_marker__", new Response(version));
}

async function fetchLiveVersion() {
  const res = await Promise.race([ fetch("/current-version.txt", {
    cache: "no-store"
  }), timeout(VERSION_TIMEOUT_MS) ]);
  if (!res.ok) throw new Error("bad response");
  return (await res.text()).trim();
}

async function precache(cacheName) {
  const cache = await caches.open(cacheName);
  await Promise.all(STATIC_ASSETS.map(async url => {
    try {
      const res = await fetch(url);
      if (res.ok) await cache.put(url, res);
    } catch (err) {
      console.warn("[sw] failed to precache", url, err);
    }
  }));
}

async function deleteOldCaches(currentCacheName) {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n.startsWith(CACHE_PREFIX) && n !== currentCacheName).map(n => caches.delete(n)));
}

function cacheNameFor(version) {
  return `${CACHE_PREFIX}${version || "initial"}`;
}

async function refreshAllAssets(newVersion) {
  const newCacheName = cacheNameFor(newVersion);
  const cache = await caches.open(newCacheName);
  await Promise.all(STATIC_ASSETS.map(async url => {
    try {
      const res = await fetch(url, {
        cache: "no-store"
      });
      if (res.ok) await cache.put(url, res.clone());
    } catch (err) {
      console.warn("[sw] failed to refresh", url, err);
    }
  }));
  await setStoredVersion(newCacheName, newVersion);
  activeCacheName = newCacheName;
  await deleteOldCaches(newCacheName);
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    let version = "initial";
    try {
      version = await fetchLiveVersion();
    } catch {}
    const cacheName = cacheNameFor(version);
    await precache(cacheName);
    await setStoredVersion(cacheName, version);
    activeCacheName = cacheName;
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const current = names.find(n => n.startsWith(CACHE_PREFIX));
    if (current) {
      activeCacheName = current;
      await deleteOldCaches(current);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    if (event.request.method === "GET" && THUMB_HOSTS.includes(url.hostname) && url.pathname.startsWith("/vi/")) {
      event.respondWith(handleThumbnailRequest(url));
    }
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    return;
  }
  if (url.pathname === "/current-version.txt") {
    event.respondWith(handleVersionRequest());
    return;
  }
  if (event.request.method === "GET") {
    event.respondWith(handleStaticRequest(event.request));
  }
});

async function handleThumbnailRequest(url) {
  const canonical = `https://i.ytimg.com${url.pathname}`;
  const cache = await caches.open(THUMB_CACHE);
  const cached = await cache.match(canonical);
  if (cached) return cached;
  try {
    const res = await fetch(canonical, {
      mode: "cors",
      credentials: "omit"
    });
    if (res.ok) {
      await cache.put(canonical, res.clone());
      trimThumbnailCache();
    }
    return res;
  } catch (err) {
    try {
      return await fetch(canonical, {
        mode: "no-cors"
      });
    } catch (fallbackErr) {
      return new Response("", {
        status: 504
      });
    }
  }
}

async function trimThumbnailCache() {
  if (thumbTrimPending) return;
  thumbTrimPending = true;
  try {
    const cache = await caches.open(THUMB_CACHE);
    const keys = await cache.keys();
    if (keys.length > THUMB_LIMIT) {
      await Promise.all(keys.slice(0, keys.length - THUMB_LIMIT).map(k => cache.delete(k)));
    }
  } catch (err) {
    console.warn("[sw] thumbnail cache trim failed", err);
  } finally {
    thumbTrimPending = false;
  }
}

async function handleStaticRequest(request) {
  const cacheName = await getActiveCacheName();
  if (cacheName) {
    const cached = await caches.match(request, {
      cacheName: cacheName
    });
    if (cached) return cached;
  }
  try {
    const res = await fetch(request);
    if (res.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch (err) {
    return new Response("Offline and not cached.", {
      status: 503
    });
  }
}

async function handleVersionRequest() {
  const cacheName = await getActiveCacheName();
  const storedVersion = cacheName ? await getStoredVersion(cacheName) : null;
  let liveVersion;
  try {
    liveVersion = await fetchLiveVersion();
  } catch {
    return new Response(storedVersion || "unknown", {
      status: 200
    });
  }
  if (liveVersion !== storedVersion) {
    refreshAllAssets(liveVersion).then(async () => {
      const clientsList = await self.clients.matchAll({
        type: "window"
      });
      clientsList.forEach(c => c.postMessage({
        type: "SW_UPDATED",
        version: liveVersion
      }));
    }).catch(err => console.warn("[sw] background refresh failed", err));
  }
  return new Response(liveVersion, {
    status: 200
  });
}