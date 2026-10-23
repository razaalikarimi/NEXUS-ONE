// ============================================================
// NEXUS ONE Background Worker — Entry Point
// ============================================================
// Starts BullMQ workers for all queues.
// Product-specific processors are added in their phases.
// ============================================================

import { type ConnectionOptions } from 'bullmq';
import { createLogger } from '@nexus-one/logger';
import { createAgentForgeWorker } from './processors/agentforge.js';
import { createPulseOpsWorker } from './processors/pulseops.js';
import { createGateFlowWorker } from './processors/gateflow.js';
import { createCortexRagWorker } from './processors/cortexrag.js';
import { createSyncSpaceWorker } from './processors/syncspace.js';
import { createSentinelXWorker } from './processors/sentinelx.js';
import { createCloudPilotWorker } from './processors/cloudpilot.js';

const logger = createLogger({ service: 'nexus-one-worker' });

async function start() {
  logger.info('Starting NEXUS ONE background worker...');

  const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
  logger.info({ redisUrl: redisUrl.replace(/\/\/.*@/, '//***@') }, 'Redis connection');

  let connectionOptions: ConnectionOptions;
  try {
    const parsed = new URL(redisUrl);
    connectionOptions = {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port || '6379', 10),
      ...(parsed.username ? { username: parsed.username } : {}),
      ...(parsed.password ? { password: parsed.password } : {}),
      maxRetriesPerRequest: null,
    };
  } catch {
    connectionOptions = { host: 'localhost', port: 6379, maxRetriesPerRequest: null };
  }

  // Register BullMQ workers
  try {
    createAgentForgeWorker(connectionOptions);
    logger.info('Registered AgentForge workflow-execution worker');
    createPulseOpsWorker(connectionOptions);
    logger.info('Registered PulseOps telemetry-ingestion worker');
    createGateFlowWorker(connectionOptions);
    logger.info('Registered GateFlow gateway-metrics worker');
    createCortexRagWorker(connectionOptions);
    logger.info('Registered CortexRAG document-chunking worker');
    createSyncSpaceWorker(connectionOptions);
    logger.info('Registered SyncSpace maintenance worker');
    createSentinelXWorker(connectionOptions);
    logger.info('Registered SentinelX fraud-pipeline worker');
    createCloudPilotWorker(connectionOptions);
    logger.info('Registered CloudPilot cost-pipeline worker');
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
