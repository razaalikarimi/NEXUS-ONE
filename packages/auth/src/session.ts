// ============================================================
// @nexus-one/auth — Session Management
// ============================================================

import { prisma } from '@nexus-one/database';
import { generateSessionToken } from './tokens.js';

export const SESSION_DURATION_DAYS = 30;

export interface SessionContext {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    emailVerified: boolean;
  };
}

/**
 * Creates a new session record in PostgreSQL for the given user.
 */
export async function createSession(params: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<SessionContext> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      token,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      expiresAt,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
        },
      },
    },
  });

  return {
    id: session.id,
    userId: session.userId,
    token: session.token,
    expiresAt: session.expiresAt,
    user: session.user,
  };
}

/**
 * Validates a session token and returns the session with user details.
 * Automatically deletes expired sessions.
 */
export async function validateSession(token: string): Promise<SessionContext | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    token: session.token,
    expiresAt: session.expiresAt,
    user: session.user,
  };
}

/**
 * Invalidates (deletes) a session by token.
 */
export async function invalidateSession(token: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { token },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Invalidates all active sessions for a user (e.g. on password change).
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}
