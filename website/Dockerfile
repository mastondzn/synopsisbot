FROM node:20-alpine AS pruner
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@synopsis/website --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS builder
ARG TURBO_TEAM
ARG TURBO_TOKEN

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add pnpm

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
ENV TURBO_TEAM=$TURBO_TEAM

ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=@synopsis/website...

FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/website/next.config.js .
COPY --from=builder /app/website/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/website/next.config.js .
COPY --from=builder --chown=nextjs:nodejs /app/website/package.json .
COPY --from=builder --chown=nextjs:nodejs /app/website/public ./website/public

COPY --from=builder --chown=nextjs:nodejs /app/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/website/.next/static ./website/.next/static

CMD node website/server.js