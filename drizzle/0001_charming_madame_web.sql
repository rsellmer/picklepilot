CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`opponent` text NOT NULL,
	`match_date` text NOT NULL,
	`match_time` text NOT NULL,
	`location` text NOT NULL,
	`opponent_strength` text DEFAULT 'Equal' NOT NULL,
	`player_ids` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'Upcoming' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
