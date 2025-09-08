/**
 * Service Worker for MatTailor AI PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'mattailor-ai-v1';
const API_CACHE_NAME = 'mattailor-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/main.css',
  '/src/index.css',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/health',
  '/materials/search',
  '/recommend'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(event.request));
});

/**
 * Handle API requests with cache-first strategy for certain endpoints
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cacheName = API_CACHE_NAME;
  
  // For GET requests to cacheable endpoints
  if (request.method === 'GET' && isCacheableApiEndpoint(url.pathname)) {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful response
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      
      // If network fails, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return networkResponse;
    } catch (error) {
      // Network error - try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline fallback
      return new Response(
        JSON.stringify({ 
          error: 'Network unavailable',
          offline: true,
          message: 'Please check your connection and try again'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For non-cacheable requests, just try network
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

/**
 * Check if API endpoint should be cached
 */
function isCacheableApiEndpoint(pathname) {
  return API_ENDPOINTS.some(endpoint => pathname.includes(endpoint));
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Handle background sync
 */
async function doBackgroundSync() {
  console.log('Background sync triggered');
  
  // Process any queued requests
  const cache = await caches.open('sync-requests');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
      console.log('Synced request:', request.url);
    } catch (error) {
      console.log('Failed to sync request:', request.url, error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/materials/' + event.notification.data.primaryKey)
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_MATERIAL') {
    event.waitUntil(cacheMaterial(event.data.material));
  }
});

/**
 * Cache material data for offline access
 */
async function cacheMaterial(material) {
  const cache = await caches.open('materials-cache');
  const response = new Response(JSON.stringify(material), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put(`/materials/${material.id}`, response);
}
