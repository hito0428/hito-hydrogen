import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), hydrogen(), oxygen(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: 'build',
    assetsInlineLimit: 0,
    ssr: true,
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  ssr: {
    optimizeDeps: {
      include: [
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
