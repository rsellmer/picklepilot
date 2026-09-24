import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { leagueLevels, leagueMatches, leagueSeasons, leagueTeams, leagueVenues, organizations } from "../../../../db/schema";

const parseCourts=(value:string)=>{try{return JSON.parse(value) as string[]}catch{return [] as string[]}};

export async function GET(){
  const db=getDb();
  const [organization]=await db.select().from(organizations).limit(1);
  if(!organization)return Response.json({organization:null,seasons:[],levels:[],teams:[],venues:[],matches:[],standings:[]});
  const [seasons,levels,teams,venues,matches]=await Promise.all([
    db.select().from(leagueSeasons).where(eq(leagueSeasons.organizationId,organization.id)),
    db.select().from(leagueLevels).where(eq(leagueLevels.organizationId,organization.id)),
    db.select().from(leagueTeams).where(eq(leagueTeams.organizationId,organization.id)),
    db.select().from(leagueVenues).where(eq(leagueVenues.organizationId,organization.id)),
    db.select().from(leagueMatches).where(eq(leagueMatches.organizationId,organization.id)),
  ]);
  const standings=levels.map(level=>({levelId:level.id,seasonId:level.seasonId,rows:teams.filter(team=>team.levelId===level.id).map(team=>{let played=0,wins16=0,wins15=0,losses8=0,losses7=0,ties=0,forGames=0,against=0,points=0;for(const match of matches.filter(item=>item.levelId===level.id&&item.status==="Completed"&&(item.homeTeamId===team.id||item.visitorTeamId===team.id))){const own=match.homeTeamId===team.id?match.homeWins:match.visitorWins,other=match.homeTeamId===team.id?match.visitorWins:match.homeWins;if(own==null||other==null)continue;played++;forGames+=own;against+=other;if(own===other){ties++;points++}else if(own>other){if(own>=16){wins16++;points+=3}else{wins15++;points+=2}}else if(own>=8){losses8++;points++}else losses7++}return{teamId:team.id,played,wins16,wins15,losses8,losses7,ties,forGames,against,difference:forGames-against,points}}).sort((a,b)=>b.points-a.points||b.difference-a.difference||b.forGames-a.forGames)}));
  return Response.json({organization:{name:organization.name},seasons,levels,teams,venues:venues.map(venue=>({...venue,courts:parseCourts(venue.courts)})),matches:matches.map(match=>({...match,courts:parseCourts(match.courts)})),standings});
}
