import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createLeadHandler } from './scripts/leads.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const handleLead = createLeadHandler({ primaryUrl: env.LEAD_WEBHOOK_URL, fonilUrl: env.FONIL_CRM_WEBHOOK_URL });
  const leadsPlugin: Plugin = {
    name: 'lead-api',
    configureServer(server) { server.middlewares.use('/api/leads', handleLead); },
    configurePreviewServer(server) { server.middlewares.use('/api/leads', handleLead); },
  };

  return {
    plugins: [react(), leadsPlugin],
  };
});
