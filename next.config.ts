import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/summary",
        destination: "/Summary",
      },
      {
        source: "/Summary",
        destination: "/summary",
      },
    ];
  },
};

export default nextConfig;
