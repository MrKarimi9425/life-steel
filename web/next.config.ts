import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    const backend = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000";
    return [
      {
        source: "/api/public/:path*",
        destination: `${backend}/api/public/:path*`,
      },
    ];
  },
};

export default nextConfig;
