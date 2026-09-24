import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appUsers, captainProfiles, leagueAdminProfiles, leagueLevels, leagueSeasons, leagueTeams, teamSettings } from "../../../../db/schema";
import { ensureInterclubAuthSchema } from "../../auth/interclub-schema";
import { hashPassword, randomHex, requireUser } from "../../auth/security";

const divisions=[
  {name:"Performance",teams:[
    ["Bleus","Roussillon"],["Forts de Chambly","Chambly"],["Nasty Shelton","Varennes"],["Pickle Beast","Châteauguay"],["Prédateurs","Ste-Julie"],["Spartans","Roussillon"],["Stakalatak","APHR St-Jean"],
  ]},
  {name:"Développement",teams:[
    ["Blockshot","APHR St-Jean"],["Boucher D","Boucherville"],["Brigadiers","Châteauguay"],["Éléments","St-Bruno"],["Julie Next Gen","Ste-Julie"],["Montagnards","CPVR"],["Prozacs","Roussillon"],["Runiques","APHR St-Jean"],["Smashkoutains","St-Hyacinthe"],["Survenants D","Sorel-Tracy"],["Zacolytes","Varennes"],["Zactifs","Roussillon"],
  ]},
  {name:"Sénior",teams:[
    ["Boucher S","Boucherville"],["Loups du Filet","Roussillon"],["Phenix 50+","Ste-Julie"],["PKLBroue","Chambly"],["Survenants S","Sorel-Tracy"],
  ]},
] as const;

const slug=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export async function POST(request:Request){
  try{
    const auth=await requireUser(request);if(auth.response)return auth.response;
    if(auth.user!.role!=="LeagueAdmin")return Response.json({error:"League administrator access required"},{status:403});
    await ensureInterclubAuthSchema();
    const db=getDb(),[profile]=await db.select().from(leagueAdminProfiles).where(eq(leagueAdminProfiles.userId,auth.user!.id));
    if(!profile)return Response.json({error:"Administrator organization not found"},{status:404});
    const [season]=await db.select().from(leagueSeasons).where(and(eq(leagueSeasons.organizationId,profile.organizationId),eq(leagueSeasons.status,"Active")));
    if(!season||!season.name.toLowerCase().includes("2026")||!/(automne|outono|fall)/i.test(season.name))return Response.json({error:"Automne 2026 must be the active season"},{status:400});

    const existingLevels=await db.select().from(leagueLevels).where(and(eq(leagueLevels.organizationId,profile.organizationId),eq(leagueLevels.seasonId,season.id))).orderBy(asc(leagueLevels.displayOrder));
    const levelRows=[];
    for(let index=0;index<divisions.length;index++){
      const current=existingLevels[index];
      if(current){await db.update(leagueLevels).set({name:divisions[index].name,displayOrder:index,status:"Active"}).where(eq(leagueLevels.id,current.id));levelRows.push({...current,name:divisions[index].name,status:"Active" as const})}
      else{const [created]=await db.insert(leagueLevels).values({organizationId:profile.organizationId,seasonId:season.id,name:divisions[index].name,displayOrder:index,status:"Active"}).returning();levelRows.push(created)}
    }
    for(const extra of existingLevels.slice(3))await db.update(leagueLevels).set({status:"Inactive"}).where(eq(leagueLevels.id,extra.id));

    const existingTeams=await db.select().from(leagueTeams).where(and(eq(leagueTeams.organizationId,profile.organizationId),eq(leagueTeams.seasonId,season.id)));
    const existingUsers=await db.select().from(appUsers);let created=0,skipped=0;
    for(let divisionIndex=0;divisionIndex<divisions.length;divisionIndex++)for(const [teamName,city] of divisions[divisionIndex].teams){
      if(existingTeams.some(team=>team.teamName.toLowerCase()===teamName.toLowerCase()&&team.city.toLowerCase()===city.toLowerCase())){skipped++;continue}
      const base=`adm-${slug(teamName)}`;let username=base,suffix=2;while(existingUsers.some(user=>user.username===username)){username=`${base}-${suffix++}`}
      const salt=randomHex(16),passwordHash=await hashPassword("Adm12345",salt);
      const [settings]=await db.insert(teamSettings).values({teamName:`${city} · ${teamName}`,captainName:"Adm",category:divisionIndex===1?"Development":"Performance"}).returning();
      const [user]=await db.insert(appUsers).values({username,passwordHash,passwordSalt:salt,role:"Captain",teamId:settings.id}).returning();existingUsers.push(user);
      const [team]=await db.insert(leagueTeams).values({organizationId:profile.organizationId,seasonId:season.id,levelId:levelRows[divisionIndex].id,city,teamName,captainUserId:user.id}).returning();
      await db.insert(captainProfiles).values({userId:user.id,organizationId:profile.organizationId,leagueTeamId:team.id,displayName:"Adm",email:`${username}@picklepilot.local`,mustChangePassword:true});created++;
    }
    return Response.json({ok:true,created,skipped,total:created+skipped,divisions:divisions.map(item=>item.name)});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to import teams"},{status:500})}
}
