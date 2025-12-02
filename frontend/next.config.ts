import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // disable LightningCSS
  },
};

export default nextConfig;
