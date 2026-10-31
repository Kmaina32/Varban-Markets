/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["globe.gl", "three-globe", "three"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;