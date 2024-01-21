DROP TABLE "commands";--> statement-breakpoint
ALTER TABLE "local_permissions" DROP CONSTRAINT "local_permissions_channel_id_user_id";--> statement-breakpoint
ALTER TABLE "local_permissions" ADD CONSTRAINT "local_permissions_channel_id_user_id_pk" PRIMARY KEY("channel_id","user_id");