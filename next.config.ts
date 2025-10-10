import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "api.bibliotecaespirita.ong.br" }
    ]
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone", // <- isto faz gerar .next/standalone e server.js
};

export default nextConfig;
