// ============================================================
// Organization Routes — /api/v1/organizations
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@nexus-one/database';
import { createOrgSchema, updateOrgSchema, inviteMemberSchema } from '@nexus-one/validators';
import { generateToken } from '@nexus-one/auth';

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  // All routes here require authentication
  app.addHook('preHandler', app.authenticate);

  // ---- GET / — List user's organizations ----
  app.get('/', {
    schema: {
      tags: ['organizations'],
      summary: 'List all organizations current user belongs to',
    },
  }, async (request, reply) => {
    const memberships = await prisma.membership.findMany({
      where: {
        userId: request.user!.id,
        status: 'active',
      },
      include: {
        organization: {
          include: {
            workspaces: true,
            _count: {
              select: { memberships: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const organizations = memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      plan: m.organization.plan,
      role: m.role,
      joinedAt: m.joinedAt,
      memberCount: m.organization._count.memberships,
      workspaces: m.organization.workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
      })),
    }));

    return reply.send({
      success: true,
      data: organizations,
    });
  });

  // ---- POST / — Create new organization ----
  app.post('/', {
    schema: {
      tags: ['organizations'],
      summary: 'Create a new organization',
    },
  }, async (request, reply) => {
    const parseResult = createOrgSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid organization input',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { name, slug } = parseResult.data;

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'SLUG_ALREADY_IN_USE',
          message: 'An organization with this slug already exists.',
        },
      });
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        plan: 'team',
        memberships: {
          create: {
            userId: request.user!.id,
            role: 'owner',
            status: 'active',
          },
        },
        workspaces: {
          create: {
            name: 'Default Workspace',
            slug: 'default',
            settings: {},
          },
        },
      },
      include: {
        workspaces: true,
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        orgId: org.id,
        userId: request.user!.id,
        action: 'organization.create',
        resource: 'organization',
        resourceId: org.id,
        metadata: { name: org.name, slug: org.slug },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        role: 'owner',
        workspaces: org.workspaces,
      },
    });
  });

  // ---- GET /:orgId — Organization details ----
  app.get('/:orgId', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['organizations'],
      summary: 'Get organization details',
    },
  }, async (request, reply) => {
    const org = await prisma.organization.findUnique({
      where: { id: request.tenant!.orgId },
      include: {
        workspaces: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!org) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Organization not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        ...org,
        role: request.tenant!.role,
        memberCount: org._count.memberships,
      },
    });
  });

  // ---- PATCH /:orgId — Update organization ----
  app.patch('/:orgId', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['organizations'],
      summary: 'Update organization name or settings',
    },
  }, async (request, reply) => {
    const parseResult = updateOrgSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const updated = await prisma.organization.update({
      where: { id: request.tenant!.orgId },
      data: {
        name: parseResult.data.name,
      },
    });

    await prisma.auditEvent.create({
      data: {
        orgId: updated.id,
        userId: request.user!.id,
        action: 'organization.update',
        resource: 'organization',
        resourceId: updated.id,
        metadata: parseResult.data,
        ipAddress: request.ip,
      },
    });

    return reply.send({
      success: true,
      data: updated,
    });
  });

  // ---- GET /:orgId/members — List organization members ----
  app.get('/:orgId/members', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['organizations'],
      summary: 'List organization members',
    },
  }, async (request, reply) => {
    const members = await prisma.membership.findMany({
      where: { orgId: request.tenant!.orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return reply.send({
      success: true,
      data: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    });
  });

  // ---- POST /:orgId/invitations — Invite member ----
  app.post('/:orgId/invitations', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['organizations'],
      summary: 'Invite a member to the organization',
    },
  }, async (request, reply) => {
    const parseResult = inviteMemberSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid invitation payload',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { email, role } = parseResult.data;
    const token = generateToken(24);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day invitation

    const invitation = await prisma.invitation.create({
      data: {
        orgId: request.tenant!.orgId,
        email,
        role,
        token,
        status: 'pending',
        invitedById: request.user!.id,
        expiresAt,
      },
    });

    await prisma.auditEvent.create({
      data: {
        orgId: request.tenant!.orgId,
        userId: request.user!.id,
        action: 'member.invite',
        resource: 'invitation',
        resourceId: invitation.id,
        metadata: { email, role },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        // NOTE: token is intentionally omitted — it is sent via email only
      },
    });
  });

  // ---- GET /:orgId/audit-logs — List audit events ----
  app.get('/:orgId/audit-logs', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['organizations'],
      summary: 'Query organization audit trail',
    },
  }, async (request, reply) => {
    const events = await prisma.auditEvent.findMany({
      where: { orgId: request.tenant!.orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return reply.send({
      success: true,
      data: events,
    });
  });
};
