ALTER TABLE `matches` ADD `home_away` text DEFAULT 'Local' NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `court_1` text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `court_2` text DEFAULT '2' NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `court_3` text DEFAULT '3' NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `warmup_minutes` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `round_minutes` integer DEFAULT 12 NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `break_minutes` integer DEFAULT 2 NOT NULL;