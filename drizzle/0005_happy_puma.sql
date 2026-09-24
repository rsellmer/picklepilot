CREATE TABLE `app_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_sessions_token_hash_unique` ON `app_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `app_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`role` text DEFAULT 'User' NOT NULL,
	`team_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_users_username_unique` ON `app_users` (`username`);--> statement-breakpoint
CREATE TABLE `player_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_a_id` integer NOT NULL,
	`player_b_id` integer NOT NULL,
	`rule_type` text NOT NULL,
	`minimum_games` integer DEFAULT 1 NOT NULL,
	`team_id` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_name` text DEFAULT 'Chambly A' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `matches` ADD `team_id` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `team_id` integer DEFAULT 1 NOT NULL;