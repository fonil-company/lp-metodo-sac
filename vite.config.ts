import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/leads': {
        target: 'https://crm.fonilgroup.com.br',
        changeOrigin: true,
        rewrite: () => '/api/webhooks/leads/cmpylrvkv000376i6bzhsl1lo',
      },
    },
  },
});
