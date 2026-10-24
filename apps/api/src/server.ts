// ============================================================
// NEXUS ONE API Server — Entry Point
// ============================================================

import { buildApp } from './app.js';

const PORT = parseInt(process.env['PORT'] || '3001', 10);
const HOST = process.env['HOST'] || '0.0.0.0';

async function start() {
  const app = await buildApp();
  appInstance = app;

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`NEXUS ONE API running at http://${HOST}:${PORT}`);
    app.log.info(`API docs at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown — close app before exit to drain connections/DB pool
let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    appInstance?.log.warn(`Received ${signal}, shutting down gracefully...`);
    try {
      await appInstance?.close();
    } finally {
      process.exit(0);
    }
  });
});

start();
