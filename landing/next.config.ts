import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three собирается из исходников — Next должен его транспилировать.
  transpilePackages: ["three"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
