import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { venues } from "../../../db/schema";
import { requireUser } from "../auth/security";

export async function GET(request:Request){
  try{const auth=await requireUser(request);if(auth.response)return auth.response;const rows=await getDb().select().from(venues).where(eq(venues.teamId,auth.user!.teamId)).orderBy(asc(venues.name));return Response.json({venues:rows})}
  catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load locations"},{status:500})}
}

export async function POST(request:Request){
  try{const auth=await requireUser(request);if(auth.response)return auth.response;const input=await request.json() as {name?:string};const name=input.name?.trim();if(!name)return Response.json({error:"Location name is required"},{status:400});const [existing]=await getDb().select().from(venues).where(and(eq(venues.teamId,auth.user!.teamId),eq(venues.name,name)));if(existing)return Response.json({venue:existing});const [venue]=await getDb().insert(venues).values({teamId:auth.user!.teamId,name}).returning();return Response.json({venue},{status:201})}
  catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to save location"},{status:500})}
}

export async function PUT(request:Request){
  try{const auth=await requireUser(request);if(auth.response)return auth.response;const input=await request.json() as {id?:number;status?:"Active"|"Inactive"};if(!input.id||!input.status)return Response.json({error:"Valid location is required"},{status:400});const [venue]=await getDb().update(venues).set({status:input.status}).where(and(eq(venues.id,input.id),eq(venues.teamId,auth.user!.teamId))).returning();if(!venue)return Response.json({error:"Location not found"},{status:404});return Response.json({venue})}
  catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to update location"},{status:500})}
}
