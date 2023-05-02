FROM node:18-alpine AS pruner

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .

RUN turbo prune --scope=@synopsis/bot --docker

# ////////////////////////////
# ////////////////////////////
# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS runner

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

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

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo run build --filter=@synopsis/bot...
WORKDIR /app/bot
CMD pnpm start