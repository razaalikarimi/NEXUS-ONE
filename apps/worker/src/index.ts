// ============================================================
// NEXUS ONE Background Worker — Entry Point
// ============================================================
// Starts BullMQ workers for all queues.
// Product-specific processors are added in their phases.
// ============================================================

import { createLogger } from '@nexus-one/logger';

const logger = createLogger({ service: 'nexus-one-worker' });

async function start() {
  logger.info('Starting NEXUS ONE background worker...');

  const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
  logger.info({ redisUrl: redisUrl.replace(/\/\/.*@/, '//***@') }, 'Redis connection');

  // Phase 2+: Register BullMQ workers for each queue
  // - workflow-execution (AgentForge)
  // - document-processing (CortexRAG)
  // - telemetry-ingestion (PulseOps)
  // - billing-import (CloudPilot)
  // - notifications (Platform)
  // - maintenance (Platform)

  logger.info('Worker started. Waiting for jobs...');

  // Keep process alive
  await new Promise(() => {});
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down workers...`);
    // Phase 2: Close worker connections gracefully
    process.exit(0);
  });
});

start().catch((err) => {
  logger.error(err, 'Worker failed to start');
  process.exit(1);
});
