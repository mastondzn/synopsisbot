FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS builder
# Set working directory
WORKDIR /app
RUN pnpm add turbo --global
COPY . .
RUN turbo prune @synopsis/website --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo build --filter=@synopsis/website...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/website/next.config.mjs .
COPY --from=installer /app/website/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/website/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/website/.next/static ./website/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/website/public ./website/public

CMD PORT=3001 node website/server.js