import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  optimizeDeps: {
    exclude: ['@boundaryml/baml-client', '@boundaryml/baml'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
    strictPort: true // This will fail if port 3000 is not available
  },
  resolve: {
    alias: {
      // Add any necessary aliases here
    },
  },
});
