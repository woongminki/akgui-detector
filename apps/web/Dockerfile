FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package (with pre-built dist)
COPY packages/shared ./packages/shared

# Copy web package
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/web

# Build with standalone output
RUN pnpm build

# Production stage - minimal image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Use Railway's injected PORT
CMD node apps/web/server.js
