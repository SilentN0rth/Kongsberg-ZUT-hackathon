import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

// Stary backend w Javie (Spring Boot, katalog backend/) zostaje dostępny pod /legacy-api/*.
// Dane aplikacji obsługuje teraz Payload CMS pod /api/* (ten sam proces Next.js, lokalna baza SQLite).
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/legacy-api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  // Dawny widok /mostek został zastąpiony panelem CMS.
  async redirects() {
    return [{ source: "/mostek", destination: "/admin", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
