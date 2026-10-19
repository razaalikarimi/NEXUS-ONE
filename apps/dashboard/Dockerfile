# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root lockfiles & configs
COPY package*.json turbo.json tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/dashboard/ ./apps/dashboard/

# Install dependencies and build dashboard
RUN npm ci
RUN npx turbo build --filter=@nexus-one/dashboard

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
