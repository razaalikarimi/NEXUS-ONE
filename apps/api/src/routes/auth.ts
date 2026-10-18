// ============================================================
// Auth Routes — /api/v1/auth
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@nexus-one/database';
import {
  hashPassword,
  verifyPassword,
  createSession,
  invalidateSession,
} from '@nexus-one/auth';
import { registerSchema, loginSchema } from '@nexus-one/validators';

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ---- POST /register ----
  app.post('/register', {
    schema: {
      tags: ['auth'],
      summary: 'Register a new user account',
      description: 'Creates user, personal organization, default workspace, and session.',
    },
  }, async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration input',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { email, password, name } = parseResult.data;

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    const passwordHash = await hashPassword(password);

    // Create user along with a personal default organization
    const baseSlug = email.split('@')[0]?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'workspace';
    const orgSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: false,
        memberships: {
          create: {
            role: 'owner',
            organization: {
              create: {
                name: `${name}'s Workspace`,
                slug: orgSlug,
                plan: 'starter',
                workspaces: {
                  create: {
                    name: 'Primary',
                    slug: 'primary',
                    settings: {},
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    const session = await createSession({
      userId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.setCookie('session_token', session.token, {
      path: '/',
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        token: session.token,
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          role: m.role,
        })),
      },
    });
  });

  // ---- POST /login ----
  app.post('/login', {
    schema: {
      tags: ['auth'],
      summary: 'Authenticate with email and password',
    },
  }, async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid credentials format',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
        },
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
        },
      });
    }

    const session = await createSession({
      userId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.setCookie('session_token', session.token, {
      path: '/',
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        token: session.token,
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          role: m.role,
        })),
      },
    });
  });

  // ---- POST /logout ----
  app.post('/logout', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Terminate current session',
    },
  }, async (request, reply) => {
    if (request.session?.token) {
      await invalidateSession(request.session.token);
    }

    reply.clearCookie('session_token', { path: '/' });

    return reply.send({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  // ---- GET /me ----
  app.get('/me', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Get current user profile and memberships',
    },
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                workspaces: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User does not exist.' },
      });
    }

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          plan: m.organization.plan,
          role: m.role,
          workspaces: m.organization.workspaces.map((w) => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
          })),
        })),
      },
    });
  });
};
