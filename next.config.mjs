import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withPWA({
  ...nextConfig,
  // Add empty turbopack config to silence the error in Next.js 16+
  // since next-pwa might be injecting webpack config
  turbopack: {}
});
