-- CreateEnum
CREATE TYPE "ChannelMode" AS ENUM ('ALL', 'OFFLINEONLY', 'READONLY');

-- CreateEnum
CREATE TYPE "GlobalPermissions" AS ENUM ('OWNER', 'NORMAL', 'BANNED');

-- CreateEnum
CREATE TYPE "LocalPermissions" AS ENUM ('BROADCASTER', 'AMBASSADOR', 'MODERATOR', 'VIP', 'SUBSCRIBER', 'NORMAL', 'BANNED');

-- CreateTable
CREATE TABLE "AuthedUser" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "twitchLogin" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP NOT NULL,
    "obtainedAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthedUser_pkey" PRIMARY KEY ("twitchId","twitchLogin")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "twitchLogin" TEXT NOT NULL,
    "mode" "ChannelMode" NOT NULL DEFAULT 'OFFLINEONLY',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("twitchId","twitchLogin")
);

-- CreateTable
CREATE TABLE "BotUser" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "twitchLogin" TEXT NOT NULL,
    "hydrationPoints" INTEGER NOT NULL DEFAULT 0,
    "hydratedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotUser_pkey" PRIMARY KEY ("twitchId","twitchLogin")
);

-- CreateTable
CREATE TABLE "GlobalPermission" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "twitchLogin" TEXT NOT NULL,
    "permission" "GlobalPermissions" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalPermission_pkey" PRIMARY KEY ("twitchId","twitchLogin")
);

-- CreateTable
CREATE TABLE "LocalPermission" (
    "id" SERIAL NOT NULL,
    "twitchChannelId" TEXT NOT NULL,
    "twitchChannelLogin" TEXT NOT NULL,
    "twitchUserId" TEXT NOT NULL,
    "twitchUserLogin" TEXT NOT NULL,
    "permission" "LocalPermissions" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalPermission_pkey" PRIMARY KEY ("twitchChannelId","twitchChannelLogin","twitchUserId","twitchUserLogin")
);

-- CreateTable
CREATE TABLE "Command" (
    "name" TEXT NOT NULL,
    "description" TEXT,
    "aliases" TEXT[],
    "usage" TEXT,
    "userCooldown" INTEGER NOT NULL DEFAULT 10,
    "globalCooldown" INTEGER NOT NULL DEFAULT 3,
    "localPermission" TEXT NOT NULL DEFAULT 'normal',
    "globalPermission" TEXT NOT NULL DEFAULT 'normal',
    "permissionMode" TEXT NOT NULL DEFAULT 'all',

    CONSTRAINT "Command_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "AuthState" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthState_pkey" PRIMARY KEY ("state")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthedUser_twitchId_key" ON "AuthedUser"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthedUser_twitchLogin_key" ON "AuthedUser"("twitchLogin");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_twitchId_key" ON "Channel"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_twitchLogin_key" ON "Channel"("twitchLogin");

-- CreateIndex
CREATE UNIQUE INDEX "BotUser_twitchId_key" ON "BotUser"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "BotUser_twitchLogin_key" ON "BotUser"("twitchLogin");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPermission_twitchId_key" ON "GlobalPermission"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPermission_twitchLogin_key" ON "GlobalPermission"("twitchLogin");
