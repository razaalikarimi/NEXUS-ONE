// ============================================================
// Fastify Tenant & RBAC Isolation Plugin
// ============================================================

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@nexus-one/database';
import { isRoleAtLeast, type Role } from '@nexus-one/auth';

export interface TenantContext {
  orgId: string;
  role: Role;
  membershipId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    tenant?: TenantContext;
  }
  interface FastifyInstance {
    requireTenant: (
      minimumRole?: Role,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const tenantPlugin: FastifyPluginAsync = async (app) => {
  app.decorate(
    'requireTenant',
    (minimumRole: Role = 'viewer') => {
      return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        // Ensure user is authenticated first
        if (!request.user) {
          reply.status(401).send({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required before tenant evaluation.',
            },
          });
          return;
        }

        // Extract organization ID from header or path params
        const params = request.params as Record<string, string> | undefined;
        const orgId =
          (request.headers['x-org-id'] as string) ||
          params?.['orgId'];

        if (!orgId) {
          reply.status(400).send({
            success: false,
            error: {
              code: 'MISSING_ORG_CONTEXT',
              message: 'Organization context is required. Pass X-Org-Id header or orgId parameter.',
            },
          });
          return;
        }

        const membership = await prisma.membership.findUnique({
          where: {
            userId_orgId: {
              userId: request.user.id,
              orgId,
            },
          },
        });

        if (!membership || membership.status !== 'active') {
          reply.status(403).send({
            success: false,
            error: {
              code: 'FORBIDDEN_TENANT_ACCESS',
              message: 'You do not have active membership in this organization.',
            },
          });
          return;
        }

        const userRole = membership.role as Role;
        if (!isRoleAtLeast(userRole, minimumRole)) {
          reply.status(403).send({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `This action requires at least '${minimumRole}' role. Your role is '${userRole}'.`,
            },
          });
          return;
        }

        request.tenant = {
          orgId,
          role: userRole,
          membershipId: membership.id,
        };
      };
    },
  );
};

export default fp(tenantPlugin);
