const CACHE_PREFIX = "se-cache-";

const THUMB_CACHE = "se-thumbs-v1";

const CONFIG_CACHE = "se-config-v1";

const THUMB_HOSTS = [ "i.ytimg.com", "img.youtube.com" ];

const THUMB_LIMIT = 3000;

const THUMB_SIZES = [ "maxresdefault", "sddefault", "hqdefault", "mqdefault", "default" ];

const SAVE_PARAM = "se-save";

const VERSION_TIMEOUT_MS = 2500;

const VERSION_MARKER = "__version_marker__";

const DATA_SAVER_KEY = "__data_saver__";

const UPDATE_HOLD_MS = 7 * 24 * 60 * 60 * 1000;

const PLACEHOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#808080" fill-opacity="0.22"/></svg>';

let activeCacheName = null;

let thumbTrimPending = false;

let dataSaver = null;

let refreshPromise = null;

async function getActiveCacheName() {
  if (activeCacheName) return activeCacheName;
  const names = await caches.keys();
  activeCacheName = names.filter(n => n.startsWith(CACHE_PREFIX)).pop() || null;
  return activeCacheName;
}

const NETWORK_ONLY_PREFIXES = [ "/api/", "/guide/", "/learn/", "/introduction", "/tutorial" ];

const STATIC_ASSETS = [ "/", "/index.html", "/style.css", "/ui-system.css", "/all.min.css", "/script.js", "/karaoke-encoder.js", "/favicon.svg", "/lite", "/lite.js", "/lite.css", "/register-sw.js", "/webfonts/fa-solid-900.woff2", "/manifest.webmanifest", "/icons/icon-192.png" ];

const EXTRA_ASSETS = [ "/webfonts/fa-regular-400.woff2", "/webfonts/fa-brands-400.woff2" ];

const ALIASES = {
  "/index.html": "/"
};

const CARRIED_EXTENSIONS = /\.(css|js|woff2?|ttf|png|svg|jpe?g|webp|ico|webmanifest)$/;

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function getStoredVersion(cacheName) {
  const cache = await caches.open(cacheName);
  const res = await cache.match(VERSION_MARKER);
  if (!res) return null;
  return (await res.text()).trim();
}

async function setStoredVersion(cacheName, version) {
  const cache = await caches.open(cacheName);
  await cache.put(VERSION_MARKER, new Response(version, {
    headers: {
      "X-Saved-At": String(Date.now())
    }
  }));
}

async function fetchLiveVersion() {
  const res = await Promise.race([ fetch("/current-version.txt", {
    cache: "no-store"
  }), timeout(VERSION_TIMEOUT_MS) ]);
  if (!res.ok) throw new Error("bad response");
  return (await res.text()).trim();
}

async function getDataSaver() {
  if (dataSaver) return dataSaver;
  try {
    const res = await (await caches.open(CONFIG_CACHE)).match(DATA_SAVER_KEY);
    dataSaver = res ? await res.json() : {};
  } catch {
    dataSaver = {};
  }
  return dataSaver;
}

async function setDataSaver(value) {
  dataSaver = value;
  const cache = await caches.open(CONFIG_CACHE);
  await cache.put(DATA_SAVER_KEY, new Response(JSON.stringify(value), {
    headers: {
      "Content-Type": "application/json"
    }
  }));
}

async function carriedAssets(cache) {
  if (!cache) return [];
  const requests = await cache.keys();
  return requests.map(request => new URL(request.url)).filter(url => url.origin === self.location.origin && CARRIED_EXTENSIONS.test(url.pathname)).map(url => url.pathname + url.search);
}

async function revalidate(url, oldCache) {
  const cached = oldCache ? await oldCache.match(url) : null;
  const headers = {};
  const etag = cached?.headers.get("etag");
  const modified = cached?.headers.get("last-modified");
  if (etag) {
    headers["If-None-Match"] = etag;
  } else if (modified) {
    headers["If-Modified-Since"] = modified;
  }
  const res = await fetch(url, cached ? {
    cache: "no-store",
    headers: headers
  } : {
    cache: "no-cache"
  });
  if (res.status === 304 && cached) return cached;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function fillCache(cacheName, extra = []) {
  const previousName = await getActiveCacheName();
  const oldCache = previousName ? await caches.open(previousName) : null;
  const cache = await caches.open(cacheName);
  const urls = [ ...new Set([ ...STATIC_ASSETS, ...await carriedAssets(oldCache), ...extra ]) ].filter(url => !ALIASES[url]);
  await Promise.all(urls.map(async url => {
    try {
      const res = await revalidate(url, oldCache);
      const aliases = Object.keys(ALIASES).filter(alias => ALIASES[alias] === url);
      await Promise.all(aliases.map(alias => cache.put(alias, res.clone())));
      await cache.put(url, res);
    } catch (err) {
      console.warn("[sw] failed to cache", url, err);
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

async function refreshAllAssets(newVersion, extra = []) {
  const newCacheName = cacheNameFor(newVersion);
  await fillCache(newCacheName, extra);
  await setStoredVersion(newCacheName, newVersion);
  activeCacheName = newCacheName;
  await deleteOldCaches(newCacheName);
}

async function updateHeld(cacheName) {
  const saver = await getDataSaver();
  if (!saver.updates) return false;
  const type = self.navigator.connection?.type;
  if (type === "wifi" || type === "ethernet") return false;
  const marker = await (await caches.open(cacheName)).match(VERSION_MARKER);
  const savedAt = Number(marker?.headers.get("X-Saved-At")) || 0;
  return Date.now() - savedAt < UPDATE_HOLD_MS;
}

async function cacheApp() {
  let version = null;
  try {
    version = await fetchLiveVersion();
  } catch {}
  const cacheName = await getActiveCacheName();
  const stored = cacheName ? await getStoredVersion(cacheName) : null;
  if (!cacheName || version && version !== stored) {
    await refreshAllAssets(version || stored || "initial", EXTRA_ASSETS);
    return;
  }
  await fillCache(cacheName, EXTRA_ASSETS);
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    let version = "initial";
    try {
      version = await fetchLiveVersion();
    } catch {}
    const cacheName = cacheNameFor(version);
    await fillCache(cacheName);
    await setStoredVersion(cacheName, version);
    activeCacheName = cacheName;
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const current = activeCacheName || names.filter(n => n.startsWith(CACHE_PREFIX)).pop();
    if (current) {
      activeCacheName = current;
      await deleteOldCaches(current);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  const data = event.data || {};
  if (data.type === "DATA_SAVER") {
    event.waitUntil(setDataSaver({
      thumbs: data.thumbs === true,
      images: data.images === true,
      updates: data.updates === true
    }));
  } else if (data.type === "CACHE_APP") {
    event.waitUntil(cacheApp().catch(err => console.warn("[sw] caching the app failed", err)).finally(() => event.ports[0]?.postMessage({
      type: "CACHE_APP_DONE"
    })));
  }
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    if (event.request.method !== "GET") return;
    if (THUMB_HOSTS.includes(url.hostname) && url.pathname.startsWith("/vi/")) {
      event.respondWith(handleThumbnailRequest(url, event.request.mode));
    } else if (event.request.destination === "image" && dataSaver?.images) {
      event.respondWith(handleBlockedImage(event.request));
    }
    return;
  }
  if (NETWORK_ONLY_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
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

function placeholderImage() {
  return new Response(PLACEHOLDER_SVG, {
    headers: {
      "Content-Type": "image/svg+xml"
    }
  });
}

async function handleBlockedImage(request) {
  return await caches.match(request) || placeholderImage();
}

async function cachedThumbnail(cache, video) {
  if (!video) return null;
  for (const size of THUMB_SIZES) {
    const other = await cache.match(`https://i.ytimg.com/vi/${video}/${size}.jpg`);
    if (other) return other;
  }
  return null;
}

async function handleThumbnailRequest(url, mode) {
  const canonical = `https://i.ytimg.com${url.pathname}`;
  const cache = await caches.open(THUMB_CACHE);
  const cached = await cache.match(canonical);
  if (cached) return cached;
  const saver = url.searchParams.has(SAVE_PARAM) ? {} : await getDataSaver();
  const video = url.pathname.match(/^\/vi\/([^/]+)\/\w+\.jpg$/)?.[1];
  if (saver.thumbs || saver.images) {
    const other = await cachedThumbnail(cache, video);
    if (other) return other;
  }
  if (saver.images) return placeholderImage();
  const source = video && saver.thumbs ? `https://i.ytimg.com/vi/${video}/default.jpg` : canonical;
  try {
    const res = await fetch(source, {
      mode: "cors",
      credentials: "omit"
    });
    if (res.ok) {
      await cache.put(source, res.clone());
      trimThumbnailCache();
    }
    return res;
  } catch (err) {
    if (mode === "no-cors") {
      try {
        return await fetch(source, {
          mode: "no-cors"
        });
      } catch {}
    }
    return await cachedThumbnail(cache, video) || placeholderImage();
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
    if (storedVersion && await updateHeld(cacheName)) {
      return new Response(storedVersion, {
        status: 200
      });
    }
    refreshPromise = refreshPromise || refreshAllAssets(liveVersion).then(async () => {
      const clientsList = await self.clients.matchAll({
        type: "window"
      });
      clientsList.forEach(c => c.postMessage({
        type: "SW_UPDATED",
        version: liveVersion
      }));
    }).catch(err => console.warn("[sw] background refresh failed", err)).finally(() => {
      refreshPromise = null;
    });
  }
  return new Response(liveVersion, {
    status: 200
  });
}

getDataSaver();
