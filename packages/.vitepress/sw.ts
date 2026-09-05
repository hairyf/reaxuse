// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />
import { packageNames } from 'virtual:pwa'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

/**
 * Service worker — React adaptation of VueUse's `packages/.vitepress/sw.ts`.
 * Built by vite-plugin-pwa (injectManifest strategy) using the docs'
 * `virtual:pwa` module for the route list plus the auto-generated
 * `__WB_MANIFEST` precache entries.
 */

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

cleanupOutdatedCaches()

precacheAndRoute([
  ...packageNames.map(([, data]) => ({ url: data.url, revision: data.hash })),
  ...self.__WB_MANIFEST,
])

// App-shell navigation: network-first with a cache fallback for offline.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Same-origin assets: stale-while-revalidate with expiration.
registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
)
