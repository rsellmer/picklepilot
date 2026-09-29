import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { teamSettings } from "../../../db/schema";
import { requireUser } from "../auth/security";

export async function GET(request:Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const [settings]=await getDb().select().from(teamSettings).where(eq(teamSettings.id,auth.user!.teamId));
    return Response.json({settings:settings??{id:auth.user!.teamId,teamName:"My team",captainName:"Captain",category:"Performance",blockWomenPairs:true,publicSlug:"team"}});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load settings"},{status:500})}
}
export async function PUT(request:Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input=await request.json() as {teamName?:string;captainName?:string;category?:"Performance"|"Development";blockWomenPairs?:boolean}; const teamName=input.teamName?.trim(),captainName=input.captainName?.trim(),category=input.category,blockWomenPairs=input.blockWomenPairs;
    if(!teamName||!captainName||!category)return Response.json({error:"Team, captain and category are required"},{status:400});
    const db=getDb();
    const [current]=await db.select({publicSlug:teamSettings.publicSlug,blockWomenPairs:teamSettings.blockWomenPairs}).from(teamSettings).where(eq(teamSettings.id,auth.user!.teamId));
    const publicSlug=current?.publicSlug??`team-${auth.user!.teamId}`;
    await db.insert(teamSettings).values({id:auth.user!.teamId,teamName,captainName,category,blockWomenPairs:blockWomenPairs??true,publicSlug}).onConflictDoUpdate({target:teamSettings.id,set:{teamName,captainName,category,...(blockWomenPairs===undefined?{}:{blockWomenPairs}),updatedAt:new Date().toISOString()}});
    const [settings]=await db.select({publicSlug:teamSettings.publicSlug}).from(teamSettings).where(eq(teamSettings.id,auth.user!.teamId));
    return Response.json({settings:{id:auth.user!.teamId,teamName,captainName,category,blockWomenPairs:settings?.blockWomenPairs??true,publicSlug:settings?.publicSlug??"team"}});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to save settings"},{status:500})}
}
