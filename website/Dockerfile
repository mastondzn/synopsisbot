FROM node:20-alpine AS base

FROM base AS builder
RUN apt-get update && \
    apt-get install -y libc6-dev
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune @synopsis/website --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apt-get update && \
    apt-get install -y libc6-dev
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install pnpm -g
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo build --filter=@synopsis/website...

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