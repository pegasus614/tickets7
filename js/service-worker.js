const CACHE_NAME = "tickets-app-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./css/new.css",
  "./js/main.js",
  "./icon/ticket-192.png",
  "./icon/ticket-512.png"
];

// ✅ Install & Cache Core Files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ✅ Activate & Remove Old Cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});

// ✅ Fetch — Skip Google Maps + Show Offline Page
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // 🚫 Skip caching Google Maps or other external requests
  if (
    url.includes("google.com/maps") ||
    url.includes("gstatic.com") ||
    url.includes("maps.googleapis.com")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Show offline fallback for HTML requests
          if (event.request.destination === "document") {
            return new Response(
              `
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      text-align: center;
                      padding: 50px;
                      background: #f5f5f5;
                      color: #333;
                    }
                    h1 { color: #007aff; }
                    button {
                      background: #007aff;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      font-size: 16px;
                      cursor: pointer;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <h1>🔌 You’re Offline</h1>
                  <p>It looks like you’ve lost connection.<br>
                  Don’t worry — your tickets are still safe.</p>
                  <button onclick="location.reload()">Try Again</button>
                </body>
                </html>
              `,
              { headers: { "Content-Type": "text/html" } }
            );
          }
        })
      );
    })
  );
});
