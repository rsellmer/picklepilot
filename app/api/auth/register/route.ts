import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appSessions, appUsers, teamSettings } from "../../../../db/schema";
import { hashPassword, hashToken, randomHex, sessionCookie } from "../security";

export async function POST(request:Request){
  try{
    const input=await request.json() as {username?:string;password?:string;teamName?:string;captainName?:string};
    const username=input.username?.trim().toLowerCase(),password=input.password??"",teamName=input.teamName?.trim(),captainName=input.captainName?.trim();
    if(!username?.includes("@")||password.length<8||!teamName||!captainName)return Response.json({error:"Enter your name, email, team name and a password with at least 8 characters"},{status:400});
    const db=getDb();const [existing]=await db.select({id:appUsers.id}).from(appUsers).where(eq(appUsers.username,username));
    if(existing)return Response.json({error:"An account already exists for this email"},{status:409});
    const salt=randomHex(16),passwordHash=await hashPassword(password,salt);
    const [team]=await db.insert(teamSettings).values({teamName,captainName}).returning();
    const [user]=await db.insert(appUsers).values({username,passwordHash,passwordSalt:salt,role:"Admin",teamId:team.id}).returning();
    const token=randomHex(),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*86400000).toISOString();
    await db.insert(appSessions).values({userId:user.id,tokenHash,expiresAt});
    return Response.json({user:{id:user.id,username:user.username,role:user.role,teamId:user.teamId}},{headers:{"Set-Cookie":sessionCookie(token)}});
  }catch(error){console.error("[auth/register] failed",error);return Response.json({error:"The account could not be created. Please try again."},{status:500})}
}
