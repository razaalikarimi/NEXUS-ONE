// ============================================================
// NEXUS ONE Background Worker — Entry Point
// ============================================================
// Starts BullMQ workers for all queues.
// Product-specific processors are added in their phases.
// ============================================================

import { createLogger } from '@nexus-one/logger';
import { createAgentForgeWorker } from './processors/agentforge.js';
import { createPulseOpsWorker } from './processors/pulseops.js';
import { createGateFlowWorker } from './processors/gateflow.js';

const logger = createLogger({ service: 'nexus-one-worker' });

async function start() {
  logger.info('Starting NEXUS ONE background worker...');

  const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
  logger.info({ redisUrl: redisUrl.replace(/\/\/.*@/, '//***@') }, 'Redis connection');

  // Register BullMQ workers
  try {
    createAgentForgeWorker({ url: redisUrl });
    logger.info('Registered AgentForge workflow-execution worker');
    createPulseOpsWorker({ url: redisUrl });
    logger.info('Registered PulseOps telemetry-ingestion worker');
    createGateFlowWorker({ url: redisUrl });
    logger.info('Registered GateFlow gateway-metrics worker');
  } catch (err: unknown) {
    logger.warn({ error: err instanceof Error ? err.message : String(err) }, 'Redis offline, running in standalone worker mode');
  }

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
