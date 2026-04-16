import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/', destination: '/academy', permanent: false },
    ];
  },
};
export default withNextIntl(nextConfig);
