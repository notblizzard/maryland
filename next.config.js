/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.notblizzard.dev"],
  },
  async rewrites() {
    return [
      {
        source: "/dashboard/@:username",
        destination: "/dashboard/profile/:username",
      },
    ];
  },
};

module.exports = nextConfig;
