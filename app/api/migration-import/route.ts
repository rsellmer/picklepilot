import { getDb } from "../../../db";
import {
  appSessions,
  appUsers,
  matches,
  opponents,
  playerRules,
  players,
  seasons,
  teamSettings,
  venues,
} from "../../../db/schema";
import { requireUser } from "../auth/security";

type Backup = {
  format?: string;
  version?: number;
  data?: {
    team?: Record<string, unknown>;
    users?: Array<Record<string, unknown>>;
    players?: Array<Record<string, unknown>>;
    matches?: Array<Record<string, unknown>>;
    seasons?: Array<Record<string, unknown>>;
    venues?: Array<Record<string, unknown>>;
    opponents?: Array<Record<string, unknown>>;
    playerRules?: Array<Record<string, unknown>>;
  };
};

const records = (value: unknown) => Array.isArray(value) ? value as Array<Record<string, unknown>> : [];

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  const backup = await request.json() as Backup;
  if (backup.format !== "picklepilot-captain-backup" || backup.version !== 1 || !backup.data?.team) {
    return Response.json({ error: "This is not a valid PicklePilot Captain backup." }, { status: 400 });
  }

  const db = getDb();
  const destinationUsers = await db.select({ id: appUsers.id }).from(appUsers);
  if (destinationUsers.length !== 1) {
    return Response.json({ error: "Import is available only before this new Captain workspace is used." }, { status: 409 });
  }

  const users = records(backup.data.users);
  if (!users.length) return Response.json({ error: "The backup has no account to restore." }, { status: 400 });

  await db.batch([
    db.delete(appSessions),
    db.delete(playerRules),
    db.delete(matches),
    db.delete(players),
    db.delete(seasons),
    db.delete(venues),
    db.delete(opponents),
    db.delete(appUsers),
    db.delete(teamSettings),
  ]);

  await db.insert(teamSettings).values(backup.data.team as typeof teamSettings.$inferInsert);
  await db.insert(appUsers).values(users as Array<typeof appUsers.$inferInsert>);

  const operations = [
    [players, records(backup.data.players)],
    [matches, records(backup.data.matches)],
    [seasons, records(backup.data.seasons)],
    [venues, records(backup.data.venues)],
    [opponents, records(backup.data.opponents)],
    [playerRules, records(backup.data.playerRules)],
  ] as const;

  for (const [table, rows] of operations) {
    if (rows.length) await db.insert(table).values(rows as never);
  }

  return Response.json({ ok: true });
}
