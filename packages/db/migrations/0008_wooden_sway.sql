CREATE TABLE IF NOT EXISTS "commands" (
	"name" varchar(64) PRIMARY KEY NOT NULL,
	"description" varchar(512) NOT NULL,
	"aliases" varchar(64)[] NOT NULL,
	"usage" varchar(4096),
	"cooldown" integer DEFAULT 10,
	"global_cooldown" integer DEFAULT 10,
	"permission" varchar(64) DEFAULT 'normal',
	"global_permission" varchar(64) DEFAULT 'normal',
	"permission_mode" varchar(64) DEFAULT 'all'
);
