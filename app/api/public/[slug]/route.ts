import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../../db";
import { matches, teamSettings } from "../../../../db/schema";

const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const db=getDb();
  const [team]=await db.select({id:teamSettings.id,teamName:teamSettings.teamName,publicSlug:teamSettings.publicSlug}).from(teamSettings).where(eq(teamSettings.publicSlug,slug)).limit(1);
  if(!team)return Response.json({error:"Calendar not found"},{status:404});
  const upcoming=await db.select({id:matches.id,opponent:matches.opponent,matchDate:matches.matchDate,matchTime:matches.matchTime,location:matches.location,homeAway:matches.homeAway,court1:matches.court1,court2:matches.court2,court3:matches.court3}).from(matches).where(and(eq(matches.teamId,team.id),eq(matches.status,"Upcoming"),gte(matches.matchDate,today()))).orderBy(asc(matches.matchDate),asc(matches.matchTime));
  return Response.json({team,matches:upcoming});
}
