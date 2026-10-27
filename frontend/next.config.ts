import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // Na Vercel, o empacotamento serverless é nativo e conflita com 'standalone' (erro .nft.json).
  // No Docker/Railway, 'standalone' continua ativo para gerar o server.js autônomo.
  output: isStaticExport ? "export" : isVercel ? undefined : "standalone",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? (isStaticExport ? "/crawler" : ""),
};

export default nextConfig;
