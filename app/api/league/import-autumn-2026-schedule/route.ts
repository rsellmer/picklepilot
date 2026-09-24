import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { leagueAdminProfiles, leagueLevels, leagueMatches, leagueSeasons, leagueTeams, leagueVenues } from "../../../../db/schema";
import { ensureInterclubAuthSchema } from "../../auth/interclub-schema";
import { requireUser } from "../../auth/security";

const source="https://docs.google.com/spreadsheets/d/1wkBl8RU_N9odxZ2YSmCmEjDaCBBqpqgbNt8sEXngGB4/gviz/tq?tqx=out:csv&gid=0";
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/\s+/g," ");
function csvRows(text:string){const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;for(let i=0;i<text.length;i++){const char=text[i];if(char==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(char===","&&!quoted){row.push(cell);cell=""}else if((char==="\n"||char==="\r")&&!quoted){if(char==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(value=>value.trim()))rows.push(row);row=[];cell=""}else cell+=char}if(cell||row.length){row.push(cell);rows.push(row)}return rows}
function startTime(value:string){const first=value.split("-")[0].trim(),match=first.match(/^(\d{1,2})(?:h(\d{1,2}))?$/i);return match?`${match[1].padStart(2,"0")}:${(match[2]??"00").padStart(2,"0")}`:"20:00"}

export async function POST(request:Request){
  try{
    const auth=await requireUser(request);if(auth.response)return auth.response;
    if(auth.user!.role!=="LeagueAdmin")return Response.json({error:"League administrator access required"},{status:403});
    await ensureInterclubAuthSchema();const db=getDb(),[profile]=await db.select().from(leagueAdminProfiles).where(eq(leagueAdminProfiles.userId,auth.user!.id));
    if(!profile)return Response.json({error:"Administrator organization not found"},{status:404});
    const [season]=await db.select().from(leagueSeasons).where(and(eq(leagueSeasons.organizationId,profile.organizationId),eq(leagueSeasons.status,"Active")));
    if(!season||!/(automne|outono|fall)/i.test(season.name)||!season.name.includes("2026"))return Response.json({error:"Automne 2026 must be the active season"},{status:400});
    const [levels,teams,venues,existing,response]=await Promise.all([
      db.select().from(leagueLevels).where(and(eq(leagueLevels.organizationId,profile.organizationId),eq(leagueLevels.seasonId,season.id))),
      db.select().from(leagueTeams).where(and(eq(leagueTeams.organizationId,profile.organizationId),eq(leagueTeams.seasonId,season.id))),
      db.select().from(leagueVenues).where(eq(leagueVenues.organizationId,profile.organizationId)),
      db.select().from(leagueMatches).where(and(eq(leagueMatches.organizationId,profile.organizationId),eq(leagueMatches.seasonId,season.id))),fetch(source),
    ]);
    if(!response.ok)return Response.json({error:"The official schedule could not be read"},{status:502});
    const rows=csvRows(await response.text());let created=0,duplicates=0,provisional=0;const errors:string[]=[];
    for(const columns of rows){const [week,date,day,site,time,terrain,division,matchId,fixture]=columns;if(!/^2026-\d{2}-\d{2}$/.test(date??"")||!matchId)continue;if(!fixture?.includes("|")||!fixture.includes(" vs ")){provisional++;continue}
      const [homeLabel,visitorLabel]=fixture.split(/\s+vs\s+/i),splitTeam=(label:string)=>{const parts=label.split("|").map(item=>item.trim());return {name:parts[0]??"",city:parts.slice(1).join("|")}},home=splitTeam(homeLabel),visitor=splitTeam(visitorLabel);
      const level=levels.find(item=>normalize(item.name)===normalize(division)),venue=venues.find(item=>normalize(item.name)===normalize(site));
      const findTeam=(item:{name:string;city:string})=>teams.find(team=>normalize(team.teamName)===normalize(item.name)&&normalize(team.city)===normalize(item.city));const homeTeam=findTeam(home),visitorTeam=findTeam(visitor);
      if(!level||!venue||!homeTeam||!visitorTeam){errors.push(`${matchId}: ${fixture}`);continue}
      if(existing.some(match=>match.matchDate===date&&match.homeTeamId===homeTeam.id&&match.visitorTeamId===visitorTeam.id)){duplicates++;continue}
      const courts=terrain.replace(/T/gi,"").split(",").map(item=>item.trim()).filter(Boolean);if(courts.length!==3){errors.push(`${matchId}: invalid courts`);continue}
      await db.insert(leagueMatches).values({organizationId:profile.organizationId,seasonId:season.id,levelId:level.id,venueId:venue.id,matchDate:date,matchTime:startTime(time),homeTeamId:homeTeam.id,visitorTeamId:visitorTeam.id,courts:JSON.stringify(courts),status:"Scheduled"});existing.push({id:-created-1,organizationId:profile.organizationId,seasonId:season.id,levelId:level.id,venueId:venue.id,matchDate:date,matchTime:startTime(time),homeTeamId:homeTeam.id,visitorTeamId:visitorTeam.id,courts:JSON.stringify(courts),homeWins:null,visitorWins:null,resultOutcome:null,resultSubmittedAt:null,rescheduleComment:null,status:"Scheduled",createdAt:"",updatedAt:""});created++;
    }
    return Response.json({ok:errors.length===0,created,duplicates,provisional,errors,totalNamed:created+duplicates});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to import schedule"},{status:500})}
}
