/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Since we're using local images, we can disable optimization
  },
};

module.exports = nextConfig; 