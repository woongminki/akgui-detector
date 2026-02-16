FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy all config files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy package.json files for workspace
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy ALL source files (including tsconfig.json files)
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Debug: show tsconfig content
RUN cat /app/packages/shared/tsconfig.json

# Build shared package first, then api
RUN cd /app/packages/shared && pnpm build
RUN cd /app/apps/api && pnpm build

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
