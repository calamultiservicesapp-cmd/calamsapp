import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false, // Temporal para desarrollo
      },
    ];
  },
};

export default nextConfig;
