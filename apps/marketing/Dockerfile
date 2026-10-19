FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json turbo.json tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/marketing/ ./apps/marketing/

RUN npm ci
RUN npx turbo build --filter=@nexus-one/marketing

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/marketing/ ./apps/marketing/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/marketing/.next ./apps/marketing/.next

USER node

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "apps/marketing"]
