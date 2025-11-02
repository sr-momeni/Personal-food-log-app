# Food Log App PWA Guide

The app now ships as a Progressive Web App (PWA). This guide outlines how to test and deploy the new capabilities.

## Local testing

1. Run `npm run dev` to start the Vite dev server.
2. Open `http://localhost:5173` in Chrome.
3. Use DevTools → Application → Service Workers to verify a worker is registered (`sw.js`).
4. From DevTools, choose **Add to Home Screen** or install the app via the omnibox install prompt (Chrome) to validate standalone mode.
5. While still installed, switch to **Offline** in DevTools and refresh. Cached routes (`/`, `/dashboard/home`, assets) remain available and the UI loads offline.

## Production build & deployment

- Run `npm run build` – the PWA plugin outputs `dist/sw.js`, `dist/workbox-*.js`, and `dist/manifest.webmanifest`.
- Deploy the contents of `dist/` to any static host with HTTPS. The service worker requires HTTPS or `localhost`.
- After deployment, open the site, wait for the service worker to finish installing, then install the PWA from the browser menu.

## Runtime updates

Service workers are configured with `registerType: "autoUpdate"`. When you deploy a new build:

- The worker checks for updates in the background.
- Users receive the latest assets on their next visit without manual refresh.

## API caching behaviour

Requests to `/api/*` use a Network-First strategy with a short cache fallback. The app stays responsive if the API is briefly unreachable, and cached data expires after one hour.

## Icon assets

Icons live in `public/icons/` and are referenced automatically in `vite.config.js`. Update these if you wish to change branding.

