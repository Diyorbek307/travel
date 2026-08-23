import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
