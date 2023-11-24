/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'picsum.photos', protocol: 'https', pathname: '**' },
      { hostname: 'res.cloudinary.com', protocol: 'https', pathname: '**' },
    ],
  },
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
