FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS pruner

WORKDIR /app
COPY . .
RUN pnpm install turbo --global
RUN turbo prune --scope=@synopsis/bot

FROM base AS runner

WORKDIR /app
COPY --from=pruner /app/out .
WORKDIR /app/bot
RUN pnpm install --frozen-lockfile

CMD pnpm start