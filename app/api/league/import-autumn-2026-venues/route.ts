import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { leagueAdminProfiles, leagueVenues } from "../../../../db/schema";
import { ensureInterclubAuthSchema } from "../../auth/interclub-schema";
import { requireUser } from "../../auth/security";

const venues=[
  {name:"Esprit Sportif",address:"https://maps.app.goo.gl/94Sg4PP8QmND2U3t6",courts:["2","4","6","7","8","9","10","11","12"]},
  {name:"ZAC",address:"https://maps.app.goo.gl/JdzMBycPLkzXwjGJ7",courts:["3","4","5","6","7","8"]},
  {name:"Quartier Général",address:"https://maps.app.goo.gl/DxppRkMfLE1ECVB88",courts:["1","2","3","4","5","6"]},
  {name:"Sani Sport",address:"https://maps.app.goo.gl/gHjB7MHx344EWsut8",courts:["1","2","3","4","5","6","7","8","9"]},
  {name:"St-Jean Pickleball",address:"https://maps.app.goo.gl/nwB2HahaEuChcBBZA",courts:["3","4","5"]},
];

export async function POST(request:Request){
  try{
    const auth=await requireUser(request);if(auth.response)return auth.response;
    if(auth.user!.role!=="LeagueAdmin")return Response.json({error:"League administrator access required"},{status:403});
    await ensureInterclubAuthSchema();
    const db=getDb(),[profile]=await db.select().from(leagueAdminProfiles).where(eq(leagueAdminProfiles.userId,auth.user!.id));
    if(!profile)return Response.json({error:"Administrator organization not found"},{status:404});
    const existing=await db.select().from(leagueVenues).where(eq(leagueVenues.organizationId,profile.organizationId));let created=0,updated=0;
    for(const venue of venues){
      const current=existing.find(item=>item.name.trim().toLowerCase()===venue.name.toLowerCase());
      if(current){await db.update(leagueVenues).set({address:venue.address,venueType:"Indoor",courts:JSON.stringify(venue.courts),status:"Active"}).where(eq(leagueVenues.id,current.id));updated++}
      else{await db.insert(leagueVenues).values({organizationId:profile.organizationId,name:venue.name,address:venue.address,venueType:"Indoor",courts:JSON.stringify(venue.courts),status:"Active"});created++}
    }
    return Response.json({ok:true,created,updated,total:venues.length});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to import locations"},{status:500})}
}
