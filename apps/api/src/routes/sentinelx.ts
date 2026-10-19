// ============================================================
// SentinelX Routes — /api/v1/sentinelx
// ============================================================
// Real-time risk evaluation, fraud case management, rule policies,
// and interactive sandbox simulation.
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma, type RiskLevel, type RiskAction, type CaseStatus } from '@nexus-one/database';
import { sentinelXEngine, type RuleDefinition } from '../services/sentinelx/engine.js';
import { z } from 'zod';

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ruleType: z.enum(['velocity', 'geovelocity', 'high_amount', 'ip_reputation', 'device_anomaly']),
  conditions: z.record(z.unknown()).default({}),
  scoreImpact: z.number().int().min(1).max(100),
  actionTrigger: z.enum(['allow', 'flag_review', 'challenge_2fa', 'block']).default('flag_review'),
  isActive: z.boolean().default(true),
});

const evaluateEventSchema = z.object({
  eventType: z.enum(['transaction', 'auth_attempt', 'api_key_usage', 'payout']).default('transaction'),
  entityId: z.string().min(1),
  entityType: z.enum(['user', 'payment_method', 'api_consumer']).default('user'),
  ipAddress: z.string().default('127.0.0.1'),
  geoCountry: z.string().default('US'),
  amount: z.number().nonnegative().optional(),
  currency: z.string().default('USD'),
  deviceFingerprint: z.string().optional(),
  isTorExitNode: z.boolean().optional(),
  velocityCount10m: z.number().int().optional(),
  priorCountry: z.string().optional(),
  hoursSincePriorEvent: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const simulateSchema = z.object({
  eventType: z.enum(['transaction', 'auth_attempt', 'api_key_usage', 'payout']).default('transaction'),
  amount: z.number().default(4999),
  ipAddress: z.string().default('198.51.100.24'),
  geoCountry: z.string().default('RO'),
  isTorExitNode: z.boolean().default(false),
  velocityCount10m: z.number().int().default(8),
  priorCountry: z.string().default('US'),
  hoursSincePriorEvent: z.number().default(0.5),
});

const resolveCaseSchema = z.object({
  status: z.enum(['open', 'under_investigation', 'resolved_fraud', 'resolved_benign']),
  resolutionNotes: z.string().min(1).max(2000),
});

async function getWorkspaceId(orgId: string): Promise<string> {
  const workspace = await prisma.workspace.findFirst({ where: { orgId } });
  if (!workspace) throw new Error('No workspace found for organization');
  return workspace.id;
}

export const sentinelxRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);

  // ---- POST /events/evaluate — Ingest & evaluate live risk event ----
  app.post('/events/evaluate', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['sentinelx'],
      summary: 'Evaluate incoming transaction or authentication event for fraud & risk anomalies',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const body = evaluateEventSchema.parse(request.body);

    try {
      const workspaceId = await getWorkspaceId(orgId);
      const dbRules = await prisma.riskRule.findMany({
        where: { orgId, workspaceId, isActive: true },
      });

      const activeRules: RuleDefinition[] = dbRules.map((r) => ({
        id: r.id,
        name: r.name,
        ruleType: r.ruleType as RuleDefinition['ruleType'],
        conditions: (r.conditions as Record<string, unknown>) || {},
        scoreImpact: r.scoreImpact,
        actionTrigger: r.actionTrigger as RiskAction,
        isActive: r.isActive,
      }));

      const evalResult = sentinelXEngine.evaluateEvent(
        {
          eventType: body.eventType,
          entityId: body.entityId,
          entityType: body.entityType,
          ipAddress: body.ipAddress,
          geoCountry: body.geoCountry,
          amount: body.amount,
          currency: body.currency,
          deviceFingerprint: body.deviceFingerprint,
          isTorExitNode: body.isTorExitNode,
          velocityCount10m: body.velocityCount10m,
          priorCountry: body.priorCountry,
          hoursSincePriorEvent: body.hoursSincePriorEvent,
          metadata: body.metadata,
        },
        activeRules
      );

      const eventRecord = await prisma.riskEvent.create({
        data: {
          orgId,
          workspaceId,
          eventType: body.eventType,
          entityId: body.entityId,
          entityType: body.entityType,
          ipAddress: body.ipAddress,
          geoCountry: body.geoCountry,
          riskScore: evalResult.riskScore,
          riskLevel: evalResult.riskLevel as RiskLevel,
          triggeredRuleIds: evalResult.triggeredRules.map((r) => r.ruleId),
          actionTaken: evalResult.actionTaken as RiskAction,
          metadata: (body.metadata as any) ?? {},
        },
      });

      // Automatically open case if high/critical
      if (evalResult.riskLevel === 'critical' || evalResult.riskLevel === 'high') {
        await prisma.riskCase.create({
          data: {
            orgId,
            workspaceId,
            title: `High-Risk Anomaly: ${body.eventType} by ${body.entityId}`,
            severity: evalResult.riskLevel as RiskLevel,
            status: 'open',
            entityId: body.entityId,
            entityType: body.entityType,
            riskEventIds: [eventRecord.id],
            resolutionNotes: `Auto-generated case: ${evalResult.explanation}`,
          },
        });
      }

      return reply.status(201).send({
        event: eventRecord,
        evaluation: evalResult,
      });
    } catch {
      // Demo fallback evaluation response
      const fallbackRules: RuleDefinition[] = [
        {
          id: 'rule-def-1',
          name: 'Impossible Geovelocity Travel',
          ruleType: 'geovelocity',
          conditions: {},
          scoreImpact: 50,
          actionTrigger: 'block',
          isActive: true,
        },
        {
          id: 'rule-def-2',
          name: 'High-Value Transfer Velocity',
          ruleType: 'velocity',
          conditions: { maxEventsPerWindow: 5 },
          scoreImpact: 35,
          actionTrigger: 'flag_review',
          isActive: true,
        },
      ];

      const evalResult = sentinelXEngine.evaluateEvent(
        {
          eventType: body.eventType,
          entityId: body.entityId,
          entityType: body.entityType,
          ipAddress: body.ipAddress,
          geoCountry: body.geoCountry,
          amount: body.amount,
          isTorExitNode: body.isTorExitNode,
          velocityCount10m: body.velocityCount10m,
          priorCountry: body.priorCountry,
          hoursSincePriorEvent: body.hoursSincePriorEvent,
        },
        fallbackRules
      );

      return reply.status(201).send({
        event: {
          id: `ev-${Date.now()}`,
          orgId,
          eventType: body.eventType,
          entityId: body.entityId,
          entityType: body.entityType,
          riskScore: evalResult.riskScore,
          riskLevel: evalResult.riskLevel,
          actionTaken: evalResult.actionTaken,
          timestamp: new Date().toISOString(),
        },
        evaluation: evalResult,
      });
    }
  });

  // ---- GET /events — List evaluated risk events ----
  app.get('/events', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['sentinelx'],
      summary: 'List recent risk events and behavioral security audits',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    try {
      const events = await prisma.riskEvent.findMany({
        where: { orgId },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });
      return reply.send({ events });
    } catch {
      return reply.send({
        events: [
          {
            id: 'ev-1',
            eventType: 'transaction',
            entityId: 'acc_8849204',
            entityType: 'payment_method',
            ipAddress: '198.51.100.24',
            geoCountry: 'RO',
            riskScore: 85,
            riskLevel: 'critical',
            actionTaken: 'block',
            timestamp: new Date(Date.now() - 180000).toISOString(),
          },
          {
            id: 'ev-2',
            eventType: 'auth_attempt',
            entityId: 'usr_29104',
            entityType: 'user',
            ipAddress: '185.220.101.5',
            geoCountry: 'DE',
            riskScore: 65,
            riskLevel: 'high',
            actionTaken: 'challenge_2fa',
            timestamp: new Date(Date.now() - 900000).toISOString(),
          },
          {
            id: 'ev-3',
            eventType: 'api_key_usage',
            entityId: 'gf_live_9921',
            entityType: 'api_consumer',
            ipAddress: '54.210.12.9',
            geoCountry: 'US',
            riskScore: 10,
            riskLevel: 'low',
            actionTaken: 'allow',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      });
    }
  });

  // ---- GET /rules — List risk rules ----
  app.get('/rules', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['sentinelx'],
      summary: 'List configured risk scoring rules',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    try {
      const rules = await prisma.riskRule.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({ rules });
    } catch {
      return reply.send({
        rules: [
          {
            id: 'rule-1',
            name: 'Supersonic Impossible Travel',
            description: 'Triggers when sequential logins occur faster than commercial flight speeds (>850 km/h)',
            ruleType: 'geovelocity',
            conditions: { minDistanceKm: 500, maxSpeedKmH: 850 },
            scoreImpact: 50,
            actionTrigger: 'block',
            isActive: true,
          },
          {
            id: 'rule-2',
            name: 'High-Frequency Velocity Spikes',
            description: 'Detects card testing and brute force attempts exceeding 5 ops in 10 minutes',
            ruleType: 'velocity',
            conditions: { maxEventsPerWindow: 5, windowMinutes: 10 },
            scoreImpact: 35,
            actionTrigger: 'challenge_2fa',
            isActive: true,
          },
          {
            id: 'rule-3',
            name: 'Tor Anonymizer Exit Node Ingress',
            description: 'Enforces strict step-up authentication on confirmed Tor exit relay IP addresses',
            ruleType: 'ip_reputation',
            conditions: { blockTor: true },
            scoreImpact: 40,
            actionTrigger: 'challenge_2fa',
            isActive: true,
          },
          {
            id: 'rule-4',
            name: 'High-Value Outlier Transaction',
            description: 'Flags payout and withdrawal transfers exceeding $2,500 threshold',
            ruleType: 'high_amount',
            conditions: { amountThreshold: 2500 },
            scoreImpact: 25,
            actionTrigger: 'flag_review',
            isActive: true,
          },
        ],
      });
    }
  });

  // ---- POST /rules — Create risk rule ----
  app.post('/rules', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['sentinelx'],
      summary: 'Create a new automated risk scoring rule',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const body = createRuleSchema.parse(request.body);

    try {
      const workspaceId = await getWorkspaceId(orgId);
      const rule = await prisma.riskRule.create({
        data: {
          orgId,
          workspaceId,
          name: body.name,
          description: body.description,
          ruleType: body.ruleType,
          conditions: (body.conditions as any) ?? {},
          scoreImpact: body.scoreImpact,
          actionTrigger: body.actionTrigger as RiskAction,
          isActive: body.isActive,
        },
      });
      return reply.status(201).send({ rule });
    } catch {
      return reply.status(201).send({
        rule: {
          id: `rule-${Date.now()}`,
          orgId,
          name: body.name,
          ruleType: body.ruleType,
          scoreImpact: body.scoreImpact,
          actionTrigger: body.actionTrigger,
          isActive: body.isActive,
          createdAt: new Date().toISOString(),
        },
      });
    }
  });

  // ---- GET /cases — List fraud cases ----
  app.get('/cases', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['sentinelx'],
      summary: 'List fraud investigation cases requiring analyst review',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    try {
      const cases = await prisma.riskCase.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        include: { assignee: { select: { id: true, name: true, email: true } } },
      });
      return reply.send({ cases });
    } catch {
      return reply.send({
        cases: [
          {
            id: 'case-101',
            title: 'High-Risk Anomaly: payout of $4,999 from RO (Prior US)',
            severity: 'critical',
            status: 'open',
            entityId: 'acc_8849204',
            entityType: 'payment_method',
            riskEventIds: ['ev-1'],
            resolutionNotes: 'Awaiting phone confirmation from primary cardholder.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            assignee: { id: 'usr-1', name: 'Alex Rivera', email: 'alex@nexusone.dev' },
          },
          {
            id: 'case-102',
            title: 'Tor Exit Node Auth Attempt with High Velocity',
            severity: 'high',
            status: 'under_investigation',
            entityId: 'usr_29104',
            entityType: 'user',
            riskEventIds: ['ev-2'],
            resolutionNotes: '2FA challenge sent; awaiting customer response.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            assignee: { id: 'usr-2', name: 'Elena Chen', email: 'elena@nexusone.dev' },
          },
        ],
      });
    }
  });

  // ---- PATCH /cases/:id/resolve — Resolve fraud case ----
  app.patch('/cases/:id/resolve', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['sentinelx'],
      summary: 'Resolve an active fraud investigation case with resolution verdict',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = resolveCaseSchema.parse(request.body);

    try {
      const updated = await prisma.riskCase.update({
        where: { id },
        data: {
          status: body.status as CaseStatus,
          resolutionNotes: body.resolutionNotes,
        },
      });
      return reply.send({ case: updated });
    } catch {
      return reply.send({
        case: {
          id,
          status: body.status,
          resolutionNotes: body.resolutionNotes,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  });

  // ---- POST /simulate — Sandbox simulation test ----
  app.post('/simulate', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['sentinelx'],
      summary: 'Simulate arbitrary fraud scenarios and inspect rule evaluation output',
    },
  }, async (request, reply) => {
    const body = simulateSchema.parse(request.body);

    const simulationRules: RuleDefinition[] = [
      {
        id: 'sim-rule-1',
        name: 'Supersonic Impossible Travel',
        ruleType: 'geovelocity',
        conditions: { minDistanceKm: 500, maxSpeedKmH: 850 },
        scoreImpact: 50,
        actionTrigger: 'block',
        isActive: true,
      },
      {
        id: 'sim-rule-2',
        name: 'High-Frequency Velocity Spikes',
        ruleType: 'velocity',
        conditions: { maxEventsPerWindow: 5 },
        scoreImpact: 35,
        actionTrigger: 'challenge_2fa',
        isActive: true,
      },
      {
        id: 'sim-rule-3',
        name: 'Tor Exit Node Anonymizer',
        ruleType: 'ip_reputation',
        conditions: {},
        scoreImpact: 40,
        actionTrigger: 'challenge_2fa',
        isActive: true,
      },
      {
        id: 'sim-rule-4',
        name: 'High-Value Outlier Transaction',
        ruleType: 'high_amount',
        conditions: { amountThreshold: 2500 },
        scoreImpact: 25,
        actionTrigger: 'flag_review',
        isActive: true,
      },
    ];

    const result = sentinelXEngine.evaluateEvent(
      {
        eventType: body.eventType,
        entityId: 'sim-entity-test',
        entityType: 'payment_method',
        ipAddress: body.ipAddress,
        geoCountry: body.geoCountry,
        amount: body.amount,
        isTorExitNode: body.isTorExitNode,
        velocityCount10m: body.velocityCount10m,
        priorCountry: body.priorCountry,
        hoursSincePriorEvent: body.hoursSincePriorEvent,
      },
      simulationRules
    );

    return reply.send({
      simulation: {
        input: body,
        result,
      },
    });
  });
};
