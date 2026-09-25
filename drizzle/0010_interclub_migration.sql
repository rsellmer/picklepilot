ALTER TABLE `app_users` ADD `preferred_language` text DEFAULT 'fr' NOT NULL;--> statement-breakpoint
CREATE TABLE `organizations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE `league_admin_profiles` (
  `user_id` integer PRIMARY KEY NOT NULL,
  `organization_id` integer NOT NULL,
  `display_name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX `league_admin_profiles_email_unique` ON `league_admin_profiles` (`email`);--> statement-breakpoint
CREATE TABLE `league_seasons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `organization_id` integer NOT NULL,
  `name` text NOT NULL,
  `status` text DEFAULT 'Active' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `closed_at` text
);--> statement-breakpoint
CREATE TABLE `league_levels` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `organization_id` integer NOT NULL,
  `season_id` integer NOT NULL,
  `name` text NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'Active' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE `league_teams` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `organization_id` integer NOT NULL,
  `season_id` integer NOT NULL,
  `level_id` integer NOT NULL,
  `city` text NOT NULL,
  `team_name` text NOT NULL,
  `captain_user_id` integer,
  `status` text DEFAULT 'Active' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE `captain_profiles` (
  `user_id` integer PRIMARY KEY NOT NULL,
  `organization_id` integer NOT NULL,
  `league_team_id` integer NOT NULL,
  `display_name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text,
  `must_change_password` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE `league_venues` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `organization_id` integer NOT NULL,
  `name` text NOT NULL,
  `address` text,
  `venue_type` text DEFAULT 'Indoor' NOT NULL,
  `courts` text DEFAULT '[]' NOT NULL,
  `status` text DEFAULT 'Active' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE `league_matches` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `organization_id` integer NOT NULL,
  `season_id` integer NOT NULL,
  `level_id` integer NOT NULL,
  `venue_id` integer NOT NULL,
  `match_date` text NOT NULL,
  `match_time` text DEFAULT '20:00' NOT NULL,
  `home_team_id` integer NOT NULL,
  `visitor_team_id` integer NOT NULL,
  `courts` text NOT NULL,
  `home_wins` integer,
  `visitor_wins` integer,
  `result_outcome` text,
  `result_submitted_at` text,
  `reschedule_comment` text,
  `status` text DEFAULT 'Scheduled' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);