const CACHE_VERSION = "v1.0.2";
const STATIC_CACHE = `goalaxify-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `goalaxify-dynamic-${CACHE_VERSION}`;
const API_CACHE = `goalaxify-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/assets/logo/logo-192x192.png",
  "/assets/logo/logo-512x512.png",
  "/assets/logo/logo.png",
];

function isCacheableResponse(response) {
  // Cache API rejects partial (206) and other non-200 success responses.
  return response.status === 200 && response.type !== "error";
}

async function putInCache(cache, request, response) {
  if (!isCacheableResponse(response)) {
    return;
  }

  try {
    await cache.put(request, response);
  } catch {
    // Ignore cache write failures for unsupported response shapes.
  }
}

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Goalaxify - Offline</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ff5a45" />
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 2rem;
        background: #0b1324;
        color: #f8fafc;
        margin: 0;
      }
      .container {
        max-width: 400px;
        margin: 0 auto;
        background: #152238;
        padding: 2rem;
        border-radius: 1rem;
        border: 1px solid #243047;
      }
      .emoji { font-size: 3rem; margin-bottom: 1rem; }
      h1 { color: #ff5a45; margin-bottom: 1rem; font-size: 1.5rem; }
      p { color: #94a3b8; line-height: 1.5; }
      button {
        background: #ff5a45;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        cursor: pointer;
        margin-top: 1rem;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="emoji">⚽</div>
      <h1>You're Offline</h1>
      <p>Goalaxify needs a connection for live matches and voice predictions. Check your network and try again.</p>
      <button onclick="window.location.reload()">Try Again</button>
    </div>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            await putInCache(staticCache, asset, response);
          } catch {
            // Best-effort precache.
          }
        }),
      );
    })(),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];

      await Promise.all(
        cacheNames
          .filter((cacheName) => !validCaches.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName)),
      );
    })(),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // Never intercept dev server, HMR, or Next.js build chunks.
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.pathname.startsWith("/_next/") ||
    url.search.includes("turbopack")
  ) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  if (request.destination === "image" || url.pathname.startsWith("/assets/")) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  event.respondWith(handleGenericRequest(request));
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);
    await putInCache(cache, request, response.clone());
    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: "Offline - no cached data available",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    );
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    await putInCache(cache, request, response.clone());
    return response;
  } catch {
    return new Response("Asset not available offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const response = await fetch(request);
    await putInCache(cache, request, response.clone());
    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const rootResponse = await cache.match("/");
    if (rootResponse) {
      return rootResponse;
    }

    return new Response(OFFLINE_HTML, {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/html" },
    });
  }
}

async function handleGenericRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    await putInCache(cache, request, response.clone());
    return response;
  } catch {
    return new Response("Content not available offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
