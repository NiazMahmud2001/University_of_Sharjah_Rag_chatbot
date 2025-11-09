import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
