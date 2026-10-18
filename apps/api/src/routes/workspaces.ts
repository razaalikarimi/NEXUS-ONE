// ============================================================
// Workspace Routes — /api/v1/workspaces
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@nexus-one/database';
import { createWorkspaceSchema } from '@nexus-one/validators';

export const workspaceRoutes: FastifyPluginAsync = async (app) => {
  // Requires user auth + tenant context
  app.addHook('preHandler', app.authenticate);

  // ---- GET / — List workspaces in organization ----
  app.get('/', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['workspaces'],
      summary: 'List workspaces for the current organization',
    },
  }, async (request, reply) => {
    const workspaces = await prisma.workspace.findMany({
      where: { orgId: request.tenant!.orgId },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({
      success: true,
      data: workspaces,
    });
  });

  // ---- POST / — Create new workspace in organization ----
  app.post('/', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['workspaces'],
      summary: 'Create a new workspace in the organization',
    },
  }, async (request, reply) => {
    const parseResult = createWorkspaceSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid workspace parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { name, slug } = parseResult.data;

    // Check slug uniqueness within organization
    const existing = await prisma.workspace.findUnique({
      where: {
        orgId_slug: {
          orgId: request.tenant!.orgId,
          slug,
        },
      },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'SLUG_ALREADY_IN_USE',
          message: 'A workspace with this slug already exists in this organization.',
        },
      });
    }

    const workspace = await prisma.workspace.create({
      data: {
        orgId: request.tenant!.orgId,
        name,
        slug,
        settings: {},
      },
    });

    await prisma.auditEvent.create({
      data: {
        orgId: request.tenant!.orgId,
        userId: request.user!.id,
        action: 'workspace.create',
        resource: 'workspace',
        resourceId: workspace.id,
        metadata: { name, slug },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      data: workspace,
    });
  });

  // ---- GET /:workspaceId — Get workspace by ID ----
  app.get('/:workspaceId', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['workspaces'],
      summary: 'Get workspace details by ID',
    },
  }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string };

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        orgId: request.tenant!.orgId,
      },
    });

    if (!workspace) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace not found in this organization' },
      });
    }

    return reply.send({
      success: true,
      data: workspace,
    });
  });
};
