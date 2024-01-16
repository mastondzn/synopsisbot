FROM node:20-alpine AS base

FROM base AS pruner
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@synopsis/bot

FROM base AS runner
RUN apk add --no-cache libc6-compat
RUN apk update

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app
COPY --from=pruner /app/out .
WORKDIR /app/bot
RUN yarn global add pnpm
RUN pnpm install --frozen-lockfile

CMD pnpm start