import { getDb } from "../../../../db";
import { appUsers } from "../../../../db/schema";
import { currentUser } from "../security";
import { ensureInterclubAuthSchema } from "../interclub-schema";
export async function GET(request:Request){await ensureInterclubAuthSchema();const rows=await getDb().select({id:appUsers.id}).from(appUsers).limit(1);return Response.json({setupRequired:rows.length===0,user:await currentUser(request)})}
