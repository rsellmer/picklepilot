import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appUsers, passwordResetTokens } from "../../../../db/schema";
import { hashToken, randomHex, resendApiKey } from "../security";

const sent=()=>Response.json({ok:true,message:"If an account exists for this email, a reset link has been sent."});

export async function POST(request:Request){
  try{
    const input=await request.json() as {username?:string};const username=input.username?.trim().toLowerCase();
    if(!username?.includes("@"))return sent();
    const apiKey=resendApiKey();if(!apiKey)return Response.json({error:"Password recovery is not configured yet. Please contact PicklePilot support."},{status:503});
    const [user]=await getDb().select({id:appUsers.id,username:appUsers.username}).from(appUsers).where(eq(appUsers.username,username)).limit(1);
    if(!user)return sent();
    const db=getDb(),token=randomHex(32),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*60*1000).toISOString();
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId,user.id));
    await db.insert(passwordResetTokens).values({userId:user.id,tokenHash,expiresAt});
    const resetUrl=`${new URL(request.url).origin}/?reset=${encodeURIComponent(token)}`;
    const mail=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:"PicklePilot <noreply@picklepilot.ca>",to:[user.username],subject:"Réinitialisez votre mot de passe PicklePilot / Reset your PicklePilot password",html:`<p>Bonjour / Hello,</p><p>Utilisez le lien sécurisé ci-dessous pour choisir un nouveau mot de passe PicklePilot. Il expire dans 30 minutes.</p><p>Use the secure link below to choose a new PicklePilot password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe / Reset my password</a></p><p>Si vous n’avez pas demandé ceci, vous pouvez ignorer ce courriel.<br>If you did not request this, you can ignore this email.</p>`})});
    if(!mail.ok){await db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash,tokenHash));console.error("[auth/forgot-password] Resend failed",await mail.text());return Response.json({error:"The recovery email could not be sent. Please try again shortly."},{status:502});}
    return sent();
  }catch(error){console.error("[auth/forgot-password] failed",error);return Response.json({error:"The recovery email could not be sent. Please try again shortly."},{status:500})}
}
