/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Las fuentes se cargan vía <link> en el navegador; evitamos que el build
  // intente descargar/inlinear el CSS de Google Fonts (build portable y limpio).
  optimizeFonts: false,
};
export default nextConfig;
