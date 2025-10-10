import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
      { protocol: "https", hostname: "api.bibliotecaespirita.ong.br", port: "80" },
      { protocol: "https", hostname: "bibliotecaespirita.ong.br", port: "80" }
    ]
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone", // <- isto faz gerar .next/standalone e server.js
};

export default nextConfig;
