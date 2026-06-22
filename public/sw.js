const CACHE_PREFIX = "se-cache-";
const IMAGE_HOSTS = ["img.youtube.com", "i.ytimg.com"];
const IMAGE_CACHE = "se-image-cache";
const IMAGE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const VERSION_TIMEOUT_MS = 2500;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/all.min.css",
  "/script.js",
  "/karaoke-encoder.js",
  "/favicon.svg"
];

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
  const res = await Promise.race([
    fetch("/current-version.txt", { cache: "no-store" }),
    timeout(VERSION_TIMEOUT_MS)
  ]);
  if (!res.ok) throw new Error("bad response");
  return (await res.text()).trim();
}

async function precache(cacheName) {
  const cache = await caches.open(cacheName);
  await cache.addAll(STATIC_ASSETS);
}

async function deleteOldCaches(currentCacheName) {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((n) => n.startsWith(CACHE_PREFIX) && n !== currentCacheName)
      .map((n) => caches.delete(n))
  );
}

function cacheNameFor(version) {
  return `${CACHE_PREFIX}${version || "initial"}`;
}
async function refreshAllAssets(newVersion) {
  const newCacheName = cacheNameFor(newVersion);
  const cache = await caches.open(newCacheName);
  await Promise.all(
    STATIC_ASSETS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) await cache.put(url, res.clone());
      } catch (err) {
        console.warn("[sw] failed to refresh", url, err);
      }
    })
  );
  await setStoredVersion(newCacheName, newVersion);
  await deleteOldCaches(newCacheName);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      let version = "initial";
      try {
        version = await fetchLiveVersion();
      } catch {
      }
      const cacheName = cacheNameFor(version);
      await precache(cacheName);
      await setStoredVersion(cacheName, version);
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      const current = names.find((n) => n.startsWith(CACHE_PREFIX));
      if (current) await deleteOldCaches(current);
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (IMAGE_HOSTS.includes(url.hostname)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname === "/current-version.txt") {
    event.respondWith(handleVersionRequest());
    return;
  }

  event.respondWith(handleStaticRequest(event.request));
});

async function handleStaticRequest(request) {
  const names = await caches.keys();
  const cacheName = names.find((n) => n.startsWith(CACHE_PREFIX));
  if (cacheName) {
    const cached = await caches.match(request, { cacheName });
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
    return new Response("Offline and not cached.", { status: 503 });
  }
}

async function handleVersionRequest() {
  const names = await caches.keys();
  const cacheName = names.find((n) => n.startsWith(CACHE_PREFIX));
  const storedVersion = cacheName ? await getStoredVersion(cacheName) : null;

  let liveVersion;
  try {
    liveVersion = await fetchLiveVersion();
  } catch {
    return new Response(storedVersion || "unknown", { status: 200 });
  }

  if (liveVersion !== storedVersion) {
    refreshAllAssets(liveVersion).catch((err) =>
      console.warn("[sw] background refresh failed", err)
    );
  }

  return new Response(liveVersion, { status: 200 });
}


async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    const fetchedOn = cached.headers.get("x-sw-fetched-on");
    const age = fetchedOn ? Date.now() - Number(fetchedOn) : Infinity;
    if (age < IMAGE_MAX_AGE_MS) {
      if (age > IMAGE_MAX_AGE_MS / 2) revalidateImage(request, cache);
      return cached;
    }
  }

  try {
    const res = await fetch(request, { mode: "no-cors" });
    const blob = await res.blob();
    if (blob.size > 0) {
      const toStore = new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": blob.type || "image/jpeg",
          "x-sw-fetched-on": String(Date.now()),
        },
      });
      cache.put(request, toStore.clone());
      return toStore;
    }
    return cached || inlineSvgFallback();
  } catch {
    return cached || inlineSvgFallback();
  }
}

function revalidateImage(request, cache) {
  fetch(request).then(res => {
    if (res.ok) {
      res.blob().then(blob => {
        cache.put(request, new Response(blob, {
          status: res.status,
          headers: {
            ...Object.fromEntries(res.headers),
            "x-sw-fetched-on": String(Date.now()),
          },
        }));
      });
    }
  }).catch(() => {});
}

function inlineSvgFallback() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">' +
    '<rect width="120" height="90" fill="#333"/>' +
    '<text x="60" y="48" fill="#fff" font-size="11" ' +
    'font-family="sans-serif" text-anchor="middle">No Image</text></svg>';
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });
}
