CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "village_tile" (
	"id" text PRIMARY KEY NOT NULL,
	"color" varchar(255) NOT NULL,
	"height" integer NOT NULL,
	"isBuilding" boolean NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"z" integer NOT NULL,
	"q" integer NOT NULL,
	"r" integer NOT NULL,
	"s" integer NOT NULL,
	"resources" integer NOT NULL,
	"lastHarvested" integer NOT NULL,
	"buildingRotation" integer,
	"type" varchar(255) NOT NULL
);
