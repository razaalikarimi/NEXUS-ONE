// ============================================================
// AgentForge Routes — /api/v1/agentforge
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma, type WorkflowNodeType } from '@nexus-one/database';
import { agentForgeEngine, type NodeItem, type EdgeItem } from '../services/agentforge/engine.js';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nodes: z.array(
    z.object({
      id: z.string(),
      nodeType: z.enum([
        'input',
        'prompt',
        'model',
        'tool',
        'condition',
        'transform',
        'approval',
        'output',
      ]),
      label: z.string(),
      config: z.record(z.unknown()).default({}),
      positionX: z.number().default(0),
      positionY: z.number().default(0),
    }),
  ).optional(),
  edges: z.array(
    z.object({
      id: z.string(),
      sourceNodeId: z.string(),
      targetNodeId: z.string(),
      sourceHandle: z.string().nullish(),
      targetHandle: z.string().nullish(),
      condition: z.string().nullish(),
    }),
  ).optional(),
});

const triggerRunSchema = z.object({
  inputs: z.record(z.unknown()).default({}),
});

const approvalSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

export const agentforgeRoutes: FastifyPluginAsync = async (app) => {
  // Requires authentication & tenant context
  app.addHook('preHandler', app.authenticate);

  // ---- GET /workflows — List workflows ----
  app.get('/workflows', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['agentforge'],
      summary: 'List workflows for the current tenant',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    const workflows = await prisma.workflow.findMany({
      where: { orgId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            _count: { select: { nodes: true, edges: true } },
          },
        },
        _count: {
          select: { runs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: workflows.map((wf) => {
        const latestVersion = wf.versions[0];
        return {
          id: wf.id,
          name: wf.name,
          description: wf.description,
          status: wf.status,
          currentVersion: latestVersion?.version || 1,
          nodesCount: latestVersion?._count.nodes || 0,
          edgesCount: latestVersion?._count.edges || 0,
          totalRuns: wf._count.runs,
          updatedAt: wf.updatedAt,
        };
      }),
    });
  });

  // ---- POST /workflows — Create workflow ----
  app.post('/workflows', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['agentforge'],
      summary: 'Create a new agent workflow',
    },
  }, async (request, reply) => {
    const parseResult = createWorkflowSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid workflow schema',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { name, description, nodes = [], edges = [] } = parseResult.data;
    const orgId = request.tenant!.orgId;

    // Get default workspace for org if not provided
    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
    });

    if (!workspace) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NO_WORKSPACE', message: 'No workspace found for organization' },
      });
    }

    // Default starting nodes if none provided
    const initialNodes = nodes.length > 0 ? nodes : [
      {
        id: 'node-input',
        nodeType: 'input' as WorkflowNodeType,
        label: 'Input Parameters',
        config: {},
        positionX: 100,
        positionY: 150,
      },
      {
        id: 'node-prompt',
        nodeType: 'prompt' as WorkflowNodeType,
        label: 'Prompt Template',
        config: { promptTemplate: 'You are an autonomous agent. Analyze the following query: {{query}}' },
        positionX: 350,
        positionY: 150,
      },
      {
        id: 'node-model',
        nodeType: 'model' as WorkflowNodeType,
        label: 'LLM Inference',
        config: { model: 'gpt-4o', temperature: 0.7 },
        positionX: 600,
        positionY: 150,
      },
      {
        id: 'node-output',
        nodeType: 'output' as WorkflowNodeType,
        label: 'Response Output',
        config: {},
        positionX: 850,
        positionY: 150,
      },
    ];

    const initialEdges = edges.length > 0 ? edges : [
      { id: 'edge-1', sourceNodeId: 'node-input', targetNodeId: 'node-prompt' },
      { id: 'edge-2', sourceNodeId: 'node-prompt', targetNodeId: 'node-model' },
      { id: 'edge-3', sourceNodeId: 'node-model', targetNodeId: 'node-output' },
    ];

    const workflow = await prisma.workflow.create({
      data: {
        orgId,
        workspaceId: workspace.id,
        name,
        description,
        status: 'published',
        createdById: request.user!.id,
        versions: {
          create: {
            version: 1,
            changelog: 'Initial version',
            nodes: {
              create: initialNodes.map((n) => ({
                id: n.id,
                nodeType: n.nodeType as WorkflowNodeType,
                label: n.label,
                config: n.config as object,
                positionX: n.positionX,
                positionY: n.positionY,
              })),
            },
            edges: {
              create: initialEdges.map((e) => ({
                id: e.id,
                sourceNodeId: e.sourceNodeId,
                targetNodeId: e.targetNodeId,
                sourceHandle: e.sourceHandle ?? null,
                targetHandle: e.targetHandle ?? null,
                condition: e.condition ?? null,
              })),
            },
          },
        },
      },
      include: {
        versions: {
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });

    await prisma.auditEvent.create({
      data: {
        orgId,
        userId: request.user!.id,
        action: 'agentforge.workflow.create',
        resource: 'workflow',
        resourceId: workflow.id,
        metadata: { name: workflow.name },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        version: workflow.versions[0]?.version,
        nodes: workflow.versions[0]?.nodes,
        edges: workflow.versions[0]?.edges,
      },
    });
  });

  // ---- GET /workflows/:workflowId — Workflow details ----
  app.get('/workflows/:workflowId', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['agentforge'],
      summary: 'Get workflow with nodes, edges, and recent runs',
    },
  }, async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    const orgId = request.tenant!.orgId;

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, orgId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            nodes: true,
            edges: true,
          },
        },
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            steps: {
              orderBy: { startedAt: 'asc' },
            },
          },
        },
      },
    });

    if (!workflow) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        currentVersion: workflow.versions[0],
        recentRuns: workflow.runs,
      },
    });
  });

  // ---- POST /workflows/:workflowId/run — Execute workflow ----
  app.post('/workflows/:workflowId/run', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['agentforge'],
      summary: 'Trigger execution of a workflow',
    },
  }, async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    const orgId = request.tenant!.orgId;

    const parseResult = triggerRunSchema.safeParse(request.body);
    const inputs = parseResult.success ? parseResult.data.inputs : {};

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, orgId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });

    if (!workflow || !workflow.versions[0]) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow or active version not found' },
      });
    }

    const version = workflow.versions[0];
    const startedAt = new Date();

    // 1. Create Run in Database
    const run = await prisma.workflowRun.create({
      data: {
        orgId,
        workspaceId: workflow.workspaceId,
        workflowId: workflow.id,
        versionId: version.id,
        status: 'running',
        triggeredBy: request.user!.email,
        inputs: inputs as object,
        startedAt,
      },
    });

    // 2. Execute via AgentForgeEngine
    const nodeItems: NodeItem[] = version.nodes.map((n) => ({
      id: n.id,
      nodeType: n.nodeType as NodeItem['nodeType'],
      label: n.label,
      config: n.config as NodeItem['config'],
    }));

    const edgeItems: EdgeItem[] = version.edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      condition: e.condition,
    }));

    const executionResult = await agentForgeEngine.executeWorkflow(
      nodeItems,
      edgeItems,
      inputs,
    );

    const finishedAt = new Date();

    // 3. Persist step traces
    for (const step of executionResult.stepTraces) {
      const runStep = await prisma.workflowRunStep.create({
        data: {
          runId: run.id,
          nodeId: step.nodeId,
          nodeType: step.nodeType as WorkflowNodeType,
          nodeLabel: step.nodeLabel,
          status: step.status,
          input: step.input as object,
          output: step.output as object,
          tokensUsed: step.tokensUsed,
          latencyMs: step.latencyMs,
          startedAt,
          finishedAt,
          error: step.error,
        },
      });

      if (step.status === 'waiting_approval') {
        await prisma.workflowApproval.create({
          data: {
            stepId: runStep.id,
            status: 'pending',
          },
        });
      }
    }

    // 4. Update Run status
    const updatedRun = await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: executionResult.status,
        outputs: executionResult.outputs as object,
        finishedAt,
        error: executionResult.error,
      },
      include: {
        steps: true,
      },
    });

    return reply.status(201).send({
      success: true,
      data: updatedRun,
    });
  });

  // ---- GET /runs — List recent runs ----
  app.get('/runs', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['agentforge'],
      summary: 'List recent workflow execution runs',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    const runs = await prisma.workflowRun.findMany({
      where: { orgId },
      include: {
        workflow: {
          select: { name: true },
        },
        _count: {
          select: { steps: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.send({
      success: true,
      data: runs.map((r) => ({
        id: r.id,
        workflowId: r.workflowId,
        workflowName: r.workflow.name,
        status: r.status,
        triggeredBy: r.triggeredBy,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt,
        totalSteps: r._count.steps,
      })),
    });
  });

  // ---- GET /runs/:runId — Run trace details ----
  app.get('/runs/:runId', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['agentforge'],
      summary: 'Get workflow run step traces',
    },
  }, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const orgId = request.tenant!.orgId;

    const run = await prisma.workflowRun.findFirst({
      where: { id: runId, orgId },
      include: {
        workflow: true,
        steps: {
          include: {
            approvals: true,
          },
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!run) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow run not found' },
      });
    }

    return reply.send({
      success: true,
      data: run,
    });
  });

  // ---- POST /runs/:runId/steps/:stepId/approve — Decision gate ----
  app.post('/runs/:runId/steps/:stepId/approve', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['agentforge'],
      summary: 'Approve or reject a human-in-the-loop step',
    },
  }, async (request, reply) => {
    const { runId, stepId } = request.params as { runId: string; stepId: string };
    const parseResult = approvalSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid approval decision' },
      });
    }

    const { decision, reason } = parseResult.data;

    const approval = await prisma.workflowApproval.findFirst({
      where: { stepId, status: 'pending' },
    });

    if (!approval) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Pending approval gate not found' },
      });
    }

    const updatedApproval = await prisma.workflowApproval.update({
      where: { id: approval.id },
      data: {
        status: decision,
        reviewerId: request.user!.id,
        decisionReason: reason || null,
        decidedAt: new Date(),
      },
    });

    await prisma.workflowRunStep.update({
      where: { id: stepId },
      data: {
        status: decision === 'approved' ? 'completed' : 'failed',
      },
    });

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: decision === 'approved' ? 'completed' : 'failed',
      },
    });

    return reply.send({
      success: true,
      data: updatedApproval,
    });
  });
};
