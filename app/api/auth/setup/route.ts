import { getDb } from "../../../../db";
import { appSessions, appUsers, teamSettings } from "../../../../db/schema";
import { hashPassword, hashToken, randomHex, sessionCookie } from "../security";

export async function POST(request:Request){
  try{
    const input=await request.json() as {username?:string;password?:string;teamName?:string;captainName?:string};
    const username=input.username?.trim().toLowerCase(),password=input.password??"",teamName=input.teamName?.trim()||"My team",captainName=input.captainName?.trim()||"Captain";
    if(!username||password.length<8)return Response.json({error:"Use an email and a password with at least 8 characters"},{status:400});
    const db=getDb();const existing=await db.select({id:appUsers.id}).from(appUsers).limit(1);
    if(existing.length)return Response.json({error:"Setup already completed"},{status:409});
    const salt=randomHex(16),passwordHash=await hashPassword(password,salt);
    const [team]=await db.insert(teamSettings).values({id:1,teamName,captainName}).onConflictDoUpdate({target:teamSettings.id,set:{teamName,captainName,updatedAt:new Date().toISOString()}}).returning();
    const [user]=await db.insert(appUsers).values({username,passwordHash,passwordSalt:salt,role:"Admin",teamId:team.id}).returning();
    const token=randomHex(),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*86400000).toISOString();
    await db.insert(appSessions).values({userId:user.id,tokenHash,expiresAt});
    return Response.json({user:{id:user.id,username:user.username,role:user.role,teamId:user.teamId}},{headers:{"Set-Cookie":sessionCookie(token)}});
  }catch(error){console.error("[auth/setup] failed",error);return Response.json({error:"The account could not be created. Please try again."},{status:500})}
}
