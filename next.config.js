/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos', 'res.cloudinary.com'],
  },
};

module.exports = nextConfig;
