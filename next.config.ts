import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/plataforma/curso-ventas-digitales',
        destination: '/plataforma/curso-introduccion-blockchain',
        permanent: true,
      },
      {
        source: '/plataforma/curso-productividad',
        destination: '/plataforma/curso-blockchain-cripto-peru',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
