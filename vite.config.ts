import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const leadWebhook = loadEnv(mode, process.cwd(), '').LEAD_WEBHOOK_URL?.trim();
  const leadWebhookUrl = leadWebhook ? new URL(leadWebhook) : null;

  return {
    plugins: [react()],
    server: leadWebhookUrl ? {
      proxy: {
        '/api/leads': {
          target: leadWebhookUrl.origin,
          changeOrigin: true,
          rewrite: () => `${leadWebhookUrl.pathname}${leadWebhookUrl.search}`,
        },
      },
    } : undefined,
  };
});
