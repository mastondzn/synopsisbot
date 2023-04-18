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

CREATE TABLE IF NOT EXISTS "auth_nonces" (
	"nonce" varchar(64) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_states" (
	"state" varchar(64) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
