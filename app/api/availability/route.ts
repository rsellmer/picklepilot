import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { availabilityPolls, availabilityResponses, matches, players } from "../../../db/schema";
import { requireUser } from "../auth/security";

async function ownedMatch(matchId:number,teamId:number){
  const [match]=await getDb().select().from(matches).where(and(eq(matches.id,matchId),eq(matches.teamId,teamId))).limit(1);
  return match;
}

async function payload(matchId:number,teamId:number){
  const db=getDb();
  const [poll]=await db.select().from(availabilityPolls).where(and(eq(availabilityPolls.matchId,matchId),eq(availabilityPolls.teamId,teamId))).limit(1);
  if(!poll)return {poll:null,responses:[]};
  const responses=await db.select({id:availabilityResponses.id,playerId:availabilityResponses.playerId,playerName:players.name,response:availabilityResponses.response,note:availabilityResponses.note,updatedAt:availabilityResponses.updatedAt})
    .from(availabilityResponses).innerJoin(players,eq(players.id,availabilityResponses.playerId))
    .where(and(eq(availabilityResponses.pollId,poll.id),eq(players.teamId,teamId))).orderBy(asc(players.name));
  return {poll,responses};
}

export async function GET(request:Request){
  try{
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const matchId=Number(new URL(request.url).searchParams.get("matchId"));
    if(!matchId||!await ownedMatch(matchId,auth.user!.teamId))return Response.json({error:"Match not found"},{status:404});
    return Response.json(await payload(matchId,auth.user!.teamId));
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load availability"},{status:500})}
}

export async function POST(request:Request){
  try{
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const {matchId}=await request.json() as {matchId?:number};
    if(!matchId||!await ownedMatch(matchId,auth.user!.teamId))return Response.json({error:"Match not found"},{status:404});
    const db=getDb();
    const [existing]=await db.select().from(availabilityPolls).where(and(eq(availabilityPolls.matchId,matchId),eq(availabilityPolls.teamId,auth.user!.teamId))).limit(1);
    if(!existing){
      const token=crypto.randomUUID().replaceAll("-","");
      await db.insert(availabilityPolls).values({matchId,teamId:auth.user!.teamId,token});
    }
    return Response.json(await payload(matchId,auth.user!.teamId),{status:existing?200:201});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to create availability poll"},{status:500})}
}
