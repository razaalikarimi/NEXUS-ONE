// ============================================================
// PulseOps Telemetry & Incident Intelligence Service
// ============================================================
// Handles error fingerprinting, event aggregation, automated
// incident alerting, and AI-assisted root cause analysis.
// ============================================================

import { createHash } from 'node:crypto';
import { prisma, type Prisma } from '@nexus-one/database';

export interface IngestTelemetryParams {
  orgId: string;
  workspaceId: string;
  serviceId: string;
  eventType: 'error' | 'latency' | 'crash' | 'info';
  message: string;
  stackTrace?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  metadata?: Record<string, unknown>;
}

export class PulseOpsTelemetryService {
  /**
   * Generates a deterministic SHA-256 fingerprint for grouping similar errors.
   * Strips dynamic variables (UUIDs, timestamps, memory addresses) from the trace.
   */
  public static generateFingerprint(message: string, stackTrace?: string): string {
    // Normalize message by removing numbers and uuid-like tokens
    const normalizedMessage = message
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
      .replace(/0x[0-9a-fA-F]+/g, '<HEX>')
      .replace(/\d+/g, '<NUM>')
      .trim();

    // Get the top stack frame if available
    let topFrame = '';
    if (stackTrace) {
      const traceLines = stackTrace.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('at '));
      const firstFrame = traceLines[0];
      if (firstFrame) {
        // Strip line and column numbers
        topFrame = firstFrame.replace(/:\d+:\d+/g, '');
      }
    }

    const payload = `${normalizedMessage}::${topFrame}`;
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
  }

  /**
   * Ingests a telemetry event, groups errors, updates service health,
   * and triggers alerts or automated incidents if critical thresholds are met.
   */
  public static async ingestEvent(params: IngestTelemetryParams) {
    const {
      orgId,
      workspaceId,
      serviceId,
      eventType,
      message,
      stackTrace,
      severity = 'info',
      metadata = {},
    } = params;

    const fingerprint = this.generateFingerprint(message, stackTrace);

    // 1. If it's an error or crash, find or create an ErrorGroup
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
        const title = message.length > 120 ? message.slice(0, 117) + '...' : message;
        const newGroup = await prisma.errorGroup.create({
          data: {
            orgId,
            workspaceId,
            serviceId,
            fingerprint,
            title,
            count: 1,
            status: 'active',
          },
        });
        errorGroupId = newGroup.id;
      }
    }

    // 2. Insert the TelemetryEvent record
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

    // 3. Update Service status if critical/crash
    if (severity === 'critical' || eventType === 'crash') {
      await prisma.service.update({
        where: { id: serviceId },
        data: { status: 'degraded' },
      });
    }

    // 4. Auto-incident creation for critical events if no open incident exists for this service
    let createdIncidentId: string | null = null;
    if (severity === 'critical') {
      const openIncident = await prisma.incident.findFirst({
        where: {
          orgId,
          workspaceId,
          serviceId,
          status: { in: ['open', 'investigating'] },
        },
      });

      if (!openIncident) {
        const aiAnalysis = this.synthesizeAIAssessment(message, stackTrace);

        const newIncident = await prisma.incident.create({
          data: {
            orgId,
            workspaceId,
            serviceId,
            title: `Critical Alert: ${message.slice(0, 80)}`,
            summary: `Automated incident triggered by critical telemetry event. Fingerprint: ${fingerprint}`,
            severity: 'critical',
            status: 'investigating',
            rootCause: aiAnalysis.likelyRootCause,
            events: {
              create: [
                {
                  eventType: 'state_change',
                  message: 'Incident automatically opened by PulseOps Telemetry Watcher.',
                },
                {
                  eventType: 'ai_diagnosis',
                  message: aiAnalysis.summary,
                  metadata: aiAnalysis as unknown as Prisma.InputJsonValue,
                },
              ],
            },
          },
        });
        createdIncidentId = newIncident.id;
      }
    }

    return {
      event,
      fingerprint,
      errorGroupId,
      createdIncidentId,
    };
  }

  /**
   * Generates AI-assisted root cause analysis heuristics based on error patterns.
   */
  public static synthesizeAIAssessment(message: string, stackTrace?: string) {
    const lower = `${message} ${stackTrace || ''}`.toLowerCase();

    let category = 'Unknown Exception';
    let likelyRootCause = 'Unhandled runtime exception requiring investigation.';
    let recommendedActions = [
      'Check recent deployments and Git commit logs for this service.',
      'Inspect downstream database connection pools and network latencies.',
      'Enable debug logging in the affected service environment.',
    ];

    if (lower.includes('connection refused') || lower.includes('etimedout') || lower.includes('econnreset')) {
      category = 'Network / Upstream Dependency Failure';
      likelyRootCause = 'The service failed to establish or maintain a socket connection to a downstream dependency or database.';
      recommendedActions = [
        'Verify VPC security groups and egress firewalls.',
        'Check database connection limit and active pool saturation.',
        'Verify upstream service health in PulseOps Service Catalog.',
      ];
    } else if (lower.includes('out of memory') || lower.includes('heap out of memory') || lower.includes('oom')) {
      category = 'Resource Exhaustion (OOM)';
      likelyRootCause = 'Node.js V8 memory heap exhausted due to memory leak or unbounded collection loading.';
      recommendedActions = [
        'Inspect recent memory profiling graphs in CloudPilot.',
        'Increase container memory limits or restart pod replicas.',
        'Check for un-paginated queries returning excessively large payloads.',
      ];
    } else if (lower.includes('permission denied') || lower.includes('unauthorized') || lower.includes('jwt') || lower.includes('forbidden')) {
      category = 'Authentication & Security Policy Violation';
      likelyRootCause = 'Authentication token expired, signature mismatch, or service IAM role lacks required permissions.';
      recommendedActions = [
        'Rotate or re-issue signing keys and verify token expiration configs.',
        'Validate IAM policy attachments in SentinelX audit stream.',
      ];
    } else if (lower.includes('syntaxerror') || lower.includes('cannot read property') || lower.includes('null is not an object')) {
      category = 'Null Pointer / Contract Incompatibility';
      likelyRootCause = 'Accessing an undefined or null property due to schema drift or missing payload validation.';
      recommendedActions = [
        'Validate payload schemas using GateFlow API gateway request validation.',
        'Inspect API contract changes between client and backend.',
      ];
    }

    return {
      category,
      likelyRootCause,
      confidence: 0.92,
      summary: `AI Root Cause Analysis (${category}): ${likelyRootCause}`,
      recommendedActions,
    };
  }
}
