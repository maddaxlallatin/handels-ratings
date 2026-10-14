import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  agentRules: false,
  serverExternalPackages: ["@prisma/orm-postgres", "pg", "temporal-polyfill"],
};

export default nextConfig;
