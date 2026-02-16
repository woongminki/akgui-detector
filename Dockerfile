FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package (with pre-built dist)
COPY packages/shared ./packages/shared

# Copy api package
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build only api (shared is pre-built)
RUN pnpm --filter @evil-spirit/api build

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
