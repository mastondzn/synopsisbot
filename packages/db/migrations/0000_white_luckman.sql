CREATE TABLE IF NOT EXISTS "authed_users" (
	"twitch_id" varchar(256) PRIMARY KEY NOT NULL,
	"twitch_login" varchar(256) NOT NULL,
	"scopes" varchar(256)[] NOT NULL,
	"access_token" varchar(256) NOT NULL,
	"refresh_token" varchar(256) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"obtained_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"twitch_id" varchar(256) PRIMARY KEY NOT NULL,
	"twitch_login" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"mode" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command_users" (
	"twitch_id" varchar(256) PRIMARY KEY NOT NULL,
	"twitch_login" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"hydration_points" integer DEFAULT 0 NOT NULL,
	"hydrated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_permissions" (
	"user_id" varchar(256) PRIMARY KEY NOT NULL,
	"user_login" varchar(256) NOT NULL,
	"permission" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "local_permissions" (
	"channel_id" varchar(256) NOT NULL,
	"channel_login" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"user_login" varchar(256) NOT NULL,
	"permission" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT local_permissions_channel_id_user_id PRIMARY KEY("channel_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_states" (
	"state" varchar(64) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commands" (
	"name" varchar(64) PRIMARY KEY NOT NULL,
	"description" varchar(512),
	"aliases" varchar(64)[],
	"usage" varchar(4096),
	"user_cooldown" integer DEFAULT 10 NOT NULL,
	"global_cooldown" integer DEFAULT 3 NOT NULL,
	"permission" varchar(64) DEFAULT 'normal' NOT NULL,
	"global_permission" varchar(64) DEFAULT 'normal' NOT NULL,
	"permission_mode" varchar(64) DEFAULT 'all' NOT NULL
);
