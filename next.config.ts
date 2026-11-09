import type { NextConfig } from "next";
import { DEFAULT_API_URL } from "./src/constants/urls";

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? DEFAULT_API_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        // public/ 파일은 기본이 max-age=0이라 페이지 이동마다 파비콘을 다시 요청한다
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sitemap",
        destination: "/sitemap.xml",
        permanent: true, // 301
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
