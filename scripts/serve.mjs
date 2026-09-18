import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLeadHandler } from './leads.mjs';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const port = Number.parseInt(process.env.PORT || '4173', 10);
const host = process.env.HOST || '0.0.0.0';
const proxyLead = createLeadHandler({
  primaryUrl: process.env.LEAD_WEBHOOK_URL,
  fonilUrl: process.env.FONIL_CRM_WEBHOOK_URL,
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

if (!existsSync(join(root, 'index.html'))) {
  throw new Error('dist/index.html was not found. Run npm run build before npm start.');
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(request, response, filePath) {
  const extension = extname(filePath).toLowerCase();
  const cacheControl = filePath.includes(`${sep}assets${sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';

  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Content-Length': statSync(filePath).size,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);

  if (pathname === '/api/leads') {
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' });
      response.end('Method Not Allowed');
      return;
    }
    await proxyLead(request, response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  if (pathname === '/_health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('ok');
    return;
  }

  const requested = resolve(root, `.${normalize(pathname)}`);
  const isInsideRoot = requested === root || requested.startsWith(`${root}${sep}`);
  const filePath = isInsideRoot && existsSync(requested) && statSync(requested).isFile()
    ? requested
    : join(root, 'index.html');

  sendFile(request, response, filePath);
});

server.listen(port, host, () => {
  console.log(`Método SAC listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
