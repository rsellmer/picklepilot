import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { matches, players } from "../../../db/schema";
import { requireUser } from "../auth/security";

type PlayerInput = { name?: string; gender?: "W" | "M"; status?: "Active" | "Inactive" };

function valid(input: PlayerInput) {
  return Boolean(input.name?.trim() && (input.gender === "W" || input.gender === "M"));
}

export async function GET(request:Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const rows = await getDb().select().from(players).where(eq(players.teamId,auth.user!.teamId)).orderBy(asc(players.id));
    return Response.json({ players: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load players" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input = await request.json() as PlayerInput;
    if (!valid(input)) return Response.json({ error: "Name and division are required" }, { status: 400 });
    const [player] = await getDb().insert(players).values({
      name: input.name!.trim(),
      gender: input.gender!,
      status: input.status ?? "Active",
      teamId:auth.user!.teamId,
    }).returning();
    return Response.json({ player }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to add player" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input = await request.json() as PlayerInput & { id?: number };
    if (!input.id || !valid(input)) return Response.json({ error: "Player, name and division are required" }, { status: 400 });
    const db=getDb();
    const [current]=await db.select().from(players).where(and(eq(players.id,input.id),eq(players.teamId,auth.user!.teamId)));
    if(!current)return Response.json({error:"Player not found"},{status:404});
    const renamedMatchIds:number[]=[];
    if(current.name!==input.name!.trim()){
      const teamMatches=await db.select().from(matches).where(eq(matches.teamId,auth.user!.teamId));
      for(const match of teamMatches){
        if(!match.lineup)continue;
        const rounds=JSON.parse(match.lineup) as Array<{courts:string[][];rest:string[]}>;
        const next=rounds.map(round=>({...round,courts:round.courts.map(pair=>pair.map(name=>name===current.name?input.name!.trim():name)),rest:round.rest.map(name=>name===current.name?input.name!.trim():name)}));
        if(JSON.stringify(next)===JSON.stringify(rounds))continue;
        await db.update(matches).set({lineup:JSON.stringify(next)}).where(and(eq(matches.id,match.id),eq(matches.teamId,auth.user!.teamId)));
        renamedMatchIds.push(match.id);
      }
    }
    const [player] = await db.update(players).set({
      name: input.name!.trim(),
      gender: input.gender!,
      status: input.status ?? "Active",
      updatedAt: new Date().toISOString(),
    }).where(and(eq(players.id, input.id),eq(players.teamId,auth.user!.teamId))).returning();
    return Response.json({ player,previousName:current.name,renamedMatchIds });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update player" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Player is required" }, { status: 400 });
    await getDb().delete(players).where(and(eq(players.id, id),eq(players.teamId,auth.user!.teamId)));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to remove player" }, { status: 500 });
  }
}
