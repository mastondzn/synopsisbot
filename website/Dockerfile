FROM node:18-alpine AS pruner
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@synopsis/website --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS builder
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
# ENV TURBO_TEAM=$TURBO_TEAM
# ENV TURBO_TOKEN=$TURBO_TOKEN
ENV NODE_ENV=$NODE_ENV
ENV DB_HOST=$DB_HOST
ENV DB_NAME=$DB_NAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_USERNAME=$DB_USERNAME
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV TWITCH_BOT_ID=$TWITCH_BOT_ID
ENV TWITCH_BOT_USERNAME=$TWITCH_BOT_USERNAME
ENV TWITCH_CLIENT_ID=$TWITCH_CLIENT_ID
ENV TWITCH_CLIENT_SECRET=$TWITCH_CLIENT_SECRET
ENV TWITCH_BOT_OWNER_ID=$TWITCH_BOT_OWNER_ID
ENV TWITCH_BOT_OWNER_USERNAME=$TWITCH_BOT_OWNER_USERNAME
ENV DOMAIN_NAME=$DOMAIN_NAME
ENV NEXT_PUBLIC_TWITCH_BOT_ID=$NEXT_PUBLIC_TWITCH_BOT_ID
ENV NEXT_PUBLIC_TWITCH_BOT_USERNAME=$NEXT_PUBLIC_TWITCH_BOT_USERNAME
ENV NEXT_PUBLIC_TWITCH_CLIENT_ID=$NEXT_PUBLIC_TWITCH_CLIENT_ID
ENV NEXT_PUBLIC_DOMAIN_NAME=$NEXT_PUBLIC_DOMAIN_NAME

RUN pnpm turbo run build --filter=@synopsis/website...

FROM node:18-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/website/next.config.mjs .
COPY --from=builder /app/website/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/website/next.config.mjs .
COPY --from=builder --chown=nextjs:nodejs /app/website/package.json .
COPY --from=builder --chown=nextjs:nodejs /app/website/public ./website/public

COPY --from=builder --chown=nextjs:nodejs /app/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/website/.next/static ./website/.next/static

CMD node website/server.js