// ============================================================
// Fastify Auth Plugin
// ============================================================

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { validateSession, type SessionContext } from '@nexus-one/auth';

declare module 'fastify' {
  interface FastifyRequest {
    session?: SessionContext;
    user?: SessionContext['user'];
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      // 1. Try Authorization header Bearer token
      let token: string | undefined;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }

      // 2. Fall back to cookie
      if (!token && request.cookies?.session_token) {
        token = request.cookies.session_token;
      }

      if (!token) {
        reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please provide a valid session token.',
          },
        });
        return;
      }

      const session = await validateSession(token);
      if (!session) {
        reply.status(401).send({
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session has expired or is invalid. Please log in again.',
          },
        });
        return;
      }

      request.session = session;
      request.user = session.user;
    },
  );
};

export default fp(authPlugin);
