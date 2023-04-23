CREATE TABLE IF NOT EXISTS "channels" (
	"twitch_id" varchar(256) PRIMARY KEY NOT NULL,
	"twitch_login" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"mode" varchar(256) NOT NULL
);
