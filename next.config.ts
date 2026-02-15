import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */

  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
};

export default nextConfig;
