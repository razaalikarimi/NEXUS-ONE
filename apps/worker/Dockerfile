FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json turbo.json tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

RUN npm ci
RUN npm run db:generate
RUN npx turbo build --filter=@nexus-one/worker

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/worker/package.json ./apps/worker/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

USER node

CMD ["node", "apps/worker/dist/index.js"]
