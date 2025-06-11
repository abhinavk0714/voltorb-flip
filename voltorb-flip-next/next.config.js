/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Since we're using local images, we can disable optimization
  },
};

module.exports = nextConfig; 