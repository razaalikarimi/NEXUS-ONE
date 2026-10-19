FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json turbo.json tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN npm ci
RUN npm run db:generate
RUN npx turbo build --filter=@nexus-one/api

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install openssl for Prisma query engine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Run as non-root user
USER node

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
