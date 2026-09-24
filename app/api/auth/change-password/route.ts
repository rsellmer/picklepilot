import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appUsers, captainProfiles } from "../../../../db/schema";
import { hashPassword, randomHex, requireUser } from "../security";
export async function POST(request:Request){const auth=await requireUser(request);if(auth.response)return auth.response;const {password}=await request.json() as {password?:string};if(!password||password.length<8)return Response.json({error:"Use at least 8 characters"},{status:400});const salt=randomHex(16),passwordHash=await hashPassword(password,salt);await getDb().update(appUsers).set({passwordSalt:salt,passwordHash}).where(eq(appUsers.id,auth.user!.id));await getDb().update(captainProfiles).set({mustChangePassword:false}).where(eq(captainProfiles.userId,auth.user!.id));return Response.json({ok:true})}
