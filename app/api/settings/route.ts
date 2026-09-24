import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { teamSettings } from "../../../db/schema";
import { requireUser } from "../auth/security";

export async function GET(request:Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const [settings]=await getDb().select().from(teamSettings).where(eq(teamSettings.id,auth.user!.teamId));
    return Response.json({settings:settings??{id:auth.user!.teamId,teamName:"My team",captainName:"Captain",category:"Performance"}});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load settings"},{status:500})}
}
export async function PUT(request:Request) {
  try {
    const auth=await requireUser(request);if(auth.response)return auth.response;
    const input=await request.json() as {teamName?:string;captainName?:string;category?:"Performance"|"Development"}; const teamName=input.teamName?.trim(),captainName=input.captainName?.trim(),category=input.category;
    if(!teamName||!captainName||!category)return Response.json({error:"Team, captain and category are required"},{status:400});
    await getDb().insert(teamSettings).values({id:auth.user!.teamId,teamName,captainName,category}).onConflictDoUpdate({target:teamSettings.id,set:{teamName,captainName,category,updatedAt:new Date().toISOString()}});
    return Response.json({settings:{id:auth.user!.teamId,teamName,captainName,category}});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to save settings"},{status:500})}
}
