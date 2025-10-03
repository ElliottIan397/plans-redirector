/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.csv$/i,
      type: 'asset/source', // allows '?raw' import in route.js
    });
    return config;
  },
  async rewrites() {
    return [
      { source: '/r/:code', destination: '/api/r/:code' },
      // Optional: serve the not-found page nicely
      { source: '/plan-not-found', destination: '/plan-not-found.html' },
    ];
  },
};

module.exports = nextConfig;
