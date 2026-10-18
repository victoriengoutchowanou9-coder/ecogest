// ============================================================================
// ECOGEST PRO — SERVICE WORKER PWA OFFICIEL
// Politique de cache sécurisée : Aucune donnée privée/métier n'est mise en cache.
// ============================================================================

const CACHE_VERSION = 'ecogest-v3.3.0';
const STATIC_CACHE_NAME = `ecogest-static-${CACHE_VERSION}`;
const SHELL_CACHE_NAME = `ecogest-shell-${CACHE_VERSION}`;

// Ressources statiques d'application essentielles à mettre en cache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/offline.html',
];

// 1. Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      // Préchargement sans bloquer si un fichier échoue
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[sw] Pré-mise en cache ignorée pour ${url}:`, err);
          })
        )
      );
    })
  );
  // Ne pas forcer brutalement avant l'accord de l'utilisateur pour éviter les incohérences
  self.skipWaiting();
});

// 2. Activation & Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== SHELL_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Gestionnaire d'interception des requêtes (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ⚠️ SÉCURITÉ STRICTE (Requirement 6) :
  // NE JAMAIS mettre en cache les requêtes d'API internes ou externes
  // (Supabase, /api/*, authentification, paiements, élèves, notes, dev-admin, etc.)
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/auth/') ||
    url.searchParams.has('action')
  ) {
    // Passer directement au réseau sans aucun cache
    return;
  }

  // A. Fichiers statiques immuables (images, favicons, icônes, CSS, JS Next.js)
  // Stratégie : Stale-While-Revalidate pour rapidité maximale
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // B. Requêtes de navigation (Pages HTML)
  // Stratégie : Network-First avec repli propre
  // Garantit que l'utilisateur reçoit toujours la version à jour en ligne
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Mettre en cache la page reçue pour le mode hors-ligne
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // En cas de coupure réseau complète, tenter d'afficher la page en cache ou la page offline
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html') || new Response(
              '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>ECOGEST Hors-ligne</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Vous êtes actuellement hors-ligne</h2><p>Vérifiez votre connexion Internet pour continuer à utiliser ECOGEST.</p></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        })
    );
    return;
  }
});

// 4. Écoute des messages pour mise à jour contrôlée (Requirement 7)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
