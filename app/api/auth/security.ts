import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { appSessions, appUsers } from "../../../db/schema";

const encoder=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes).map(value=>value.toString(16).padStart(2,"0")).join("");
export const randomHex=(length=32)=>{const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return hex(bytes)};
export async function hashPassword(password:string,salt:string){const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:encoder.encode(salt),iterations:100000,hash:"SHA-256"},key,256);return hex(new Uint8Array(bits))}
export async function hashToken(token:string){const digest=await crypto.subtle.digest("SHA-256",encoder.encode(token));return hex(new Uint8Array(digest))}
export function sessionToken(request:Request){return request.headers.get("cookie")?.match(/(?:^|; )picklepilot_session=([^;]+)/)?.[1]??null}
export async function currentUser(request:Request){const token=sessionToken(request);if(!token)return null;const tokenHash=await hashToken(token);const [row]=await getDb().select({id:appUsers.id,username:appUsers.username,role:appUsers.role,teamId:appUsers.teamId}).from(appSessions).innerJoin(appUsers,eq(appSessions.userId,appUsers.id)).where(and(eq(appSessions.tokenHash,tokenHash),gt(appSessions.expiresAt,new Date().toISOString())));return row??null}
export async function requireUser(request:Request){const user=await currentUser(request);return user?{user,response:null}:{user:null,response:Response.json({error:"Unauthorized"},{status:401})}}
export function sessionCookie(token:string){return `picklepilot_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*30}`}
