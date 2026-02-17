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

# Build-time environment variables for Next.js (public, safe to expose)
ENV NEXT_PUBLIC_APP_URL=https://evil-spiritweb-production.up.railway.app
ENV NEXT_PUBLIC_API_URL=https://akgui-detector-production.up.railway.app/api
ENV NEXT_PUBLIC_KAKAO_CLIENT_ID=92c3b8a87fe1dbcc5828c4fe811c5753
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=891556613588-a5paousn7i7m9rqd7drtc2o5eh2jq6ib.apps.googleusercontent.com

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
