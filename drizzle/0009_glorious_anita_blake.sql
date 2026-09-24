CREATE TABLE `opponents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`city` text NOT NULL,
	`team_name` text NOT NULL,
	`default_strength` text DEFAULT 'Equal' NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
