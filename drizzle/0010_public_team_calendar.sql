ALTER TABLE `team_settings` ADD COLUMN `public_slug` text;
UPDATE `team_settings` SET `public_slug` = 'chambly' WHERE `id` = 1 AND (`public_slug` IS NULL OR `public_slug` = '');
UPDATE `team_settings` SET `public_slug` = 'team-' || `id` WHERE `public_slug` IS NULL OR `public_slug` = '';
CREATE UNIQUE INDEX `team_settings_public_slug_unique` ON `team_settings` (`public_slug`);
