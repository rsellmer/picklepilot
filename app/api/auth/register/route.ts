import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appSessions, appUsers, leagueAdminProfiles, organizations } from "../../../../db/schema";
import { hashPassword, hashToken, randomHex, sessionCookie } from "../security";
import { ensureInterclubAuthSchema } from "../interclub-schema";

export async function POST(request:Request){
  try{
    const input=await request.json() as {username?:string;password?:string;organizationName?:string;displayName?:string;email?:string;phone?:string;preferredLanguage?:string};
    const username=input.username?.trim().toLowerCase(),password=input.password??"",organizationName=input.organizationName?.trim(),displayName=input.displayName?.trim(),email=input.email?.trim().toLowerCase(),phone=input.phone?.trim()||null;
    if(!username||username.length<3||!organizationName||!displayName||!email?.includes("@")||password.length<8)return Response.json({error:"Enter the organization, your name, email, username and a password with at least 8 characters"},{status:400});
    await ensureInterclubAuthSchema();
    const db=getDb();const [existing]=await db.select({id:appUsers.id}).from(appUsers).where(eq(appUsers.username,username));
    if(existing)return Response.json({error:"This username is already in use"},{status:409});
    const [existingEmail]=await db.select({userId:leagueAdminProfiles.userId}).from(leagueAdminProfiles).where(eq(leagueAdminProfiles.email,email));
    if(existingEmail)return Response.json({error:"An administrator account already exists for this email"},{status:409});
    const salt=randomHex(16),passwordHash=await hashPassword(password,salt);
    const [organization]=await db.insert(organizations).values({name:organizationName}).returning();
    const preferredLanguage=input.preferredLanguage==="en"?"en":"fr";
    const [user]=await db.insert(appUsers).values({username,passwordHash,passwordSalt:salt,role:"LeagueAdmin",teamId:0,preferredLanguage}).returning();
    await db.insert(leagueAdminProfiles).values({userId:user.id,organizationId:organization.id,displayName,email,phone});
    const token=randomHex(),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*86400000).toISOString();
    await db.insert(appSessions).values({userId:user.id,tokenHash,expiresAt});
    return Response.json({user:{id:user.id,username:user.username,role:user.role,teamId:user.teamId,preferredLanguage:user.preferredLanguage}},{headers:{"Set-Cookie":sessionCookie(token)}});
  }catch(error){console.error("[auth/register] failed",error);return Response.json({error:"The account could not be created. Please try again."},{status:500})}
}
