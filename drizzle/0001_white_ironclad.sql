ALTER TABLE `applications` ADD `service` text DEFAULT 'scholarship' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `details` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `decision_note` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `decided_at` text;