import { getDb } from "../../../../db";
import {
  appSessions, appUsers, captainProfiles, leagueAdminProfiles, leagueLevels,
  leagueMatches, leagueSeasons, leagueTeams, leagueVenues, matches, opponents,
  organizations, players, playerRules, seasons, teamSettings, venues,
} from "../../../../db/schema";
import { requireUser } from "../../auth/security";

type Backup = { format: string; version: number; data: Record<string, unknown[]> };
const requiredTables = [
  "organizations", "appUsers", "leagueAdminProfiles", "leagueSeasons", "leagueLevels",
  "leagueTeams", "captainProfiles", "leagueVenues", "leagueMatches", "teamSettings",
  "players", "matches", "seasons", "venues", "opponents", "playerRules",
];

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  if (auth.user!.role !== "LeagueAdmin") return Response.json({ error: "League administrator access required" }, { status: 403 });

  const backup = await request.json() as Backup;
  if (backup.format !== "picklepilot-migration" || backup.version !== 1 || !backup.data) return Response.json({ error: "This is not a valid PicklePilot migration backup" }, { status: 400 });
  if (requiredTables.some((table) => !Array.isArray(backup.data[table]))) return Response.json({ error: "The backup is incomplete" }, { status: 400 });
  if (backup.data.organizations.length !== 1 || backup.data.leagueAdminProfiles.length !== 1) return Response.json({ error: "The backup must contain exactly one Interclub organization" }, { status: 400 });

  const db = getDb();
  const destinationUsers = await db.select({ id: appUsers.id }).from(appUsers);
  if (destinationUsers.length !== 1 || destinationUsers[0].id !== auth.user!.id) return Response.json({ error: "Import is only allowed into a newly created empty destination" }, { status: 409 });

  const insertRows = (table: Parameters<typeof db.insert>[0], rows: unknown[]) => rows.map((row) => db.insert(table).values(row as never));
  await db.batch([
    db.delete(appSessions), db.delete(playerRules), db.delete(leagueMatches), db.delete(matches),
    db.delete(players), db.delete(opponents), db.delete(venues), db.delete(seasons),
    db.delete(captainProfiles), db.delete(leagueTeams), db.delete(leagueLevels), db.delete(leagueVenues),
    db.delete(leagueSeasons), db.delete(leagueAdminProfiles), db.delete(appUsers), db.delete(teamSettings), db.delete(organizations),
    ...insertRows(organizations, backup.data.organizations),
    ...insertRows(teamSettings, backup.data.teamSettings),
    ...insertRows(appUsers, backup.data.appUsers),
    ...insertRows(leagueAdminProfiles, backup.data.leagueAdminProfiles),
    ...insertRows(leagueSeasons, backup.data.leagueSeasons),
    ...insertRows(leagueLevels, backup.data.leagueLevels),
    ...insertRows(leagueTeams, backup.data.leagueTeams),
    ...insertRows(captainProfiles, backup.data.captainProfiles),
    ...insertRows(leagueVenues, backup.data.leagueVenues),
    ...insertRows(leagueMatches, backup.data.leagueMatches),
    ...insertRows(players, backup.data.players),
    ...insertRows(matches, backup.data.matches),
    ...insertRows(seasons, backup.data.seasons),
    ...insertRows(venues, backup.data.venues),
    ...insertRows(opponents, backup.data.opponents),
    ...insertRows(playerRules, backup.data.playerRules),
  ]);
  return Response.json({ ok: true, imported: Object.fromEntries(requiredTables.map((table) => [table, backup.data[table].length])) });
}