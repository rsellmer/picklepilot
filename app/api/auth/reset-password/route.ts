import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appSessions, appUsers, passwordResetTokens } from "../../../../db/schema";
import { hashPassword, hashToken, randomHex } from "../security";

export async function POST(request:Request){
  try{
    const input=await request.json() as {token?:string;password?:string};const token=input.token??"",password=input.password??"";
    if(!token||password.length<8)return Response.json({error:"Choose a password with at least 8 characters."},{status:400});
    const db=getDb(),tokenHash=await hashToken(token),[record]=await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash,tokenHash),gt(passwordResetTokens.expiresAt,new Date().toISOString()))).limit(1);
    if(!record)return Response.json({error:"This reset link is invalid or has expired. Request a new one."},{status:400});
    const salt=randomHex(16),passwordHash=await hashPassword(password,salt);
    await db.update(appUsers).set({passwordSalt:salt,passwordHash}).where(eq(appUsers.id,record.userId));
    await db.delete(appSessions).where(eq(appSessions.userId,record.userId));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId,record.userId));
    return Response.json({ok:true});
  }catch(error){console.error("[auth/reset-password] failed",error);return Response.json({error:"The password could not be reset. Please try again."},{status:500})}
}
