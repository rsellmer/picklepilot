import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { leagueAdminProfiles, leagueLevels, leagueSeasons } from "../../../../db/schema";
import { ensureInterclubAuthSchema } from "../../auth/interclub-schema";
import { requireUser } from "../../auth/security";

async function leagueContext(request:Request){
  const auth=await requireUser(request);if(auth.response)return {response:auth.response,organizationId:0};
  if(auth.user!.role!=="LeagueAdmin")return {response:Response.json({error:"League administrator access required"},{status:403}),organizationId:0};
  await ensureInterclubAuthSchema();
  const [profile]=await getDb().select({organizationId:leagueAdminProfiles.organizationId}).from(leagueAdminProfiles).where(eq(leagueAdminProfiles.userId,auth.user!.id));
  return profile?{response:null,organizationId:profile.organizationId}:{response:Response.json({error:"Administrator organization not found"},{status:404}),organizationId:0};
}

export async function GET(request:Request){
  try{
    const context=await leagueContext(request);if(context.response)return context.response;
    const db=getDb();
    const seasons=await db.select().from(leagueSeasons).where(eq(leagueSeasons.organizationId,context.organizationId)).orderBy(asc(leagueSeasons.createdAt));
    const levels=await db.select().from(leagueLevels).where(eq(leagueLevels.organizationId,context.organizationId)).orderBy(asc(leagueLevels.displayOrder));
    return Response.json({seasons,levels});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load league setup"},{status:500})}
}

export async function POST(request:Request){
  try{
    const context=await leagueContext(request);if(context.response)return context.response;
    const input=await request.json() as {name?:string;levels?:string[]};
    const name=input.name?.trim(),levels=[...new Set((input.levels??[]).map(level=>level.trim()).filter(Boolean))];
    if(!name||levels.length===0)return Response.json({error:"Season name and at least one level are required"},{status:400});
    const db=getDb();
    const [existing]=await db.select({id:leagueSeasons.id}).from(leagueSeasons).where(and(eq(leagueSeasons.organizationId,context.organizationId),eq(leagueSeasons.name,name)));
    if(existing)return Response.json({error:"A season with this name already exists"},{status:409});
    await db.update(leagueSeasons).set({status:"Closed",closedAt:new Date().toISOString()}).where(and(eq(leagueSeasons.organizationId,context.organizationId),eq(leagueSeasons.status,"Active")));
    const [season]=await db.insert(leagueSeasons).values({organizationId:context.organizationId,name,status:"Active"}).returning();
    const createdLevels=[];
    for(let index=0;index<levels.length;index++){
      const [level]=await db.insert(leagueLevels).values({organizationId:context.organizationId,seasonId:season.id,name:levels[index],displayOrder:index,status:"Active"}).returning();createdLevels.push(level);
    }
    return Response.json({season,levels:createdLevels},{status:201});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to create season"},{status:500})}
}

export async function PUT(request:Request){
  try{
    const context=await leagueContext(request);if(context.response)return context.response;
    const input=await request.json() as {seasonId?:number;levels?:{id:number;name:string}[]};
    const names=(input.levels??[]).map(level=>level.name.trim());
    if(!input.seasonId||!input.levels?.length||names.some(name=>!name))return Response.json({error:"All divisions need a name"},{status:400});
    if(new Set(names.map(name=>name.toLowerCase())).size!==names.length)return Response.json({error:"Division names must be different"},{status:409});
    const db=getDb();
    const [season]=await db.select().from(leagueSeasons).where(and(eq(leagueSeasons.id,input.seasonId),eq(leagueSeasons.organizationId,context.organizationId)));
    if(!season)return Response.json({error:"Season not found"},{status:404});
    const current=await db.select().from(leagueLevels).where(and(eq(leagueLevels.seasonId,season.id),eq(leagueLevels.organizationId,context.organizationId)));
    for(const [index,item] of input.levels.entries()){
      if(!current.some(level=>level.id===item.id))return Response.json({error:"Invalid division"},{status:400});
      await db.update(leagueLevels).set({name:names[index],displayOrder:index}).where(and(eq(leagueLevels.id,item.id),eq(leagueLevels.seasonId,season.id)));
    }
    return Response.json({ok:true});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to update divisions"},{status:500})}
}
