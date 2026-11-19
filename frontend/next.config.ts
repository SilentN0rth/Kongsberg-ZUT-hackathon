import type { NextConfig } from "next";

// Backend w Javie (Spring Boot, katalog backend/). Przegladarka wola tylko /api/*
// na tym samym originie, wiec nie ma CORS, a service worker widzi jedno zrodlo.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
