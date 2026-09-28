import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  async rewrites() {
    const backend = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000";
    return [
      {
        source: "/api/contact-message",
        destination: `${backend}/api/v1/public/site-content/messages`,
      },
      {
        source: "/api/public/:path*",
        destination: `${backend}/api/public/:path*`,
      },
    ];
  },
};

export default nextConfig;
