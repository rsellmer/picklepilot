CREATE TABLE `availability_polls` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `match_id` integer NOT NULL,
  `team_id` integer NOT NULL,
  `token` text NOT NULL,
  `status` text DEFAULT 'Open' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `availability_polls_match_id_unique` ON `availability_polls` (`match_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `availability_polls_token_unique` ON `availability_polls` (`token`);
--> statement-breakpoint
CREATE TABLE `availability_responses` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `poll_id` integer NOT NULL,
  `player_id` integer NOT NULL,
  `response` text NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `availability_poll_player_unique` ON `availability_responses` (`poll_id`,`player_id`);
