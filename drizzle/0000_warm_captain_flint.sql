CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`citizen_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`consent` integer DEFAULT 1 NOT NULL,
	`expires_at` text NOT NULL,
	`scopes` text NOT NULL,
	`result` text,
	`email` text,
	`statement` text,
	`created_at` text NOT NULL,
	`submitted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_applications_owner_created` ON `applications` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`application_id` text,
	`action` text NOT NULL,
	`department` text,
	`outcome` text NOT NULL,
	`details` text NOT NULL,
	`duration_ms` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_owner_created` ON `audit` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `checks` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`department` text NOT NULL,
	`raw` text NOT NULL,
	`normalized` text NOT NULL,
	`checked_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_checks_application_department` ON `checks` (`application_id`,`department`);