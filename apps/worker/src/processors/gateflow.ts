// ============================================================
// GateFlow Queue Processor
// ============================================================
// Asynchronously processes gateway traffic logs, metric rollups,
// and consumer quota recalculations.
// ============================================================

import { Worker, type Job } from 'bullmq';
import { prisma } from '@nexus-one/database';
import { createLogger } from '@nexus-one/logger';

const logger = createLogger({ service: 'gateflow-worker' });

export interface GateFlowMetricJobData {
  orgId: string;
  routeId: string;
  consumerId?: string;
  statusCode: number;
  latencyMs: number;
  requestSize?: number;
  responseSize?: number;
}

export function createGateFlowWorker(connection: { host?: string; port?: number; url?: string }) {
  const worker = new Worker<GateFlowMetricJobData>(
    'gateway-metrics-aggregation',
    async (job: Job<GateFlowMetricJobData>) => {
      const { orgId, routeId, consumerId, statusCode, latencyMs, requestSize = 0, responseSize = 0 } = job.data;
      logger.info({ jobId: job.id, routeId, statusCode, latencyMs }, 'Processing gateway metric rollup');

      const metric = await prisma.gatewayMetric.create({
        data: {
          orgId,
          routeId,
          consumerId,
          statusCode,
          latencyMs,
          requestSize,
          responseSize,
        },
      });

      return { success: true, metricId: metric.id };
    },
    {
      connection: connection as any,
      concurrency: 10,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'GateFlow metric job failed');
  });

  return worker;
}
