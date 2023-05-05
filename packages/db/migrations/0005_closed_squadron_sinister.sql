ALTER TABLE "global_permissions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "local_permissions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;