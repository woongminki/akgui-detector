FROM node:20-alpine

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

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
