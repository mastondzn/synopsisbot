CREATE TABLE IF NOT EXISTS "global_permissions" (
	"user_id" varchar(256) PRIMARY KEY NOT NULL,
	"user_login" varchar(256) NOT NULL,
	"permission" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "local_permissions" (
	"channel_id" varchar(256),
	"channel_login" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"user_login" varchar(256) NOT NULL,
	"permission" varchar(64) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "local_permissions" ADD CONSTRAINT "local_permissions_channel_id_user_id" PRIMARY KEY("channel_id","user_id");

DO $$ BEGIN
 ALTER TABLE "local_permissions" ADD CONSTRAINT "local_permissions_channel_id_channels_twitch_id_fk" FOREIGN KEY ("channel_id") REFERENCES "channels"("twitch_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
