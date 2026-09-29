UPDATE `team_settings`
SET `public_slug` = 'chambly'
WHERE lower(`team_name`) LIKE '%chambly%'
  AND `public_slug` <> 'chambly';
