import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["img/logo.png", "img/favicon.png"],
      manifest: {
        id: "/",
        name: "Food Log App",
        short_name: "Food Log",
        description:
          "Track meals, upload photos, and review calorie insights with the Food Log App.",
        theme_color: "#1f2937",
        background_color: "#f8fafc",
        display: "standalone",
        scope: "/",
        start_url: "/",
        lang: "en",
        orientation: "any",
        icons: [
          {
            src: "/icons/food-log-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/food-log-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/food-log-icon-maskable.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Log a meal",
            short_name: "Log meal",
            description: "Jump directly into logging a new meal photo.",
            url: "/dashboard/home",
          },
          {
            name: "View results",
            short_name: "Results",
            url: "/result",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-meals",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
  },
});
