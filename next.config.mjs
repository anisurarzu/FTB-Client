/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.ibb.co"], // Add your external image domain here
  },
  // Proxy API calls through this Next.js app so HTTPS pages never call
  // the Contabo VPS over plain HTTP (avoids browser mixed-content blocks).
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: "http://161.97.114.108/frb/api/:path*",
      },
    ];
  },
};

export default nextConfig;
