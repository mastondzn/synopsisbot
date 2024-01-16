FROM node:20 AS pruner
RUN apt-get update && \
    apt-get install -y libc6-dev

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@synopsis/bot

FROM node:20 AS runner
RUN apt-get update && \
    apt-get install -y libc6-dev

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