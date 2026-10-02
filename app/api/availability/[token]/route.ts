import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { availabilityPolls, availabilityResponses, matches, players, teamSettings } from "../../../../db/schema";

async function pollData(token:string){
  const db=getDb();
  const [record]=await db.select({pollId:availabilityPolls.id,pollStatus:availabilityPolls.status,teamId:availabilityPolls.teamId,teamName:teamSettings.teamName,matchId:matches.id,opponent:matches.opponent,matchDate:matches.matchDate,matchTime:matches.matchTime,location:matches.location})
    .from(availabilityPolls).innerJoin(matches,eq(matches.id,availabilityPolls.matchId)).innerJoin(teamSettings,eq(teamSettings.id,availabilityPolls.teamId))
    .where(eq(availabilityPolls.token,token)).limit(1);
  if(!record)return null;
  const roster=await db.select({id:players.id,name:players.name}).from(players).where(and(eq(players.teamId,record.teamId),eq(players.status,"Active"))).orderBy(asc(players.name));
  const responses=await db.select({playerId:availabilityResponses.playerId,response:availabilityResponses.response,note:availabilityResponses.note}).from(availabilityResponses).where(eq(availabilityResponses.pollId,record.pollId));
  return {...record,players:roster,responses};
}

export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
  const {token}=await params;const data=await pollData(token);
  return data?Response.json(data):Response.json({error:"Availability poll not found"},{status:404});
}

export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){
  try{
    const {token}=await params;const data=await pollData(token);
    if(!data)return Response.json({error:"Availability poll not found"},{status:404});
    if(data.pollStatus!=="Open")return Response.json({error:"This availability poll is closed"},{status:400});
    const input=await request.json() as {playerId?:number;response?:"Available"|"Unavailable"|"Maybe";note?:string};
    if(!input.playerId||!["Available","Unavailable","Maybe"].includes(input.response??"")||!data.players.some(player=>player.id===input.playerId))return Response.json({error:"Select a valid player and response"},{status:400});
    await getDb().insert(availabilityResponses).values({pollId:data.pollId,playerId:input.playerId,response:input.response!,note:input.note?.trim().slice(0,180)??"",updatedAt:new Date().toISOString()})
      .onConflictDoUpdate({target:[availabilityResponses.pollId,availabilityResponses.playerId],set:{response:input.response!,note:input.note?.trim().slice(0,180)??"",updatedAt:new Date().toISOString()}});
    return Response.json({ok:true});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to save response"},{status:500})}
}
