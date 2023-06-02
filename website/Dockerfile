FROM node:18-alpine AS pruner
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@synopsis/website
COPY ./.env /app/out/.env

FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat
RUN apk update

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app
COPY --from=pruner /app/out .
WORKDIR /app/website
RUN yarn global add pnpm
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm build
CMD pnpm start