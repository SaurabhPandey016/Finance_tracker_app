import type { NextConfig } from "next";

if (process.env.NODE_ENV === "production" && !process.env.API_ORIGIN) {
  throw new Error("API_ORIGIN is required in production. Example: https://your-server.onrender.com");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    const origin = process.env.API_ORIGIN;
    if (!origin) return [];
    return [{ source: "/api/:path*", destination: `${origin}/api/:path*` }];
  },
};

export default nextConfig;
