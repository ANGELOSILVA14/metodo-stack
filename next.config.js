/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/metodostack', destination: '/metodostack/index.html', permanent: false },
      { source: '/membrometodostack', destination: '/metodo', permanent: false },
    ]
  },
}

module.exports = nextConfig
