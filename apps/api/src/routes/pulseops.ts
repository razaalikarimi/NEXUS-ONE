// ============================================================
// PulseOps Routes — /api/v1/pulseops
// ============================================================
// Real-time telemetry ingestion, service catalogs, error grouping,
// incident war rooms, and AI-assisted root cause analysis.
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma, type IncidentSeverity, type IncidentStatus, type ErrorGroupStatus } from '@nexus-one/database';
import { PulseOpsTelemetryService } from '../services/pulseops/telemetry.js';
import { z } from 'zod';

async function getWorkspaceId(orgId: string): Promise<string> {
  const workspace = await prisma.workspace.findFirst({ where: { orgId } });
  if (!workspace) throw new Error('No workspace found for organization');
  return workspace.id;
}

const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  environment: z.string().default('production'),
});

const ingestEventSchema = z.object({
  serviceId: z.string().uuid(),
  eventType: z.enum(['error', 'latency', 'crash', 'info']).default('error'),
  message: z.string().min(1).max(1000),
  stackTrace: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
  metadata: z.record(z.unknown()).default({}),
});

const createIncidentSchema = z.object({
  serviceId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
});

const updateIncidentSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  rootCause: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
});

const createTimelineEventSchema = z.object({
  eventType: z.enum(['state_change', 'comment', 'ai_diagnosis', 'runbook_action']).default('comment'),
  message: z.string().min(1).max(2000),
  metadata: z.record(z.unknown()).default({}),
});

export const pulseopsRoutes: FastifyPluginAsync = async (app) => {
  // Authentication required for all endpoints
  app.addHook('preHandler', app.authenticate);

  // ---- GET /services — List all monitored services ----
  app.get('/services', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'List all registered services and health statuses',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    const services = await prisma.service.findMany({
      where: { orgId },
      include: {
        _count: {
          select: {
            errorGroups: true,
            incidents: true,
            telemetryEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ services });
  });

  // ---- POST /services — Register a new service ----
  app.post('/services', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['pulseops'],
      summary: 'Register a new microservice or component for observability',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const workspaceId = await getWorkspaceId(orgId);
    const body = createServiceSchema.parse(request.body);

    const existing = await prisma.service.findUnique({
      where: { orgId_slug: { orgId, slug: body.slug } },
    });

    if (existing) {
      return reply.status(409).send({ error: 'Service slug already exists in this organization.' });
    }

    const service = await prisma.service.create({
      data: {
        orgId,
        workspaceId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        environment: body.environment,
        status: 'healthy',
      },
    });

    return reply.status(201).send({ service });
  });

  // ---- GET /services/:id — Get single service with stats ----
  app.get('/services/:id', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'Get service details with recent errors and active incidents',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { id } = request.params as { id: string };

    const service = await prisma.service.findFirst({
      where: { id, orgId },
      include: {
        errorGroups: {
          where: { status: 'active' },
          orderBy: { lastSeen: 'desc' },
          take: 5,
        },
        incidents: {
          where: { status: { in: ['open', 'investigating'] } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!service) {
      return reply.status(404).send({ error: 'Service not found' });
    }

    return reply.send({ service });
  });

  // ---- POST /events — Telemetry Ingestion API ----
  app.post('/events', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['pulseops'],
      summary: 'Ingest error or telemetry events with automatic fingerprinting',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const workspaceId = await getWorkspaceId(orgId);
    const body = ingestEventSchema.parse(request.body);

    // Verify service belongs to tenant
    const service = await prisma.service.findFirst({
      where: { id: body.serviceId, orgId },
    });

    if (!service) {
      return reply.status(404).send({ error: 'Service not found for this organization.' });
    }

    const result = await PulseOpsTelemetryService.ingestEvent({
      orgId,
      workspaceId,
      serviceId: body.serviceId,
      eventType: body.eventType,
      message: body.message,
      stackTrace: body.stackTrace,
      severity: body.severity,
      metadata: body.metadata,
    });

    return reply.status(201).send(result);
  });

  // ---- GET /events — List raw telemetry events ----
  app.get('/events', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'List raw telemetry events with pagination and filters',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { serviceId, severity, limit = '50' } = request.query as {
      serviceId?: string;
      severity?: IncidentSeverity;
      limit?: string;
    };

    const events = await prisma.telemetryEvent.findMany({
      where: {
        orgId,
        ...(serviceId ? { serviceId } : {}),
        ...(severity ? { severity } : {}),
      },
      include: {
        service: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 100),
    });

    return reply.send({ events });
  });

  // ---- GET /error-groups — Grouped exceptions ----
  app.get('/error-groups', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'List fingerprint-grouped exceptions and occurrence counts',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { serviceId, status } = request.query as {
      serviceId?: string;
      status?: ErrorGroupStatus;
    };

    const errorGroups = await prisma.errorGroup.findMany({
      where: {
        orgId,
        ...(serviceId ? { serviceId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        service: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { lastSeen: 'desc' },
    });

    return reply.send({ errorGroups });
  });

  // ---- PATCH /error-groups/:id — Update error group status ----
  app.patch('/error-groups/:id', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['pulseops'],
      summary: 'Mark an error group as resolved or ignored',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: ErrorGroupStatus };

    const group = await prisma.errorGroup.findFirst({
      where: { id, orgId },
    });

    if (!group) {
      return reply.status(404).send({ error: 'Error group not found' });
    }

    const updated = await prisma.errorGroup.update({
      where: { id },
      data: { status },
    });

    return reply.send({ errorGroup: updated });
  });

  // ---- GET /incidents — Incident War Room list ----
  app.get('/incidents', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'List all operational incidents',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { status, severity } = request.query as {
      status?: IncidentStatus;
      severity?: IncidentSeverity;
    };

    const incidents = await prisma.incident.findMany({
      where: {
        orgId,
        ...(status ? { status } : {}),
        ...(severity ? { severity } : {}),
      },
      include: {
        service: { select: { id: true, name: true, slug: true } },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ incidents });
  });

  // ---- POST /incidents — Manually declare an incident ----
  app.post('/incidents', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['pulseops'],
      summary: 'Declare a new operational incident',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const workspaceId = await getWorkspaceId(orgId);
    const userId = request.user?.id;
    const body = createIncidentSchema.parse(request.body);

    const aiDiagnosis = PulseOpsTelemetryService.synthesizeAIAssessment(
      `${body.title} - ${body.summary || ''}`,
    );

    const incident = await prisma.incident.create({
      data: {
        orgId,
        workspaceId,
        serviceId: body.serviceId,
        title: body.title,
        summary: body.summary,
        severity: body.severity as IncidentSeverity,
        status: 'open',
        rootCause: aiDiagnosis.likelyRootCause,
        declaredById: userId,
        events: {
          create: [
            {
              eventType: 'state_change',
              message: `Incident declared manually with ${body.severity.toUpperCase()} severity.`,
              createdById: userId,
            },
            {
              eventType: 'ai_diagnosis',
              message: aiDiagnosis.summary,
              metadata: aiDiagnosis as any,
            },
          ],
        },
      },
      include: {
        events: true,
      },
    });

    return reply.status(201).send({ incident });
  });

  // ---- GET /incidents/:id — War Room details & full timeline ----
  app.get('/incidents/:id', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['pulseops'],
      summary: 'Get full incident details with complete event timeline',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { id } = request.params as { id: string };

    const incident = await prisma.incident.findFirst({
      where: { id, orgId },
      include: {
        service: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!incident) {
      return reply.status(404).send({ error: 'Incident not found' });
    }

    return reply.send({ incident });
  });

  // ---- PATCH /incidents/:id — Update incident state/root cause ----
  app.patch('/incidents/:id', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['pulseops'],
      summary: 'Update incident status, severity, root cause, or resolution',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const userId = request.user?.id;
    const { id } = request.params as { id: string };
    const body = updateIncidentSchema.parse(request.body);

    const incident = await prisma.incident.findFirst({
      where: { id, orgId },
    });

    if (!incident) {
      return reply.status(404).send({ error: 'Incident not found' });
    }

    const updates: Record<string, unknown> = {};
    const timelineEvents: Array<{ eventType: string; message: string; createdById?: string }> = [];

    if (body.status && body.status !== incident.status) {
      updates.status = body.status;
      if (body.status === 'resolved' || body.status === 'closed') {
        updates.resolvedAt = new Date();
      }
      timelineEvents.push({
        eventType: 'state_change',
        message: `Status transitioned from ${incident.status.toUpperCase()} to ${body.status.toUpperCase()}`,
        createdById: userId,
      });
    }

    if (body.severity && body.severity !== incident.severity) {
      updates.severity = body.severity;
      timelineEvents.push({
        eventType: 'state_change',
        message: `Severity adjusted to ${body.severity.toUpperCase()}`,
        createdById: userId,
      });
    }

    if (body.rootCause !== undefined) {
      updates.rootCause = body.rootCause;
    }

    if (body.resolution !== undefined) {
      updates.resolution = body.resolution;
      timelineEvents.push({
        eventType: 'runbook_action',
        message: `Resolution documented: ${body.resolution}`,
        createdById: userId,
      });
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        ...updates,
        events: {
          create: timelineEvents,
        },
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        service: true,
      },
    });

    return reply.send({ incident: updatedIncident });
  });

  // ---- POST /incidents/:id/timeline — Add timeline comment/action ----
  app.post('/incidents/:id/timeline', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['pulseops'],
      summary: 'Add war room note or investigation update to incident timeline',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const userId = request.user?.id;
    const { id } = request.params as { id: string };
    const body = createTimelineEventSchema.parse(request.body);

    const incident = await prisma.incident.findFirst({
      where: { id, orgId },
    });

    if (!incident) {
      return reply.status(404).send({ error: 'Incident not found' });
    }

    const event = await prisma.incidentEvent.create({
      data: {
        incidentId: id,
        eventType: body.eventType,
        message: body.message,
        metadata: body.metadata as any,
        createdById: userId,
      },
    });

    return reply.status(201).send({ event });
  });
};
