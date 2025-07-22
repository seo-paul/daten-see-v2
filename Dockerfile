# Dockerfile for Next.js 15 with TypeScript
# Multi-stage build optimized for development and production

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Development Dependencies + Build
FROM node:18-alpine AS dev-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Stage 3: Development Container
FROM node:18-alpine AS development
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy dependencies and source
COPY --from=dev-deps /app/node_modules ./node_modules
COPY --from=dev-deps --chown=nextjs:nodejs /app .

# Expose Next.js development port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Switch to non-root user
USER nextjs

# Development command with hot reload
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Stage 4: Builder for Production
FROM dev-deps AS builder
WORKDIR /app

# Build the application
RUN npm run build

# Stage 5: Production Runtime
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Expose production port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Switch to non-root user
USER nextjs

# Production command
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]