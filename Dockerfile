FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first, then api
RUN pnpm --filter @evil-spirit/shared build
RUN pnpm --filter @evil-spirit/api build

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
