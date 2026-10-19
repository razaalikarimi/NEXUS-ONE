// ============================================================
// PulseOps Telemetry Queue Processor
// ============================================================

import { Worker, type Job, type ConnectionOptions } from 'bullmq';
import { prisma, type IncidentSeverity, type Prisma } from '@nexus-one/database';
import { createLogger } from '@nexus-one/logger';
import { createHash } from 'node:crypto';

const logger = createLogger({ service: 'pulseops-worker' });

export interface TelemetryJobData {
  orgId: string;
  workspaceId: string;
  serviceId: string;
  eventType: 'error' | 'latency' | 'crash' | 'info';
  message: string;
  stackTrace?: string;
  severity?: IncidentSeverity;
  metadata?: Record<string, unknown>;
}

export function createPulseOpsWorker(connection: ConnectionOptions) {
  const worker = new Worker<TelemetryJobData>(
    'telemetry-ingestion',
    async (job: Job<TelemetryJobData>) => {
      const { orgId, workspaceId, serviceId, eventType, message, stackTrace, severity = 'info', metadata } = job.data;
      logger.info({ jobId: job.id, serviceId, eventType }, 'Processing telemetry event asynchronously');

      // Generate fingerprint
      const normalizedMessage = message
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
        .replace(/0x[0-9a-fA-F]+/g, '<HEX>')
        .replace(/\d+/g, '<NUM>')
        .trim();

      let topFrame = '';
      if (stackTrace) {
        const frames = stackTrace.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('at '));
        const firstFrame = frames[0];
        if (firstFrame) {
          topFrame = firstFrame.replace(/:\d+:\d+/g, '');
        }
      }

      const fingerprint = createHash('sha256')
        .update(`${normalizedMessage}::${topFrame}`)
        .digest('hex')
        .slice(0, 16);

      let errorGroupId: string | null = null;
      if (eventType === 'error' || eventType === 'crash') {
        const existingGroup = await prisma.errorGroup.findUnique({
          where: {
            serviceId_fingerprint: {
              serviceId,
              fingerprint,
            },
          },
        });

        if (existingGroup) {
          errorGroupId = existingGroup.id;
          await prisma.errorGroup.update({
            where: { id: existingGroup.id },
            data: {
              lastSeen: new Date(),
              count: { increment: 1 },
              status: 'active',
            },
          });
        } else {
          const newGroup = await prisma.errorGroup.create({
            data: {
              orgId,
              workspaceId,
              serviceId,
              fingerprint,
              title: message.length > 120 ? message.slice(0, 117) + '...' : message,
              count: 1,
              status: 'active',
            },
          });
          errorGroupId = newGroup.id;
        }
      }

      const event = await prisma.telemetryEvent.create({
        data: {
          orgId,
          workspaceId,
          serviceId,
          errorGroupId,
          eventType,
          message,
          stackTrace,
          fingerprint,
          severity,
          metadata: (metadata || {}) as Prisma.InputJsonValue,
        },
      });

      return { success: true, eventId: event.id, fingerprint };
    },
    {
      connection,
      concurrency: 10,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Telemetry ingestion job failed');
  });

  return worker;
}
