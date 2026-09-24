import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { matches, players, seasons } from "../../../db/schema";
import { requireUser } from "../auth/security";

type MatchInput = {
  id?: number; opponent?: string; matchDate?: string; matchTime?: string;
  location?: string; opponentStrength?: "Weaker" | "Equal" | "Stronger";
  homeAway?: "Local" | "Visitor"; court1?: string; court2?: string; court3?: string;
  warmupMinutes?: number; roundMinutes?: number; breakMinutes?: number;
  playerIds?: number[]; lineup?: unknown; results?: Record<string, "W" | "L">; status?: "Upcoming" | "Completed"; seasonId?:number;
};

function values(input: MatchInput) {
  return {
    opponent: input.opponent!.trim(),
    matchDate: input.matchDate!,
    matchTime: input.matchTime!,
    location: input.location!.trim(),
    opponentStrength: input.opponentStrength ?? "Equal",
    homeAway: input.homeAway ?? "Local",
    court1: input.court1?.trim() || "1",
    court2: input.court2?.trim() || "2",
    court3: input.court3?.trim() || "3",
    warmupMinutes: input.warmupMinutes ?? 10,
    roundMinutes: input.roundMinutes ?? 12,
    breakMinutes: input.breakMinutes ?? 2,
    playerIds: JSON.stringify(input.playerIds ?? []),
    lineup: input.lineup ? JSON.stringify(input.lineup) : null,
    results: input.results ? JSON.stringify(input.results) : null,
    status: input.status ?? "Upcoming",
    seasonId:input.seasonId!,
  };
}

function valid(input: MatchInput) {
  return Boolean(input.opponent?.trim() && input.matchDate && input.matchTime && input.location?.trim() && input.seasonId);
}

function parsed(row: typeof matches.$inferSelect) {
  return { ...row, playerIds: JSON.parse(row.playerIds), lineup: row.lineup ? JSON.parse(row.lineup) : null, results: row.results ? JSON.parse(row.results) : {} };
}

type LineupRound = { courts: string[][]; rest: string[] };

function normalizedName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function repairLineup(lineup: string, participantNames: string[]) {
  const rounds = JSON.parse(lineup) as LineupRound[];
  const usedNames = [...new Set(rounds.flatMap(round => [...round.courts.flat(), ...round.rest]))];
  const mapping = new Map<string, string>();
  const claimed = new Set<string>();

  for (const oldName of usedNames) {
    const exact = participantNames.find(name => name === oldName);
    if (exact) {
      mapping.set(oldName, exact);
      claimed.add(exact);
    }
  }

  for (const oldName of usedNames.filter(name => !mapping.has(name))) {
    const candidates = participantNames.filter(name => !claimed.has(name) && normalizedName(name) === normalizedName(oldName));
    if (candidates.length === 1) {
      mapping.set(oldName, candidates[0]);
      claimed.add(candidates[0]);
    }
  }

  const unresolved = usedNames.filter(name => !mapping.has(name));
  const available = participantNames.filter(name => !claimed.has(name));
  if (unresolved.length === 1 && available.length === 1) mapping.set(unresolved[0], available[0]);

  const next = rounds.map(round => ({
    ...round,
    courts: round.courts.map(pair => pair.map(name => mapping.get(name) ?? name)),
    rest: round.rest.map(name => mapping.get(name) ?? name),
  }));
  const serialized = JSON.stringify(next);
  return { serialized, changed: serialized !== JSON.stringify(rounds) };
}

async function repairedRows(rows: Array<typeof matches.$inferSelect>, teamId: number) {
  const db = getDb();
  const teamPlayers = await db.select().from(players).where(eq(players.teamId, teamId));
  const byId = new Map(teamPlayers.map(player => [player.id, player.name]));
  const repaired: Array<typeof matches.$inferSelect> = [];
  for (const row of rows) {
    if (!row.lineup) {
      repaired.push(row);
      continue;
    }
    const participantNames = (JSON.parse(row.playerIds) as number[]).map(id => byId.get(id)).filter((name): name is string => Boolean(name));
    if (!participantNames.length) {
      repaired.push(row);
      continue;
    }
    const result = repairLineup(row.lineup, participantNames);
    if (result.changed) {
      await db.update(matches).set({ lineup: result.serialized }).where(and(eq(matches.id, row.id), eq(matches.teamId, teamId)));
      repaired.push({ ...row, lineup: result.serialized });
    } else repaired.push(row);
  }
  return repaired;
}

export async function GET(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (id) {
      const [row] = await getDb().select().from(matches).where(and(eq(matches.id, id),eq(matches.teamId,auth.user!.teamId)));
      if (!row) return Response.json({ error: "Match not found" }, { status: 404 });
      const [repaired] = await repairedRows([row], auth.user!.teamId);
      return Response.json({ match: parsed(repaired) });
    }
    const rows = await getDb().select().from(matches).where(eq(matches.teamId,auth.user!.teamId)).orderBy(asc(matches.matchDate), asc(matches.matchTime));
    const repaired = await repairedRows(rows, auth.user!.teamId);
    return Response.json({ matches: repaired.map(parsed) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load matches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input = await request.json() as MatchInput;
    if (!valid(input)) return Response.json({ error: "Create a season before creating a match" }, { status: 400 });
    const db=getDb();
    const [season]=await db.select({id:seasons.id}).from(seasons).where(and(eq(seasons.id,input.seasonId!),eq(seasons.teamId,auth.user!.teamId),eq(seasons.status,"Active")));
    if(!season)return Response.json({error:"Select an active season before creating a match"},{status:400});
    const [match] = await db.insert(matches).values({...values(input),teamId:auth.user!.teamId}).returning();
    return Response.json({ match: parsed(match) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create match" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input = await request.json() as MatchInput;
    if (!input.id || !valid(input)) return Response.json({ error: "Valid match is required" }, { status: 400 });
    const [match] = await getDb().update(matches).set(values(input)).where(and(eq(matches.id, input.id),eq(matches.teamId,auth.user!.teamId))).returning();
    return Response.json({ match: parsed(match) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update match" }, { status: 500 });
  }
}
