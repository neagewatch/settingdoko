import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // 本番ビルド最適化
  poweredByHeader: false,
  // 画像ドメイン（QRコード生成API）
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "chart.googleapis.com" },
    ],
  },
};

export default nextConfig;
