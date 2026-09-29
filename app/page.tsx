"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { LanguageSelector, Locale, localeCode, translateValue, useDomLocalization } from "./i18n";
const brandLogo="data:image/png;base64,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";

type Gender = "W" | "M";
type Player = { id: number; name: string; gender: Gender; status: "Active" | "Inactive" };
type Round = { round: number; courts: string[][]; rest: string[] };
type Match = { id: number; opponent: string; matchDate: string; matchTime: string; location: string; opponentStrength: "Weaker" | "Equal" | "Stronger"; homeAway:"Local"|"Visitor"; court1:string; court2:string; court3:string; warmupMinutes:number; roundMinutes:number; breakMinutes:number; playerIds: number[]; lineup?: Round[] | null; results?: Record<string,"W"|"L">; status: "Upcoming" | "Completed"; seasonId:number };
type Season = {id:number;teamId:number;name:string;status:"Active"|"Closed";createdAt:string;closedAt?:string|null};
type Venue = {id:number;teamId:number;name:string;status:"Active"|"Inactive";createdAt:string};
type Opponent = {id:number;teamId:number;city:string;teamName:string;defaultStrength:"Weaker"|"Equal"|"Stronger";status:"Active"|"Inactive";createdAt:string};
type Page = "dashboard" | "builder" | "players" | "matches" | "results" | "reports" | "rules" | "seasons" | "venues" | "opponents" | "print";
type ReportSort = "played" | "wins" | "losses" | "rate" | "score";
type RuleSettings = { blockWomenPairs:boolean; avoidConsecutivePartners:boolean; preferMaxTwo:boolean; blockAboveThree:boolean; avoidBackToBackRest:boolean; avoidLongStreaks:boolean };
type PlayerRule = { id:number; playerAId:number; playerBId:number; ruleType:"Avoid"|"Required"; minimumGames:number };
type AppUser = { id:number; username:string; role:"Admin"|"User"; teamId:number };
type ScanCell = { value:"W"|"L"|null; confidence:"high"|"medium"|"low" };

const starterPlayers: Player[] = [
  { id: 1, name: "Emma", gender: "W", status: "Active" }, { id: 2, name: "Olivia", gender: "W", status: "Active" },
  { id: 3, name: "Mia", gender: "W", status: "Active" }, { id: 4, name: "Sophie", gender: "W", status: "Active" },
  { id: 5, name: "Noah", gender: "M", status: "Active" }, { id: 6, name: "Liam", gender: "M", status: "Active" },
  { id: 7, name: "Ethan", gender: "M", status: "Active" }, { id: 8, name: "Lucas", gender: "M", status: "Active" },
];
const template = [
  [[1,2],[3,5],[6,7],[0,4]], [[3,6],[0,2],[4,7],[1,5]], [[0,1],[5,7],[3,4],[2,6]], [[0,2],[1,4],[5,6],[3,7]],
  [[3,6],[1,2],[4,7],[0,5]], [[0,3],[2,4],[5,7],[1,6]], [[0,1],[5,6],[3,4],[2,7]], [[0,5],[1,6],[2,7],[3,4]],
];
const mixedRequired = new Set(["2-1","3-3","5-1","7-3"]);
const fourWomenTemplate = Array.from({length:8},(_,round)=>{
  const women=[0,1,2,3].filter(index=>index!==round%4);
  const men=[0,1,2,3].filter(index=>index!==(round+Math.floor(round/4))%4);
  return [...women.map((woman,index)=>[woman,4+men[(index+Math.floor(round/4))%3]]),[round%4,4+(round+Math.floor(round/4))%4]];
});
function buildLineup(roster:Player[],history:Match[],playerRules:PlayerRule[],rules:RuleSettings):Round[] {
  if(roster.length!==8||!roster.some(player=>player.gender==="W")||!roster.some(player=>player.gender==="M"))return [];
  const fourWomen=roster.filter(player=>player.gender==="W").length===4;
  const schedule=fourWomen?fourWomenTemplate:template;
  const historyStats=new Map<string,{played:number;performance:number}>();
  history.forEach(match=>match.lineup?.forEach(round=>round.courts.forEach((pair,courtIndex)=>{
    const result=match.results?.[`${round.round}-${courtIndex+1}`];if(!result)return;
    const key=[...pair].sort().join("|");const expected=match.opponentStrength==="Stronger"?.35:match.opponentStrength==="Weaker"?.65:.5;
    const stat=historyStats.get(key)??{played:0,performance:0};stat.played++;stat.performance+=(result==="W"?1:0)-expected;historyStats.set(key,stat);
  })));
  const pairScore=(a:string,b:string)=>{const stat=historyStats.get([a,b].sort().join("|"));return stat?Math.max(0,Math.min(100,50+stat.performance/(stat.played+4)*100)):50};
  const scoreOrder=(ordered:Player[])=>{
    let score=0;const counts:Record<string,number>={};let previous=new Set<string>();
    for(let roundIndex=0;roundIndex<schedule.length;roundIndex++){
      const current=new Set<string>();
      for(let courtIndex=0;courtIndex<3;courtIndex++){
        const [left,right]=schedule[roundIndex][courtIndex],a=ordered[left],b=ordered[right];
        if(rules.blockWomenPairs&&a.gender==="W"&&b.gender==="W")return -Infinity;
        if(mixedRequired.has(`${roundIndex+1}-${courtIndex+1}`)&&a.gender===b.gender)return -Infinity;
        const key=[a.name,b.name].sort().join("|");current.add(key);counts[key]=(counts[key]??0)+1;score+=pairScore(a.name,b.name);
        if(rules.avoidConsecutivePartners&&previous.has(key))score-=100;
      }
      previous=current;
    }
    Object.values(counts).forEach(count=>{if(rules.preferMaxTwo&&count>2)score-=(count-2)*70;if(rules.blockAboveThree&&count>3)score-=(count-3)*250});
    playerRules.forEach(rule=>{const a=roster.find(player=>player.id===rule.playerAId)?.name,b=roster.find(player=>player.id===rule.playerBId)?.name;if(!a||!b)return;const count=counts[[a,b].sort().join("|")]??0;if(rule.ruleType==="Avoid")score-=count*350;else if(count<rule.minimumGames)score-=(rule.minimumGames-count)*350});
    return score;
  };
  let best:Player[]=[];let bestScore=-Infinity;
  const used=Array(8).fill(false),ordered:Player[]=[];
  const search=()=>{if(ordered.length===8){const score=scoreOrder(ordered);if(score>bestScore){bestScore=score;best=[...ordered]}return}for(let index=0;index<roster.length;index++){if(used[index]||(fourWomen&&roster[index].gender!==(ordered.length<4?"W":"M")))continue;used[index]=true;ordered.push(roster[index]);search();ordered.pop();used[index]=false}};
  search();if(!best.length)return [];
  return schedule.map((row,index)=>({round:index+1,courts:row.slice(0,3).map(pair=>pair.map(slot=>best[slot].name)),rest:row[3].map(slot=>best[slot].name)}));
}

function Sidebar({ page, go, captainName }: { page: Page; go: (page: Page) => void; captainName:string }) {
  const initials=captainName.split(/\s+/).filter(Boolean).map(part=>part[0]).join("").slice(0,2).toUpperCase()||"C";
  return <aside className="sidebar"><div className="brand"><img src={brandLogo} alt="" className="brand-logo"/><span>PicklePilot</span></div><nav aria-label="Main navigation">
    <button className={`nav-item ${page==="dashboard"?"active":""}`} onClick={() => go("dashboard")}>⌁ <span>Dashboard</span></button>
    <button className={`nav-item ${page==="matches"?"active":""}`} onClick={() => go("matches")}>◇ <span>Matches</span></button>
    <button className={`nav-item ${page==="players"?"active":""}`} onClick={() => go("players")}>♙ <span>Teams & players</span></button>
    <button className={`nav-item ${page==="opponents"?"active":""}`} onClick={() => go("opponents")}>◎ <span>Opponents</span></button>
    <button className={`nav-item ${page==="rules"?"active":""}`} onClick={() => go("rules")}>✓ <span>Rules</span></button>
    <button className={`nav-item ${page==="seasons"?"active":""}`} onClick={() => go("seasons")}>◷ <span>Seasons</span></button>
    <button className={`nav-item ${page==="venues"?"active":""}`} onClick={() => go("venues")}>⌖ <span>Locations</span></button>
    <button className={`nav-item ${page==="reports"?"active":""}`} onClick={() => go("reports")}>↗ <span>Reports</span></button>
  </nav><div className="sidebar-footer"><div className="avatar">{initials}</div><div><strong>{captainName}</strong><small>Team captain</small></div></div></aside>;
}

function MobileNav({page,go}:{page:Page;go:(page:Page)=>void}){
  return <nav className="mobile-nav" aria-label="Mobile navigation"><button className={page==="dashboard"?"active":""} onClick={()=>go("dashboard")}><b>⌁</b><span>Home</span></button><button className={page==="matches"?"active":""} onClick={()=>go("matches")}><b>◇</b><span>Matches</span></button><button className={page==="players"?"active":""} onClick={()=>go("players")}><b>♙</b><span>Players</span></button><button className={page==="reports"?"active":""} onClick={()=>go("reports")}><b>↗</b><span>Reports</span></button><details><summary><b>•••</b><span>More</span></summary><div><button onClick={()=>go("opponents")}>Opponents</button><button onClick={()=>go("rules")}>Rules</button><button onClick={()=>go("seasons")}>Seasons</button><button onClick={()=>go("venues")}>Locations</button></div></details></nav>
}

function matchProgress(match:Match) {
  const resultCount=Object.keys(match.results??{}).length;
  const complete=match.status==="Completed";
  const current=complete?3:match.lineup?.length===8?2:match.playerIds.length===8?1:0;
  const labels=["Players","Lineup","Results"];
  return {resultCount,current,labels,complete,nextLabel:complete?"View results":resultCount>0?`Continue results (${resultCount}/24)`:match.lineup?.length===8?"Enter results":match.playerIds.length===8?"Build lineup":"Select players"};
}

function MatchJourney({match,locale}:{match:Match;locale:Locale}) {
  const flow=matchProgress(match);
  return <div className="match-journey" aria-label={translateValue("Match preparation progress",locale)}>{flow.labels.map((label,index)=><div key={label} className={index<flow.current||flow.complete?"done":index===flow.current?"current":""}><b>{index<flow.current||flow.complete?"✓":index+1}</b><span>{translateValue(label,locale)}</span></div>)}</div>;
}

export default function Home() {
  const [locale,setLocale]=useState<Locale>("en");
  useDomLocalization(locale);
  useEffect(()=>{const saved=window.localStorage.getItem("picklepilot-captain-language");if(saved==="fr"||saved==="en")setLocale(saved)},[]);
  function changeLocale(next:Locale){setLocale(next);window.localStorage.setItem("picklepilot-captain-language",next)}
  const [authLoading,setAuthLoading]=useState(true); const [appUser,setAppUser]=useState<AppUser|null>(null); const [setupRequired,setSetupRequired]=useState(false);
  const [teamLoading,setTeamLoading]=useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [players, setPlayers] = useState<Player[]>([]);
  const [available, setAvailable] = useState<number[]>([]);
  const [lineup, setLineup] = useState<Round[]>([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<{round:number;index:number}|null>(null);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player|null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerGender, setPlayerGender] = useState<Gender>("W");
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons,setSeasons]=useState<Season[]>([]);const [selectedSeason,setSelectedSeason]=useState<number|"all">("all");const [newSeasonName,setNewSeasonName]=useState("");const [seasonError,setSeasonError]=useState("");const [seasonSaving,setSeasonSaving]=useState(false);const seasonNameInputRef=useRef<HTMLInputElement>(null);const quickSaveQueue=useRef<Promise<void>>(Promise.resolve());
  const [venues,setVenues]=useState<Venue[]>([]);const [newVenueName,setNewVenueName]=useState("");
  const [opponents,setOpponents]=useState<Opponent[]>([]);const [editingOpponent,setEditingOpponent]=useState<Opponent|null>(null);const [opponentCity,setOpponentCity]=useState("");const [opponentTeam,setOpponentTeam]=useState("");const [opponentDefaultStrength,setOpponentDefaultStrength]=useState<"Weaker"|"Equal"|"Stronger">("Equal");
  const [activeMatch, setActiveMatch] = useState<Match|null>(null);
  const [editingMatch, setEditingMatch] = useState<Match|null>(null);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [matchOpponent, setMatchOpponent] = useState("");
  const [matchDate, setMatchDate] = useState("2026-08-19");
  const [matchTime, setMatchTime] = useState("20:00");
  const [matchLocation, setMatchLocation] = useState("Chambly Pickleball Club");
  const [matchStrength, setMatchStrength] = useState<"Weaker"|"Equal"|"Stronger">("Equal");
  const [matchHomeAway, setMatchHomeAway] = useState<"Local"|"Visitor">("Local");
  const [matchCourts, setMatchCourts] = useState(["1","2","3"]);
  const [matchPlayers, setMatchPlayers] = useState<number[]>([]);
  const [results, setResults] = useState<Record<string,"W"|"L">>({});
  const [showPhotoImport, setShowPhotoImport] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [scanResults, setScanResults] = useState<Record<string,ScanCell>>({});
  const [scanAnalyzed, setScanAnalyzed] = useState(false);
  const [reportView, setReportView] = useState<"real"|"adjusted">("real");
  const [reportEntity, setReportEntity] = useState<"pairs"|"players">("pairs");
  const [reportScope, setReportScope] = useState<"current"|"all">("current");
  const [reportSort, setReportSort] = useState<ReportSort>("rate");
  const [reportSortDirection, setReportSortDirection] = useState<"desc"|"asc">("desc");
  const [rules, setRules] = useState<RuleSettings>({blockWomenPairs:true,avoidConsecutivePartners:true,preferMaxTwo:true,blockAboveThree:true,avoidBackToBackRest:true,avoidLongStreaks:true});
  const [teamName,setTeamName]=useState("Chambly A");
  const [teamNameDraft,setTeamNameDraft]=useState("Chambly A");
  const [captainName,setCaptainName]=useState("Captain");
  const [captainNameDraft,setCaptainNameDraft]=useState("Captain");
  const [publicSlug,setPublicSlug]=useState("team");
  const [teamCategory,setTeamCategory]=useState<"Performance"|"Development"|"Senior">("Performance");
  const [playerRules,setPlayerRules]=useState<PlayerRule[]>([]);
  const [ruleA,setRuleA]=useState<number|"">(""); const [ruleB,setRuleB]=useState<number|"">("");
  const [ruleType,setRuleType]=useState<"Avoid"|"Required">("Avoid"); const [ruleMinimum,setRuleMinimum]=useState(1);
  const [lastSaved,setLastSaved]=useState("");

  useEffect(() => {
    fetch("/api/auth/status").then(response=>response.json()).then((result:{setupRequired:boolean;user:AppUser|null})=>{setSetupRequired(result.setupRequired);setAppUser(result.user);setAuthLoading(false)}).catch(()=>setAuthLoading(false));
  }, []);
  useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"})},[page]);
  useEffect(() => {
    resetTeamData();
    if(!appUser){setTeamLoading(false);return}
    let cancelled=false;setTeamLoading(true);
    async function loadPlayers() {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) throw new Error("Database unavailable");
        const result = await response.json() as { players: Player[] };
        if(cancelled)return;
        setPlayers(result.players);
        setAvailable(result.players.filter(p=>p.status==="Active").slice(0,8).map(p=>p.id));
      } catch {
        if(!cancelled)flash("The roster could not be loaded.");
      }
    }
    const playerLoad=loadPlayers();
    const loads=[playerLoad,
      fetch("/api/matches").then(response => response.ok ? response.json() : Promise.reject()).then((result: {matches: Match[]}) => {if(!cancelled)setMatches(result.matches)}),
      fetch("/api/settings").then(response=>response.ok?response.json():Promise.reject()).then((result:{settings:{teamName:string;captainName:string;category:"Performance"|"Development";publicSlug:string;blockWomenPairs?:boolean}})=>{if(cancelled)return;setTeamName(result.settings.teamName);setTeamNameDraft(result.settings.teamName);setCaptainName(result.settings.captainName);setCaptainNameDraft(result.settings.captainName);setTeamCategory(result.settings.category??"Performance");setPublicSlug(result.settings.publicSlug);setRules(current=>({...current,blockWomenPairs:result.settings.blockWomenPairs??true}))}),
      fetch("/api/player-rules").then(response=>response.ok?response.json():Promise.reject()).then((result:{rules:PlayerRule[]})=>{if(!cancelled)setPlayerRules(result.rules)}),
      fetch("/api/seasons").then(response=>response.ok?response.json():Promise.reject()).then((result:{seasons:Season[]})=>{if(cancelled)return;setSeasons(result.seasons);const active=result.seasons.find(season=>season.status==="Active");setSelectedSeason(active?.id??"all")}),
      fetch("/api/venues").then(response=>response.ok?response.json():Promise.reject()).then((result:{venues:Venue[]})=>{if(!cancelled)setVenues(result.venues)}),
      fetch("/api/opponents").then(response=>response.ok?response.json():Promise.reject()).then((result:{opponents:Opponent[]})=>{if(!cancelled)setOpponents(result.opponents)}),
    ];
    Promise.allSettled(loads).then(()=>{if(!cancelled)setTeamLoading(false)});
    return()=>{cancelled=true};
  }, [appUser?.id]);
  function resetTeamData(){setPlayers([]);setAvailable([]);setLineup([]);setMatches([]);setSeasons([]);setVenues([]);setOpponents([]);setPlayerRules([]);setResults({});setActiveMatch(null);setSelectedSeason("all");setReportScope("current");setTeamName("My team");setTeamNameDraft("My team");setCaptainName("Captain");setCaptainNameDraft("Captain");setTeamCategory("Performance");setPublicSlug("team")}
  const persist = (next: Player[]) => { setPlayers(next); };
  const flash = (message:string) => { setNotice(message); setTimeout(()=>setNotice(""),2600); };
  const activePlayers = players.filter(p=>p.status==="Active");
  const selectedPlayers = available.map(id=>players.find(p=>p.id===id)).filter(Boolean) as Player[];
  const mixedReady = selectedPlayers.some(p=>p.gender==="W") && selectedPlayers.some(p=>p.gender==="M");
  const activeSeason=seasons.find(season=>season.status==="Active")??null;
  const seasonMatches=useMemo(()=>selectedSeason==="all"?matches:matches.filter(match=>match.seasonId===selectedSeason),[matches,selectedSeason]);
  const reportMatches=useMemo(()=>reportScope==="all"?matches:matches.filter(match=>match.seasonId===activeSeason?.id),[matches,reportScope,activeSeason?.id]);
  const report = useMemo(() => {
    const pairs: Record<string,{players:string[];played:number;wins:number;losses:number;performance:number;rate:number;score:number}> = {};
    const individuals: Record<string,{players:string[];played:number;wins:number;losses:number;performance:number;rate:number;score:number}> = {};
    let played=0,wins=0,losses=0;
    reportMatches.forEach(match=>match.lineup?.forEach(round=>round.courts.forEach((pair,courtIndex)=>{
      const result=match.results?.[`${round.round}-${courtIndex+1}`]; if(!result)return;
      const players=[...pair].sort((a,b)=>a.localeCompare(b)); const key=players.join("|");
      const expected=match.opponentStrength==="Stronger"?.35:match.opponentStrength==="Weaker"?.65:.5;
      pairs[key]??={players,played:0,wins:0,losses:0,performance:0,rate:0,score:50}; pairs[key].played++; played++;
      pairs[key].performance+=(result==="W"?1:0)-expected;
      if(result==="W"){pairs[key].wins++;wins++}else{pairs[key].losses++;losses++}
      pair.forEach(name=>{individuals[name]??={players:[name],played:0,wins:0,losses:0,performance:0,rate:0,score:50};individuals[name].played++;individuals[name].performance+=(result==="W"?1:0)-expected;if(result==="W")individuals[name].wins++;else individuals[name].losses++});
    })));
    const ranking=Object.values(pairs).map(pair=>({...pair,rate:pair.wins/pair.played*100,score:Math.max(0,Math.min(100,50+pair.performance/(pair.played+4)*100))}));
    const playerRanking=Object.values(individuals).map(player=>({...player,rate:player.wins/player.played*100,score:Math.max(0,Math.min(100,50+player.performance/(player.played+4)*100))}));
    return {ranking,playerRanking,played,wins,losses,completed:reportMatches.filter(match=>match.status==="Completed").length};
  },[reportMatches]);
  const sortedReport = useMemo(() => [...(reportEntity==="pairs"?report.ranking:report.playerRanking)].sort((a,b)=>{
    const key=reportView==="real"&&reportSort==="score"?"rate":reportSort;
    const difference=a[key]-b[key];
    return (reportSortDirection==="desc"?-difference:difference)||b.played-a.played||a.players.join().localeCompare(b.players.join());
  }),[report.ranking,report.playerRanking,reportEntity,reportSort,reportSortDirection,reportView]);
  const dashboard = useMemo(() => {
    const nextMatch=seasonMatches.find(match=>match.status!=="Completed") ?? null;
    const completed=seasonMatches.filter(match=>match.status==="Completed");
    const matchRecords=completed.map(match=>{
      const values=Object.values(match.results??{});
      const wins=values.filter(value=>value==="W").length;
      const losses=values.filter(value=>value==="L").length;
      return {wins,losses};
    });
    const teamWins=matchRecords.filter(record=>record.wins>record.losses).length;
    const teamLosses=matchRecords.filter(record=>record.losses>record.wins).length;
    return {nextMatch,teamWins,teamLosses};
  },[seasonMatches]);

  const validation = useMemo(() => {
    const restCount: Record<string,number> = Object.fromEntries(selectedPlayers.map(p=>[p.name,0]));
    const partners: Record<string,number> = {}; const blocking:string[]=[]; const warnings:string[]=[];
    lineup.forEach((row,rowIndex) => {
      const all=[...row.courts.flat(),...row.rest];
      [...new Set(all.filter((n,i)=>all.indexOf(n)!==i))].forEach(n=>blocking.push(`Round ${row.round}: ${n} appears more than once`));
      all.filter(n=>!selectedPlayers.some(p=>p.name===n)).forEach(n=>blocking.push(`Round ${row.round}: ${n} is not in this roster`));
      row.rest.forEach(n=>{if(n in restCount)restCount[n]++});
      if(rules.avoidBackToBackRest&&rowIndex&&row.rest.some(n=>lineup[rowIndex-1].rest.includes(n)))warnings.push(`Round ${row.round}: back-to-back rest`);
      row.courts.forEach((pair,courtIndex)=>{
        const key=[...pair].sort().join("|");partners[key]=(partners[key]||0)+1;
        if(rules.avoidConsecutivePartners&&rowIndex&&lineup[rowIndex-1].courts.some(previous=>[...previous].sort().join("|")===key))warnings.push(`Round ${row.round}: ${pair.join(" + ")} also played together in the previous round`);
        const genders=pair.map(n=>selectedPlayers.find(p=>p.name===n)?.gender);
        if(rules.blockWomenPairs&&genders[0]==="W"&&genders[1]==="W")blocking.push(`Round ${row.round}, court ${courtIndex+1}: women cannot play together`);
        if(mixedRequired.has(`${row.round}-${courtIndex+1}`)&&(!genders[0]||genders[0]===genders[1]))blocking.push(`Round ${row.round}, court ${courtIndex+1}: mixed doubles required`);
      });
    });
    Object.entries(restCount).forEach(([n,c])=>{if(c!==2)blocking.push(`${n} rests ${c} times`)});
    Object.entries(partners).forEach(([pair,c])=>{if(rules.blockAboveThree&&c>3)warnings.push(`${pair.replace("|"," + ")} play together ${c} times`)});
    playerRules.forEach(rule=>{const a=players.find(player=>player.id===rule.playerAId)?.name,b=players.find(player=>player.id===rule.playerBId)?.name;if(!a||!b)return;const count=partners[[a,b].sort().join("|")]||0;if(rule.ruleType==="Avoid"&&count>0)warnings.push(`${a} and ${b} should not play together`);if(rule.ruleType==="Required"&&count<rule.minimumGames)warnings.push(`${a} and ${b} should play together at least ${rule.minimumGames} time${rule.minimumGames===1?"":"s"}`)});
    return {blocking:[...new Set(blocking)],warnings:[...new Set(warnings)]};
  },[lineup,selectedPlayers,rules,playerRules,players]);

  async function saveTeamName(){const name=teamNameDraft.trim(),captain=captainNameDraft.trim();if(!name||!captain)return;const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamName:name,captainName:captain,category:teamCategory})});if(response.ok){setTeamName(name);setCaptainName(captain);flash("Team settings saved.")}else flash("The settings could not be saved.")}
  async function setWomenPairsBlocked(blockWomenPairs:boolean){setRules(current=>({...current,blockWomenPairs}));const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamName,captainName,category:teamCategory,blockWomenPairs})});if(response.ok)flash(blockWomenPairs?"Women’s pairs are blocked.":"Women’s pairs are allowed.");else {setRules(current=>({...current,blockWomenPairs:!blockWomenPairs}));flash("The rule could not be saved.")}}
  async function createSeason(event?:FormEvent){
    event?.preventDefault();
    const name=newSeasonName.trim();
    setSeasonError("");
    if(!name){
      setSeasonError("Enter the new season name before continuing.");
      seasonNameInputRef.current?.focus();
      return;
    }
    setSeasonSaving(true);
    try{
      const response=await fetch("/api/seasons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});
      const result=await response.json().catch(()=>({error:"The server returned an unexpected response."})) as {season?:Season;error?:string};
      if(!response.ok||!result.season){
        setSeasonError(result.error??"The season could not be created. Please try again.");
        return;
      }
      const season=result.season;
      setSeasons(current=>[...current.map(item=>item.status==="Active"?{...item,status:"Closed" as const,closedAt:new Date().toISOString()}:item),season]);
      setSelectedSeason(season.id);
      setNewSeasonName("");
      flash(`${season.name} is now the active season.`);
    }catch{
      setSeasonError("The connection failed. Please try again.");
    }finally{
      setSeasonSaving(false);
    }
  }
  async function createVenue(){const name=newVenueName.trim();if(!name)return;const response=await fetch("/api/venues",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});if(!response.ok){flash("The location could not be saved.");return}const {venue}=await response.json() as {venue:Venue};setVenues(current=>current.some(item=>item.id===venue.id)?current:[...current,venue].sort((a,b)=>a.name.localeCompare(b.name)));setNewVenueName("");flash(`${venue.name} added.`)}
  async function toggleVenue(venue:Venue){const status=venue.status==="Active"?"Inactive":"Active";const response=await fetch("/api/venues",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:venue.id,status})});if(!response.ok){flash("The location could not be updated.");return}setVenues(current=>current.map(item=>item.id===venue.id?{...item,status}:item));flash(`${venue.name} is now ${status.toLowerCase()}.`)}
  const opponentLabel=(item:Opponent)=>`${item.city} · ${item.teamName}`;
  async function saveOpponent(){const city=opponentCity.trim(),teamName=opponentTeam.trim();if(!city||!teamName)return;const response=await fetch("/api/opponents",{method:editingOpponent?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingOpponent?.id,city,teamName,defaultStrength:opponentDefaultStrength})});if(!response.ok){flash("The opponent could not be saved.");return}const {opponent}=await response.json() as {opponent:Opponent};setOpponents(current=>(editingOpponent?current.map(item=>item.id===opponent.id?opponent:item):[...current,opponent]).sort((a,b)=>opponentLabel(a).localeCompare(opponentLabel(b))));setEditingOpponent(null);setOpponentCity("");setOpponentTeam("");setOpponentDefaultStrength("Equal");flash(editingOpponent?`${opponentLabel(opponent)} updated.`:`${opponentLabel(opponent)} added.`)}
  function editOpponent(item:Opponent){setEditingOpponent(item);setOpponentCity(item.city);setOpponentTeam(item.teamName);setOpponentDefaultStrength(item.defaultStrength)}
  function cancelOpponentEdit(){setEditingOpponent(null);setOpponentCity("");setOpponentTeam("");setOpponentDefaultStrength("Equal")}
  async function removeOpponent(item:Opponent){const question=locale==="fr"?`Supprimer ${opponentLabel(item)}? Les matchs existants ne seront pas modifiés.`:`Remove ${opponentLabel(item)}? Existing matches will not be changed.`;if(!window.confirm(question))return;const response=await fetch(`/api/opponents?id=${item.id}`,{method:"DELETE"});if(!response.ok){flash("The opponent could not be removed.");return}setOpponents(current=>current.filter(opponent=>opponent.id!==item.id));if(editingOpponent?.id===item.id)cancelOpponentEdit();flash(`${opponentLabel(item)} removed.`)}
  async function toggleOpponent(item:Opponent){const status=item.status==="Active"?"Inactive":"Active";const response=await fetch("/api/opponents",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id,status})});if(!response.ok){flash("The opponent could not be updated.");return}setOpponents(current=>current.map(opponent=>opponent.id===item.id?{...opponent,status}:opponent));flash(`${opponentLabel(item)} is now ${status.toLowerCase()}.`)}
  async function addPlayerRule(){if(!ruleA||!ruleB||ruleA===ruleB){flash("Select two different players.");return}const response=await fetch("/api/player-rules",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({playerAId:ruleA,playerBId:ruleB,ruleType,minimumGames:ruleMinimum})});if(!response.ok){flash("The player rule could not be saved.");return}const {rule}=await response.json() as {rule:PlayerRule};setPlayerRules(current=>[...current,rule]);setRuleA("");setRuleB("");flash("Player rule saved.")}
  async function removePlayerRule(id:number){const response=await fetch(`/api/player-rules?id=${id}`,{method:"DELETE"});if(response.ok){setPlayerRules(current=>current.filter(rule=>rule.id!==id));flash("Player rule removed.")}}

  function generate(){if(selectedPlayers.length!==8||!mixedReady)return;const next=buildLineup(selectedPlayers,matches,playerRules,rules);if(!next.length){flash("No valid lineup for this roster. Select at most four women.");return}setLineup(next);setEditing(false);setSelected(null);flash("Best available lineup generated from pair rankings, game volume and active preferences.")}
  function sortReport(key:ReportSort){if(reportSort===key)setReportSortDirection(direction=>direction==="desc"?"asc":"desc");else{setReportSort(key);setReportSortDirection("desc")}}
  function swapPlayer(round:number,index:number){if(!editing)return;if(!selected||selected.round!==round){setSelected({round,index});return}const next=structuredClone(lineup),values=[...next[round].courts.flat(),...next[round].rest];[values[selected.index],values[index]]=[values[index],values[selected.index]];next[round].courts=[[values[0],values[1]],[values[2],values[3]],[values[4],values[5]]];next[round].rest=[values[6],values[7]];setLineup(next);setSelected(null)}
  function openForm(player?:Player){setEditingPlayer(player||null);setPlayerName(player?.name||"");setPlayerGender(player?.gender||"W");setShowForm(true)}
  async function savePlayer(e:FormEvent){
    e.preventDefault(); const name=playerName.trim(); if(!name)return;
    if(players.some(p=>p.name.toLowerCase()===name.toLowerCase()&&p.id!==editingPlayer?.id)){flash("A player with this name already exists.");return}
    try {
      const response = await fetch("/api/players", {
        method: editingPlayer ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPlayer?.id, name, gender: playerGender, status: editingPlayer?.status ?? "Active" }),
      });
      if(!response.ok) throw new Error("Save failed");
      const { player,previousName,renamedMatchIds=[] } = await response.json() as { player: Player;previousName?:string;renamedMatchIds?:number[] };
      persist(editingPlayer ? players.map(p=>p.id===player.id?player:p) : [...players,player]);
      if(editingPlayer&&previousName&&previousName!==player.name){
        const rename=(rounds:Round[]|null|undefined)=>rounds?.map(round=>({...round,courts:round.courts.map(pair=>pair.map(value=>value===previousName?player.name:value)),rest:round.rest.map(value=>value===previousName?player.name:value)}))??rounds;
        setMatches(current=>current.map(match=>renamedMatchIds.includes(match.id)?{...match,lineup:rename(match.lineup)}:match));
        setActiveMatch(current=>current&&renamedMatchIds.includes(current.id)?{...current,lineup:rename(current.lineup)}:current);
        setLineup(current=>rename(current)??[]);
      }
      setShowForm(false); flash(editingPlayer?"Player updated and saved.":"Player added and saved.");
    } catch { flash("The player could not be saved. Please try again."); }
  }
  async function toggleStatus(player:Player){
    const status=player.status==="Active"?"Inactive":"Active";
    try {
      const response=await fetch("/api/players",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...player,status})});
      if(!response.ok)throw new Error("Update failed");
      const payload=await response.json() as {player:Player}; persist(players.map(p=>p.id===player.id?payload.player:p));
      if(status==="Inactive")setAvailable(ids=>ids.filter(id=>id!==player.id)); flash(`${player.name} is now ${status.toLowerCase()} and saved.`);
    } catch { flash("The status could not be saved. Please try again."); }
  }
  async function removePlayer(player:Player){
    try {
      const response=await fetch(`/api/players?id=${player.id}`,{method:"DELETE"}); if(!response.ok)throw new Error("Delete failed");
      persist(players.filter(p=>p.id!==player.id)); setAvailable(ids=>ids.filter(id=>id!==player.id)); flash(`${player.name} removed.`);
    } catch { flash("The player could not be removed. Please try again."); }
  }
  function openMatchForm(match?:Match){
    if(!match&&!activeSeason){flash("Create your first season before adding a match.");setPage("seasons");return}
    const recentMatch=match?undefined:[...matches].sort((a,b)=>`${a.matchDate} ${a.matchTime}`.localeCompare(`${b.matchDate} ${b.matchTime}`)).pop();
    const activePlayerIds=new Set(activePlayers.map(player=>player.id));
    setEditingMatch(match??null);
    setMatchOpponent(match?.opponent??""); setMatchDate(match?.matchDate??new Date().toISOString().slice(0,10)); setMatchTime(match?.matchTime??"20:00");
    setMatchLocation(match?.location??""); setMatchStrength(match?.opponentStrength??"Equal");
    setMatchHomeAway(match?.homeAway??"Local"); setMatchCourts(match?[match.court1,match.court2,match.court3]:["1","2","3"]);
    setMatchPlayers(match?.playerIds??recentMatch?.playerIds.filter(id=>activePlayerIds.has(id))??[]); setShowMatchForm(true);
  }
  async function saveMatch(e:FormEvent){
    e.preventDefault();
    try {
      const response=await fetch("/api/matches",{method:editingMatch?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        ...(editingMatch??{}),opponent:matchOpponent,matchDate,matchTime,location:matchLocation,opponentStrength:matchStrength,homeAway:matchHomeAway,court1:matchCourts[0],court2:matchCourts[1],court3:matchCourts[2],warmupMinutes:editingMatch?.warmupMinutes??10,roundMinutes:editingMatch?.roundMinutes??12,breakMinutes:editingMatch?.breakMinutes??2,playerIds:matchPlayers,seasonId:editingMatch?.seasonId??activeSeason?.id,
      })});
      if(!response.ok)throw new Error("Save failed");
      const {match}=await response.json() as {match:Match}; setMatches(current=>editingMatch?current.map(item=>item.id===match.id?match:item):[...current,match]);setActiveMatch(current=>current?.id===match.id?match:current);setEditingMatch(null);setShowMatchForm(false);flash(editingMatch?"Match updated. Lineup and results were preserved.":"Match created and saved.");
    } catch { flash("The match could not be saved. Please try again."); }
  }
  function buildMatch(match:Match){
    setActiveMatch(match); setAvailable(match.playerIds);
    if(match.lineup?.length===8){setLineup(match.lineup)}
    else if(match.playerIds.length===8){const roster=match.playerIds.map(id=>players.find(player=>player.id===id)).filter(Boolean) as Player[];if(roster.length===8)setLineup(buildLineup(roster,matches,playerRules,rules))}
    setPage("builder");
  }
  function continueMatch(match:Match){if(match.lineup?.length===8||match.status==="Completed")openResults(match);else buildMatch(match)}
  function openPrint(match:Match){if(!match.lineup?.length){flash("Save the lineup before printing.");return}setActiveMatch(match);setPage("print")}
  async function saveLineup(){
    if(!activeMatch){flash("Open the lineup from a saved match before saving.");setPage("matches");return}
    try {
      const response=await fetch("/api/matches",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...activeMatch,playerIds:available,lineup})});
      if(!response.ok)throw new Error("Save failed");
      const {match}=await response.json() as {match:Match}; setActiveMatch(match); setMatches(current=>current.map(item=>item.id===match.id?match:item)); setLastSaved(new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})); flash("Lineup saved to this match.");
    } catch { flash("The lineup could not be saved. Please try again."); }
  }
  async function openResults(match:Match){
    if(!match.lineup?.length){flash("Save the lineup before entering results.");return}
    setResults({});
    try {
      const response=await fetch(`/api/matches?id=${match.id}`,{cache:"no-store"});
      if(!response.ok)throw new Error("Load failed");
      const {match:freshMatch}=await response.json() as {match:Match};
      setActiveMatch(freshMatch); setResults({...(freshMatch.results ?? {})}); setPage("results");
    } catch { flash("The match results could not be loaded. Please try again."); }
  }
  async function saveResults(){
    if(!activeMatch)return;
    const completed=Object.keys(results).length===24;
    try {
      const response=await fetch("/api/matches",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...activeMatch,results,status:completed?"Completed":"Upcoming"})});
      if(!response.ok)throw new Error("Save failed");
      const {match}=await response.json() as {match:Match}; setActiveMatch(match); setMatches(current=>current.map(item=>item.id===match.id?match:item));
      flash(completed?"All 24 results saved. Match completed!":"Results saved as a draft.");
      if(completed)setPage("matches");
    } catch { flash("The results could not be saved. Please try again."); }
  }
  function toggleDraftResult(key:string,value:"W"|"L"){
    setResults(current=>{const next={...current};if(next[key]===value)delete next[key];else next[key]=value;return next});
  }
  async function saveQuickResult(match:Match,key:string,value:"W"|"L"){
    const nextResults={...(match.results??{})};
    if(nextResults[key]===value)delete nextResults[key];else nextResults[key]=value;
    const nextMatch={...match,results:nextResults,status:(Object.keys(nextResults).length===24?"Completed":"Upcoming") as Match["status"]};
    setMatches(current=>current.map(item=>item.id===match.id?nextMatch:item));
    quickSaveQueue.current=quickSaveQueue.current.then(async()=>{
      try {
        const response=await fetch("/api/matches",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(nextMatch)});
        if(!response.ok)throw new Error("Save failed");
        const {match:saved}=await response.json() as {match:Match};
        setMatches(current=>current.map(item=>{if(item.id!==saved.id)return item;const mergedResults={...(saved.results??{}),...(item.results??{})};return {...saved,results:mergedResults,status:Object.keys(mergedResults).length===24?"Completed":saved.status}}));
        if(saved.status==="Completed")flash("All 24 results saved. Match completed!");
      } catch { flash("This result could not be saved. Tap it again to retry."); }
    });
    await quickSaveQueue.current;
  }
  function selectResultPhoto(file?:File){
    if(!file)return;
    if(photoPreview)URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));setPhotoName(file.name);setScanResults({});setScanAnalyzed(false);
  }
  function clearPhotoImport(){if(photoPreview)URL.revokeObjectURL(photoPreview);setPhotoPreview("");setPhotoName("");setScanResults({});setScanAnalyzed(false)}
  function openPhotoImport(){clearPhotoImport();setShowPhotoImport(true)}
  function closePhotoImport(){clearPhotoImport();setShowPhotoImport(false)}
  function simulatePhotoReading(){
    const values:("W"|"L"|null)[][]=[
      ["W","W","L"],["W","L","L"],["W","W","W"],["W","W","W"],
      ["W","L",null],["W","W","W"],["W","L",null],["L","W","W"],
    ];
    const next:Record<string,ScanCell>={};
    values.forEach((row,roundIndex)=>row.forEach((value,courtIndex)=>{const confidence=value===null?"low":(roundIndex===6||roundIndex===7)?"medium":"high";next[`${roundIndex+1}-${courtIndex+1}`]={value,confidence}}));
    setScanResults(next);setScanAnalyzed(true);
  }
  function applyPhotoReading(){
    const detected=Object.fromEntries(Object.entries(scanResults).filter(([,cell])=>cell.value).map(([key,cell])=>[key,cell.value])) as Record<string,"W"|"L">;
    setResults(current=>({...current,...detected}));closePhotoImport();flash(`${Object.keys(detected).length} photo results applied. Review the remaining courts.`);
  }

  if(authLoading)return <><LanguageSelector locale={locale} onChange={changeLocale}/><div className="auth-loading">Loading PicklePilot…</div></>;
  if(!appUser)return <><LanguageSelector locale={locale} onChange={changeLocale}/><AuthScreen setupRequired={setupRequired} onAuthenticated={user=>{setAppUser(user);setSetupRequired(false)}}/></>;
  if(teamLoading)return <><LanguageSelector locale={locale} onChange={changeLocale}/><div className="auth-loading">Loading your team…</div></>;

  return <main className="app-shell"><LanguageSelector locale={locale} onChange={changeLocale}/><Sidebar page={page} go={setPage} captainName={captainName}/><MobileNav page={page} go={setPage}/>
    {page==="dashboard"&&<section className="content"><header className="topbar"><div><p className="eyebrow">{selectedSeason==="all"?"ALL SEASONS":seasons.find(season=>season.id===selectedSeason)?.name.toUpperCase()}</p><h1>Good afternoon, {captainName}</h1></div><div className="season-switcher"><select aria-label="Selected season" value={selectedSeason} onChange={event=>setSelectedSeason(event.target.value==="all"?"all":Number(event.target.value))}><option value="all">All seasons</option>{seasons.map(season=><option value={season.id} key={season.id}>{season.name}{season.status==="Active"?" · Active":""}</option>)}</select><button className="outline-btn" onClick={()=>setPage("seasons")}>Manage</button></div></header>
      <section className="hero-card"><div className="hero-copy"><span className="status">{dashboard.nextMatch?"YOUR NEXT ACTION":"SCHEDULE"}</span><h2>{dashboard.nextMatch?<>{teamName} <span>vs</span> {dashboard.nextMatch.opponent}</>:"No upcoming match"}</h2><p>{dashboard.nextMatch?`${dashboard.nextMatch.matchDate} · ${dashboard.nextMatch.matchTime} · ${dashboard.nextMatch.location}`:"Create a match to start selecting players and building the lineup."}</p>{dashboard.nextMatch&&<MatchJourney match={dashboard.nextMatch} locale={locale}/>}</div><div className="hero-actions">{dashboard.nextMatch&&<div className="readiness"><strong>{matchProgress(dashboard.nextMatch).resultCount||dashboard.nextMatch.playerIds.length}</strong><span>{matchProgress(dashboard.nextMatch).resultCount?"results entered":"players selected"}</span></div>}<button className="primary-btn" onClick={()=>dashboard.nextMatch?continueMatch(dashboard.nextMatch):setPage("matches")}>{dashboard.nextMatch?`${translateValue(matchProgress(dashboard.nextMatch).nextLabel,locale)} →`:"Create match →"}</button></div></section>
      <section className="stats-grid"><article><span>SEASON RECORD</span><strong>{dashboard.teamWins}–{dashboard.teamLosses}</strong><small>{report.completed} completed match{report.completed===1?"":"es"}</small></article><article><span>WIN RATE</span><strong>{report.played?`${Math.round(report.wins/report.played*100)}%`:"—"}</strong><small>{report.played?`${report.wins} wins in ${report.played} recorded games`:"No results recorded"}</small></article><article><span>ACTIVE PLAYERS</span><strong>{activePlayers.length}</strong><small>Chambly A roster</small></article><article><span>NEXT OPPONENT</span><strong className="pair-name">{dashboard.nextMatch?.opponent??"—"}</strong><small>{dashboard.nextMatch?`${dashboard.nextMatch.matchDate} · ${dashboard.nextMatch.matchTime}`:"No match scheduled"}</small></article></section>
      <section className="lineup-section"><div className="section-heading"><div><p className="eyebrow">NEXT LINEUP</p><h2>{dashboard.nextMatch?.lineup?.length?"Saved lineup":"No lineup saved"}</h2><p>{dashboard.nextMatch?.lineup?.length?`Complete 8-round lineup for the match against ${dashboard.nextMatch.opponent}.`:"Open a real match to generate and save its lineup."}</p></div><div className="section-actions"><button className="ghost-btn" onClick={()=>setPage("players")}>Manage players</button><button className="primary-btn" onClick={()=>dashboard.nextMatch?buildMatch(dashboard.nextMatch):setPage("matches")}>{dashboard.nextMatch?"Open match →":"Create match →"}</button></div></div>{dashboard.nextMatch?.lineup?.length?<LineupTable lineup={dashboard.nextMatch.lineup} courtLabels={[dashboard.nextMatch.court1,dashboard.nextMatch.court2,dashboard.nextMatch.court3]} results={dashboard.nextMatch.results} onResult={(key,value)=>saveQuickResult(dashboard.nextMatch!,key,value)} editing={false} selected={null} onSwap={()=>{}}/>:<div className="dashboard-empty-lineup"><span>▦</span><strong>Your first real lineup will appear here.</strong></div>}</section>
    </section>}
    {page==="builder"&&<section className="content builder-content"><header className="builder-header"><div><button className="back-btn" onClick={()=>setPage("matches")}>← All matches</button><p className="eyebrow">{activeMatch ? `${activeMatch.matchDate} · ${activeMatch.matchTime} · ${activeMatch.location}` : "LINEUP WORKSPACE"}</p><h1>{activeMatch?.opponent?`${teamName} vs ${activeMatch.opponent}`:"Lineup builder"}</h1><p>Follow the steps below. PicklePilot keeps the whole match preparation in one place.</p></div><div className="save-state"><strong>{lastSaved?"✓ Saved":"Match workspace"}</strong><span>{lastSaved?`Last saved at ${lastSaved}`:"Save the lineup when it is ready"}</span></div></header>{activeMatch&&<MatchJourney match={{...activeMatch,lineup}} locale={locale}/>}
      <section className="setup-grid"><article className="setup-card roster-card"><div className="card-title"><div><span>1</span><div><h2>Available players</h2><p>Select exactly 8 players for this match.</p></div></div><strong className={available.length===8?"ready-pill":"warning-pill"}>{available.length}/8 selected</strong></div><div className="player-grid">{activePlayers.map(player=><button key={player.id} className={available.includes(player.id)?"player active":"player"} onClick={()=>setAvailable(ids=>ids.includes(player.id)?ids.filter(id=>id!==player.id):ids.length<8?[...ids,player.id]:ids)}><span>{player.name.slice(0,2).toUpperCase()}</span><div><strong>{player.name}</strong><small>{player.gender==="W"?"Women":"Men"}</small></div><b>{available.includes(player.id)?"✓":"+"}</b></button>)}</div>{activePlayers.length<8&&<button className="inline-link" onClick={()=>setPage("players")}>+ Add players to complete the roster</button>}</article>
        <article className="setup-card opponent-card best-lineup-card"><div className="card-title"><div><span>2</span><div><h2>Generate the best lineup</h2><p>PicklePilot compares possible combinations using pair rankings, game volume, required rules and active preferences.</p></div></div></div><div className="best-lineup-note"><b>✦</b><span><strong>Ranking-based optimization</strong><small>Pairs without history start at a neutral score of 50.</small></span></div>{available.length===8&&!mixedReady&&<p className="mixed-roster-error">Select at least 1 woman and 1 man to generate the required mixed courts.</p>}<button className="generate-main" disabled={available.length!==8||!mixedReady} onClick={generate}>Generate best lineup <span>✦</span></button></article>
      </section>
      <div className="builder-rules-summary"><div><strong>{Object.values(rules).filter(Boolean).length} rules active</strong><span>Required competition rules are always enforced.</span></div><button className="ghost-btn" onClick={()=>setPage("rules")}>Edit rules →</button></div>
      <section className="builder-lineup"><div className="builder-lineup-head"><div><p className="eyebrow">STEP 2 · 8 ROUNDS · 3 COURTS</p><h2>Review your lineup</h2><p>Swap players if needed, then save. Printing is optional.</p></div><div className="section-actions"><button className={editing?"edit-active":"ghost-btn"} onClick={()=>{setEditing(!editing);setSelected(null)}}>{editing?"Finish editing":"Edit lineup"}</button><button className="ghost-btn" disabled={available.length!==8||!mixedReady} onClick={generate}>Generate again ✦</button></div></div><div className={validation.blocking.length?"validation warning":"validation success"}><strong>{validation.blocking.length?`${validation.blocking.length} blocking error${validation.blocking.length>1?"s":""}`:"Ready to save"}</strong><span>{validation.blocking.length?validation.blocking.slice(0,3).join(" · "):"All Always on rules are respected."}</span></div>{validation.warnings.length>0&&<div className="validation warning"><strong>{validation.warnings.length} preference warning{validation.warnings.length>1?"s":""}</strong><span>{validation.warnings.slice(0,3).join(" · ")} · You can still save this lineup.</span></div>}<LineupTable lineup={lineup} editing={editing} selected={selected} onSwap={swapPlayer}/><div className="builder-footer"><span>{validation.blocking.length?"Fix all required-rule errors before saving the lineup.":validation.warnings.length?"Preferences are warnings only; this lineup can be saved.":activeMatch?"Everything is ready for the next step.":"Open the builder from Matches to save this lineup."}</span><div className="builder-footer-actions">{activeMatch?.lineup?.length===8&&<button className="ghost-btn" onClick={()=>openResults(activeMatch)}>{translateValue("Enter results",locale)}</button>}{activeMatch?.lineup?.length===8&&<button className="ghost-btn" onClick={()=>openPrint(activeMatch)}>Print lineup</button>}<button className="primary-btn" disabled={validation.blocking.length>0||available.length!==8||!mixedReady} onClick={saveLineup}>{activeMatch?.lineup?.length===8?"Save changes":"Save lineup"} →</button></div></div></section>
    </section>}
    {page==="print"&&activeMatch?.lineup&&<PrintLineup match={activeMatch} players={players} teamName={teamName} category={teamCategory} locale={locale} onBack={()=>setPage("matches")}/>}
    {page==="rules"&&<section className="content rules-content"><header className="rules-header"><div><p className="eyebrow">LINEUP CONFIGURATION</p><h1>Rules</h1><p>Set how PicklePilot should build and validate every lineup.</p></div><button className="primary-btn" onClick={()=>setPage("builder")}>Back to lineup builder →</button></header>
      <section className="rules-page-grid"><article className="rules-panel mandatory-panel"><div className="rules-panel-head"><span>✓</span><div><p className="eyebrow">ALWAYS ON</p><h2>Required rules</h2><small>These protect the competition format and cannot be disabled.</small></div></div><div className="mandatory-list"><div><b>8</b><span><strong>Eight selected players</strong><small>A complete roster is required.</small></span></div><div><b>6+2</b><span><strong>Six play, two rest</strong><small>Applied in every round.</small></span></div><div><b>1×</b><span><strong>One appearance per round</strong><small>No player can be on two courts.</small></span></div><div><b>M</b><span><strong>Required mixed courts</strong><small>Rounds 2, 3, 5 and 7.</small></span></div></div></article>
        <article className="rules-panel preference-panel"><div className="rules-panel-head"><span>⚙</span><div><p className="eyebrow">CUSTOMIZABLE</p><h2>Lineup preferences</h2><small>Configure lineup preferences and team rules.</small></div></div><div className="optional-rules"><label><input type="checkbox" checked={rules.blockWomenPairs} onChange={event=>setWomenPairsBlocked(event.target.checked)}/><span><b>{rules.blockWomenPairs?"✓":""}</b><i><strong>Block two women playing together</strong><small>{rules.blockWomenPairs?"Blocked for this team":"Allowed for this team"}</small></i></span></label>{([[
          "avoidConsecutivePartners","Avoid the same pair in consecutive rounds"],["preferMaxTwo","Prefer no more than 2 games with the same partner"],["blockAboveThree","Block more than 3 games with the same partner"],["avoidBackToBackRest","Avoid back-to-back rests"],["avoidLongStreaks","Avoid long streaks without rest"],
        ] as [keyof RuleSettings,string][]).map(([key,label])=><label key={key}><input type="checkbox" checked={rules[key]} onChange={()=>setRules(current=>({...current,[key]:!current[key]}))}/><span><b>{rules[key]?"✓":""}</b><i><strong>{label}</strong><small>{rules[key]?"Active":"Not applied"}</small></i></span></label>)}</div></article>
        <article className="rules-panel player-rules-panel"><div className="rules-panel-head"><span>2</span><div><p className="eyebrow">PLAYER RELATIONSHIPS</p><h2>Player preferences</h2><small>Choose preferred pairings. These create warnings and never block saving.</small></div></div><div className="player-rule-form"><select aria-label="First player" value={ruleA} onChange={event=>setRuleA(Number(event.target.value)||"")}><option value="">First player</option>{activePlayers.map(player=><option key={player.id} value={player.id}>{player.name}</option>)}</select><select aria-label="Rule type" value={ruleType} onChange={event=>setRuleType(event.target.value as "Avoid"|"Required")}><option value="Avoid">Should not play together</option><option value="Required">Should play together</option></select><select aria-label="Second player" value={ruleB} onChange={event=>setRuleB(Number(event.target.value)||"")}><option value="">Second player</option>{activePlayers.filter(player=>player.id!==ruleA).map(player=><option key={player.id} value={player.id}>{player.name}</option>)}</select>{ruleType==="Required"&&<label>Games together<select value={ruleMinimum} onChange={event=>setRuleMinimum(Number(event.target.value))}><option value={1}>1 game</option><option value={2}>2 games</option><option value={3}>3 games</option></select></label>}<button className="primary-btn" onClick={addPlayerRule}>Add preference</button></div><div className="saved-player-rules">{playerRules.length===0?<p>No specific player preferences yet.</p>:playerRules.map(rule=>{const a=players.find(player=>player.id===rule.playerAId)?.name??"Player",b=players.find(player=>player.id===rule.playerBId)?.name??"Player";return <div key={rule.id}><span><strong>{a} + {b}</strong><small>{rule.ruleType==="Avoid"?"Should not play together":`Should play together ${rule.minimumGames} time${rule.minimumGames===1?"":"s"}`}</small></span><button onClick={()=>removePlayerRule(rule.id)}>Remove</button></div>})}</div></article></section>
    </section>}
    {page==="seasons"&&<section className="content seasons-content"><header className="players-header"><div><p className="eyebrow">HISTORY</p><h1>Seasons</h1><p>Create and name each season yourself. Previous results remain saved.</p></div><button className="outline-btn" onClick={()=>setPage("dashboard")}>← Dashboard</button></header><section className="season-create-card"><div><p className="eyebrow">ACTIVE SEASON</p><h2>{activeSeason?.name??"No active season"}</h2><p>{activeSeason?"Creating a new season closes the current one and preserves its complete history.":"Choose any name to create your first season and begin adding matches."}</p></div><form onSubmit={createSeason} noValidate><label>{activeSeason?"New season name":"First season name"}<input ref={seasonNameInputRef} value={newSeasonName} onChange={event=>{setNewSeasonName(event.target.value);if(seasonError)setSeasonError("")}} placeholder="Enter any name" aria-invalid={Boolean(seasonError)} aria-describedby={seasonError?"season-name-error":undefined}/>{seasonError&&<span id="season-name-error" className="season-form-error" role="alert">{seasonError}</span>}</label><button className="primary-btn" type="submit" disabled={seasonSaving}>{seasonSaving?"Starting season…":activeSeason?"Close current & start new →":"Create first season →"}</button></form></section><section className="season-history"><div className="season-history-head"><h2>Season history</h2><button className="ghost-btn" onClick={()=>{setReportScope("all");setPage("reports")}}>View all-time reports</button></div>{[...seasons].reverse().map(season=>{const count=matches.filter(match=>match.seasonId===season.id).length;return <article key={season.id}><div><strong>{season.name}</strong><span className={season.status==="Active"?"season-active":"season-closed"}>{season.status}</span></div><p>{count} match{count===1?"":"es"}</p><button onClick={()=>{setReportScope(season.status==="Active"?"current":"all");setPage("reports")}}>{season.status==="Active"?"View current report →":"View all-time report →"}</button></article>})}</section></section>}
    {page==="venues"&&<section className="content venues-content"><header className="players-header"><div><p className="eyebrow">MATCH LOCATIONS</p><h1>Locations</h1><p>Save the places used by your team. The selected location appears on the printed match sheet.</p></div><button className="outline-btn" onClick={()=>setPage("matches")}>← Matches</button></header><section className="venue-create-card"><label>Location name<input value={newVenueName} onChange={event=>setNewVenueName(event.target.value)} placeholder="e.g. Sani Sport Boucherville" onKeyDown={event=>{if(event.key==="Enter")createVenue()}}/></label><button className="primary-btn" onClick={createVenue} disabled={!newVenueName.trim()}>+ Add location</button></section><section className="venue-list">{venues.length===0?<div className="venue-empty"><span>⌖</span><h2>No locations yet</h2><p>Add Chambly, Sani Sport Boucherville, ZAC Pickleball or any other place you use.</p></div>:venues.map(venue=><article key={venue.id}><div><span>⌖</span><strong>{venue.name}</strong></div><button className={venue.status==="Active"?"venue-active":"venue-inactive"} onClick={()=>toggleVenue(venue)}>{venue.status}</button></article>)}</section></section>}
    {page==="opponents"&&<section className="content opponents-content"><header className="players-header"><div><p className="eyebrow">OPPONENT DIRECTORY</p><h1>Opponents</h1><p>Save each city and team once. Its default strength will be suggested when creating a match.</p></div><button className="outline-btn" onClick={()=>setPage("matches")}>← Matches</button></header><section className={`opponent-create-card ${editingOpponent?"editing-opponent":""}`}><label>City<input value={opponentCity} onChange={event=>setOpponentCity(event.target.value)} placeholder="e.g. Boucherville"/></label><label>Team<input value={opponentTeam} onChange={event=>setOpponentTeam(event.target.value)} placeholder="e.g. Performance A"/></label><label>Default strength<select value={opponentDefaultStrength} onChange={event=>setOpponentDefaultStrength(event.target.value as "Weaker"|"Equal"|"Stronger")}><option>Weaker</option><option>Equal</option><option>Stronger</option></select></label><div className="opponent-form-actions">{editingOpponent&&<button className="ghost-btn" onClick={cancelOpponentEdit}>Cancel</button>}<button className="primary-btn" onClick={saveOpponent} disabled={!opponentCity.trim()||!opponentTeam.trim()}>{editingOpponent?"Save changes":"+ Add opponent"}</button></div></section><section className="opponent-list">{opponents.length===0?<div className="venue-empty"><span>◎</span><h2>No opponents yet</h2><p>Add a city, team and its usual strength. You can still override the strength for any match.</p></div>:opponents.map(item=><article key={item.id}><div className="opponent-name"><span>◎</span><div><strong>{item.teamName}</strong><small>{item.city}</small></div></div><span className={`strength-badge ${item.defaultStrength.toLowerCase()}`}>{item.defaultStrength}</span><button className={item.status==="Active"?"venue-active":"venue-inactive"} onClick={()=>toggleOpponent(item)}>{item.status}</button><div className="opponent-row-actions"><button onClick={()=>editOpponent(item)}>Edit</button><button className="remove-opponent" onClick={()=>removeOpponent(item)}>Remove</button></div></article>)}</section></section>}
    {page==="results"&&activeMatch?.lineup&&<section className="content results-content">
      <header className="results-header"><div><button className="back-btn" onClick={()=>setPage("matches")}>← Matches</button><p className="eyebrow">{activeMatch.matchDate} · {activeMatch.matchTime}</p><h1>Results vs {activeMatch.opponent}</h1><p>Mark one result for each pair. You can save and finish later.</p></div><div className="results-header-right"><button className="photo-import-btn" onClick={openPhotoImport}>▣ Import photo</button><div className="result-summary"><span><strong>{Object.keys(results).length}</strong>/24 entered</span><span className="wins"><strong>{Object.values(results).filter(value=>value==="W").length}</strong> wins</span><span className="losses"><strong>{Object.values(results).filter(value=>value==="L").length}</strong> losses</span></div></div></header>
      <div className="results-progress"><i style={{width:`${Object.keys(results).length/24*100}%`}}/></div>
      <section className="results-sheet-wrap"><div className="results-sheet">
        <div className="results-sheet-head"><span>ROUND</span>{[activeMatch.court1,activeMatch.court2,activeMatch.court3].map((court,index)=><span key={`${court}-${index}`}>COURT {court}</span>)}</div>
        {activeMatch.lineup.map(round=><div className="results-sheet-row" key={round.round}><div className="result-round"><strong>{round.round}</strong><small>{round.courts.filter((_,courtIndex)=>results[`${round.round}-${courtIndex+1}`]).length}/3 entered</small></div>{round.courts.map((pair,courtIndex)=>{const key=`${round.round}-${courtIndex+1}`;return <div className={mixedRequired.has(key)?"result-court-cell mixed-result-cell":"result-court-cell"} key={key}><div className="result-pair"><small>COURT {[activeMatch.court1,activeMatch.court2,activeMatch.court3][courtIndex]}{mixedRequired.has(key)?" · MIXED":""}</small><strong>{pair[0]}</strong><strong>{pair[1]}</strong></div><div className="result-buttons" aria-label={`Round ${round.round}, court ${courtIndex+1} result`}><button aria-label="Victory" className={results[key]==="W"?"win selected":""} onClick={()=>toggleDraftResult(key,"W")}>V</button><button aria-label="Defeat" className={results[key]==="L"?"loss selected":""} onClick={()=>toggleDraftResult(key,"L")}>D</button></div></div>})}</div>)}
      </div></section>
      <div className="results-footer"><div><strong>{Object.keys(results).length===24?"All results are complete":"Results can be saved at any time"}</strong><span>{Object.keys(results).length===24?"Saving will complete this match.":"Complete the remaining courts later."}</span></div><button className="primary-btn" onClick={saveResults}>{Object.keys(results).length===24?"Complete match →":"Save results"}</button></div>
      {showPhotoImport&&<div className="photo-modal-backdrop" onMouseDown={()=>setShowPhotoImport(false)}><section className="photo-import-modal" onMouseDown={event=>event.stopPropagation()}><header><div><p className="eyebrow">ASSISTED PHOTO IMPORT · SIMULATION</p><h2>Read V / D from the score sheet</h2><span>Pick a photo, review every suggestion, then apply it to this match.</span></div><button onClick={()=>setShowPhotoImport(false)}>×</button></header>{!photoPreview?<label className="photo-drop"><input type="file" accept="image/*" capture="environment" onChange={event=>selectResultPhoto(event.target.files?.[0])}/><b>＋</b><strong>Choose or take a photo</strong><span>JPG, PNG or phone camera</span></label>:<div className="photo-import-body"><aside><img src={photoPreview} alt="Uploaded score sheet"/><div><strong>{photoName}</strong><label>Change photo<input type="file" accept="image/*" onChange={event=>selectResultPhoto(event.target.files?.[0])}/></label></div></aside><main><div className="scan-summary"><div><strong>{scanAnalyzed?`${Object.values(scanResults).filter(cell=>cell.value).length}/24 read`:"Ready to analyze"}</strong><span>{scanAnalyzed?`${Object.values(scanResults).filter(cell=>!cell.value).length} need confirmation`:"The original photo is never changed."}</span></div><button className="primary-btn" onClick={simulatePhotoReading}>{scanAnalyzed?"Analyze again":"Simulate reading ✦"}</button></div>{scanAnalyzed&&<div className="scan-grid"><div className="scan-grid-head"><span>ROUND</span><span>COURT 1</span><span>COURT 2</span><span>COURT 3</span></div>{Array.from({length:8},(_,roundIndex)=><div className="scan-row" key={roundIndex}><strong>{roundIndex+1}</strong>{[0,1,2].map(courtIndex=>{const key=`${roundIndex+1}-${courtIndex+1}`,cell=scanResults[key];return <div className={`scan-cell ${cell?.confidence||"low"}`} key={key}><div><button className={cell?.value==="W"?"selected win":""} onClick={()=>setScanResults(current=>({...current,[key]:{value:"W",confidence:"high"}}))}>V</button><button className={cell?.value==="L"?"selected loss":""} onClick={()=>setScanResults(current=>({...current,[key]:{value:"L",confidence:"high"}}))}>D</button><button className={cell?.value===null?"selected unknown":""} onClick={()=>setScanResults(current=>({...current,[key]:{value:null,confidence:"low"}}))}>?</button></div><small>{cell?.confidence==="high"?"Clear":cell?.confidence==="medium"?"Check":"Unreadable"}</small></div>})}</div>)}</div>}</main></div>}<footer><span>{scanAnalyzed?"Green = clear · Amber = check · Red = unreadable":"Upload a score sheet to begin."}</span><button className="primary-btn" disabled={!scanAnalyzed} onClick={applyPhotoReading}>Apply confirmed results →</button></footer></section></div>}
    </section>}
    {page==="reports"&&<section className="content reports-content">
      <header className="reports-header"><div><p className="eyebrow">TEAM RESULTS</p><h1>Reports</h1><p>Results update automatically whenever a match is saved.</p></div><button className="outline-btn" onClick={()=>setPage("matches")}>View matches →</button></header>
      <div className="report-scope"><div><strong>Analysis period</strong><span>{reportScope==="current"?activeSeason?.name??"Current season":"Complete team history"}</span></div><div role="group" aria-label="Report analysis period"><button className={reportScope==="current"?"active":""} onClick={()=>setReportScope("current")}>Current season</button><button className={reportScope==="all"?"active":""} onClick={()=>setReportScope("all")}>All-time</button></div></div>
      <section className="report-summary"><article><span>RECORDED GAMES</span><strong>{report.played}</strong><small>{report.completed} completed match{report.completed===1?"":"es"}</small></article><article><span>WINS</span><strong className="report-win">{report.wins}</strong><small>{report.played?Math.round(report.wins/report.played*100):0}% win rate</small></article><article><span>LOSSES</span><strong className="report-loss">{report.losses}</strong><small>{report.played?Math.round(report.losses/report.played*100):0}% of games</small></article><article><span>ACTIVE PAIRS</span><strong>{report.ranking.length}</strong><small>with saved results</small></article></section>
      <section className="pair-ranking"><div className="pair-ranking-head"><div><h2>{reportEntity==="pairs"?"Pair ranking":"Player ranking"}</h2><p>{reportView==="real"?"Actual results, without adjustment.":"Adjusted for opponent strength and number of games."}</p></div><span>{reportScope==="current"?(activeSeason?.name??"CURRENT SEASON").toUpperCase():"ALL SEASONS"}</span></div>
        <div className="entity-tabs"><button className={reportEntity==="pairs"?"active":""} onClick={()=>setReportEntity("pairs")}>By pair</button><button className={reportEntity==="players"?"active":""} onClick={()=>setReportEntity("players")}>By player</button></div>
        <div className="ranking-tabs"><button className={reportView==="real"?"active":""} onClick={()=>{setReportView("real");if(reportSort==="score")setReportSort("rate")}}>Real ranking</button><button className={reportView==="adjusted"?"active":""} onClick={()=>{setReportView("adjusted");setReportSort("score");setReportSortDirection("desc")}}>Adjusted ranking</button><small>{reportView==="adjusted"?"The score starts at 50 and becomes more reliable as games are played.":"No weighting: wins ÷ games played"}</small></div>
        {reportView==="adjusted"&&<div className="score-legend"><div><span>0 · Avoid pairing</span><span>50 · Neutral</span><span>100 · Strong pairing</span></div><i/><p>The adjusted score is not a win percentage. It compares each result with the expected result for the opponent level and reduces distortion from very few games.</p></div>}
        {(reportEntity==="pairs"?report.ranking:report.playerRanking).length===0?<div className="empty-report"><span>↗</span><h3>No results yet</h3><p>Enter the first match results and this ranking will appear here automatically.</p><button className="primary-btn" onClick={()=>setPage("matches")}>Go to matches</button></div>:<div className={`ranking-table ${reportView==="adjusted"?"adjusted-table":""}`}><div className="ranking-row ranking-labels"><span>RANK</span><span>{reportEntity==="pairs"?"PAIR":"PLAYER"}</span><button onClick={()=>sortReport("played")}>PLAYED {reportSort==="played"?(reportSortDirection==="desc"?"↓":"↑"):"↕"}</button><button onClick={()=>sortReport("wins")}>W {reportSort==="wins"?(reportSortDirection==="desc"?"↓":"↑"):"↕"}</button><button onClick={()=>sortReport("losses")}>L {reportSort==="losses"?(reportSortDirection==="desc"?"↓":"↑"):"↕"}</button><button onClick={()=>sortReport("rate")}>WIN % {reportSort==="rate"?(reportSortDirection==="desc"?"↓":"↑"):"↕"}</button>{reportView==="adjusted"&&<button onClick={()=>sortReport("score")}>SCORE {reportSort==="score"?(reportSortDirection==="desc"?"↓":"↑"):"↕"}</button>}</div>{sortedReport.map((item,index)=>{const rate=Math.round(item.rate);const score=Math.round(item.score);const rowColor=`hsl(${score*1.2} 58% ${94-Math.abs(score-50)*.16}%)`;return <div className="ranking-row" style={reportView==="adjusted"?{background:rowColor}:undefined} key={item.players.join("|")}><span className="ranking-position">{index+1}</span><div className="ranking-pair"><span>{item.players.map(name=>name.slice(0,1)).join("")}</span><strong>{item.players.join(" + ")}</strong></div><span>{item.played}</span><span className="ranking-win">{item.wins}</span><span className="ranking-loss">{item.losses}</span><div className="ranking-rate"><strong>{rate}%</strong><i><b style={{width:`${rate}%`}}/></i></div>{reportView==="adjusted"&&<span className="ranking-score" title="Adjusted score from 0 to 100">{score}</span>}</div>})}</div>}
      </section>
    </section>}
    {page==="matches"&&<section className="content matches-content">
      <header className="players-header"><div><p className="eyebrow">MATCH SCHEDULE</p><h1>Matches</h1><p>Create a match, confirm availability and build the lineup.</p></div><button className="primary-btn" onClick={()=>openMatchForm()}>+ New match</button></header>
      {seasonMatches.length===0?<section className="empty-matches"><span>◇</span><h2>{activeSeason?"No matches in this season":"Create your first season"}</h2><p>{activeSeason?`Create the first match for ${activeSeason.name}.`:"Name your season before adding matches and results."}</p><button className="primary-btn" onClick={activeSeason?()=>openMatchForm():()=>setPage("seasons")}>{activeSeason?"Create first match":"Go to seasons"}</button></section>:
      <section className="matches-list">{seasonMatches.map(match=>{const flow=matchProgress(match);return <article className="match-card guided-match-card" key={match.id}><div className="match-date"><strong>{new Date(match.matchDate+"T12:00:00").toLocaleDateString(localeCode(locale),{day:"2-digit"})}</strong><span>{new Date(match.matchDate+"T12:00:00").toLocaleDateString(localeCode(locale),{month:"short"}).toUpperCase()}</span></div><div className="match-info"><p className="eyebrow">{match.status} · {match.matchTime} · {seasons.find(season=>season.id===match.seasonId)?.name}</p><h2>{teamName} <span>vs</span> {match.opponent}</h2><p>{match.location} · {match.opponentStrength} opponent</p><MatchJourney match={match} locale={locale}/></div><div className="match-actions"><span className={match.status==="Completed"?"completed-pill":match.lineup?.length===8?"saved-pill":match.playerIds.length===8?"ready-pill":"warning-pill"}>{match.status==="Completed"?"Completed":flow.resultCount?`${flow.resultCount}/24 results`:match.lineup?.length===8?"Lineup saved":`${match.playerIds.length}/8 players`}</span><button className="ghost-btn" onClick={()=>openMatchForm(match)}>Edit match</button>{match.lineup?.length===8&&<button className="ghost-btn" onClick={()=>openPrint(match)}>Print</button>}<button className="primary-btn" onClick={()=>continueMatch(match)}>{translateValue(flow.nextLabel,locale)} →</button></div></article>})}</section>}
      {showMatchForm&&<div className="modal-backdrop" onMouseDown={()=>{setShowMatchForm(false);setEditingMatch(null)}}><form className="player-modal match-modal" onSubmit={saveMatch} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">{teamName.toUpperCase()}</p><h2>{editingMatch?"Edit match":"Create match"}</h2></div><button type="button" onClick={()=>{setShowMatchForm(false);setEditingMatch(null)}}>×</button></div><div className="match-fields"><label>Opponent<select autoFocus required value={matchOpponent} onChange={event=>{const value=event.target.value;setMatchOpponent(value);const selectedOpponent=opponents.find(item=>opponentLabel(item)===value);if(selectedOpponent)setMatchStrength(selectedOpponent.defaultStrength)}}><option value="">Select an opponent</option>{matchOpponent&&!opponents.some(item=>opponentLabel(item)===matchOpponent)&&<option value={matchOpponent}>{matchOpponent}</option>}{opponents.filter(item=>item.status==="Active"||opponentLabel(item)===matchOpponent).map(item=><option key={item.id} value={opponentLabel(item)}>{item.city} — {item.teamName}</option>)}</select><button type="button" className="field-link" onClick={()=>{setShowMatchForm(false);setEditingMatch(null);setPage("opponents")}}>Manage opponents</button></label><label>Date<input required type="date" value={matchDate} onChange={e=>setMatchDate(e.target.value)}/></label><label>Time<input required type="time" value={matchTime} onChange={e=>setMatchTime(e.target.value)}/></label><label>Location<select required value={matchLocation} onChange={e=>setMatchLocation(e.target.value)}><option value="">Select a location</option>{venues.filter(venue=>venue.status==="Active"||venue.name===matchLocation).map(venue=><option key={venue.id} value={venue.name}>{venue.name}</option>)}</select><button type="button" className="field-link" onClick={()=>{setShowMatchForm(false);setEditingMatch(null);setPage("venues")}}>Manage locations</button></label></div><fieldset><legend>Home or visitor</legend><div className="gender-options"><button type="button" className={matchHomeAway==="Local"?"selected":""} onClick={()=>setMatchHomeAway("Local")}>Local</button><button type="button" className={matchHomeAway==="Visitor"?"selected":""} onClick={()=>setMatchHomeAway("Visitor")}>Visitor</button></div></fieldset><fieldset><legend>Court numbers</legend><div className="court-number-fields">{matchCourts.map((court,index)=><label key={index}>Court {index+1}<input required value={court} onChange={e=>setMatchCourts(current=>current.map((value,i)=>i===index?e.target.value:value))}/></label>)}</div></fieldset><fieldset><legend>Opponent strength for this match</legend><div className="gender-options">{(["Weaker","Equal","Stronger"] as const).map(value=><button type="button" key={value} className={matchStrength===value?"selected":""} onClick={()=>setMatchStrength(value)}>{value}</button>)}</div><p className="form-note">The saved default is suggested automatically, but you can override it for this match.</p></fieldset><fieldset><legend>Available players · {matchPlayers.length}/8 selected</legend>{editingMatch?.lineup?.length===8&&<p className="form-note">Changing selected players may require adjusting the saved lineup.</p>}<div className="match-player-picker">{activePlayers.map(player=><button type="button" key={player.id} className={matchPlayers.includes(player.id)?"selected":""} onClick={()=>setMatchPlayers(ids=>ids.includes(player.id)?ids.filter(id=>id!==player.id):ids.length<8?[...ids,player.id]:ids)}>{player.name}<span>{matchPlayers.includes(player.id)?"✓":"+"}</span></button>)}</div></fieldset><div className="modal-actions"><button type="button" className="ghost-btn" onClick={()=>{setShowMatchForm(false);setEditingMatch(null)}}>Cancel</button><button className="primary-btn" disabled={matchPlayers.length!==8||!matchLocation||!matchOpponent}>{editingMatch?"Save changes":"Create match"}</button></div></form></div>}
    </section>}
    {page==="players"&&<section className="content players-content"><header className="players-header"><div><p className="eyebrow">TEAM MANAGEMENT</p><h1>Teams & players</h1><p>Keep your roster ready for every match.</p></div><button className="primary-btn" onClick={()=>openForm()}>+ Add player</button></header>
      <section className="public-link-card"><div><p className="eyebrow">PUBLIC CALENDAR</p><h2>Share your upcoming matches</h2><p>Anyone can view this page. Only your Captain account can change the schedule.</p></div><a href={`/${publicSlug}`} target="_blank" rel="noreferrer">picklepilot.ca/{publicSlug} ↗</a></section>
      <section className="team-card"><div><span className="team-badge">{teamName.split(" ").map(word=>word[0]).join("").slice(0,2).toUpperCase()}</span><div><p className="eyebrow">YOUR TEAM</p><h2>{teamName}</h2><small>{activeSeason?.name??"No active season"}</small></div></div><div className="team-name-edit"><label>Captain<input aria-label="Captain name" value={captainNameDraft} onChange={event=>setCaptainNameDraft(event.target.value)}/></label><label>Team<input aria-label="Team name" value={teamNameDraft} onChange={event=>setTeamNameDraft(event.target.value)}/></label><button onClick={saveTeamName}>Save</button></div><div className="team-counts"><span><strong>{players.length}</strong>Total</span><span><strong>{activePlayers.length}</strong>Active</span><span><strong>{players.filter(p=>p.gender==="W"&&p.status==="Active").length}</strong>Women</span><span><strong>{players.filter(p=>p.gender==="M"&&p.status==="Active").length}</strong>Men</span></div></section>
      <section className="roster-panel"><div className="roster-heading"><div><h2>Player roster</h2><p>Active players are available in the Lineup Builder.</p></div><button className="ghost-btn" onClick={()=>setPage("builder")}>Open Lineup Builder →</button></div><div className="roster-table"><div className="roster-row roster-labels"><span>PLAYER</span><span>GENDER</span><span>STATUS</span><span>ACTIONS</span></div>{players.map(player=><div className="roster-row" key={player.id}><div className="roster-person"><span>{player.name.slice(0,2).toUpperCase()}</span><strong>{player.name}</strong></div><div className="roster-gender">{player.gender==="W"?"Women":"Men"}</div><button className={`status-toggle ${player.status.toLowerCase()}`} onClick={()=>toggleStatus(player)}><i/>{player.status}</button><div className="row-actions"><button onClick={()=>openForm(player)}>Edit</button><button className="delete-action" onClick={()=>removePlayer(player)}>Remove</button></div></div>)}</div></section>
      {showForm&&<div className="modal-backdrop" onMouseDown={()=>setShowForm(false)}><form className="player-modal" onSubmit={savePlayer} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">{teamName.toUpperCase()}</p><h2>{editingPlayer?"Edit player":"Add a player"}</h2></div><button type="button" onClick={()=>setShowForm(false)}>×</button></div><label>Player name<input autoFocus value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Full name"/></label><fieldset><legend>Division</legend><div className="gender-options"><button type="button" className={playerGender==="W"?"selected":""} onClick={()=>setPlayerGender("W")}>Women</button><button type="button" className={playerGender==="M"?"selected":""} onClick={()=>setPlayerGender("M")}>Men</button></div></fieldset><div className="modal-actions"><button type="button" className="ghost-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-btn">{editingPlayer?"Save changes":"Add player"}</button></div></form></div>}
    </section>}
    {notice&&<div className="toast">✓ {notice}</div>}<button className="logout-button" onClick={async()=>{setTeamLoading(true);resetTeamData();await fetch("/api/auth/logout",{method:"POST"});setAppUser(null)}}>Sign out · {appUser.username}</button>
  </main>;
}

function AuthScreen({setupRequired,onAuthenticated}:{setupRequired:boolean;onAuthenticated:(user:AppUser)=>void}){
  const [mode,setMode]=useState<"login"|"register">(setupRequired?"register":"login");const [username,setUsername]=useState("");const [password,setPassword]=useState("");const [team,setTeam]=useState("");const [captain,setCaptain]=useState("");const [publicCity,setPublicCity]=useState("");const [category,setCategory]=useState<"Performance"|"Development"|"Senior">("Performance");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{const endpoint=setupRequired?"/api/auth/setup":mode==="register"?"/api/auth/register":"/api/auth/login";const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password,teamName:team,captainName:captain,publicCity,category})});const result=await response.json().catch(()=>({error:"The server returned an unexpected response."})) as {user?:AppUser;error?:string};if(!response.ok||!result.user){setError(result.error??"Unable to continue");return}onAuthenticated(result.user)}catch{setError("The connection failed. Please try again.")}finally{setBusy(false)}}
  const creating=setupRequired||mode==="register";
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><img src={brandLogo} alt="PicklePilot"/><strong>PicklePilot</strong></div>{!setupRequired&&<div className="auth-tabs"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>Sign in</button><button className={mode==="register"?"active":""} onClick={()=>setMode("register")}>Create account</button></div>}<p className="eyebrow">{creating?"NEW CAPTAIN":"CAPTAIN ACCESS"}</p><h1>{creating?"Create your team":"Welcome back"}</h1><p>{creating?"Create your account now. No approval and no ChatGPT account are required.":"Enter your PicklePilot email and password."}</p><form onSubmit={submit}>{creating&&<><label>Captain name<input required value={captain} onChange={event=>setCaptain(event.target.value)} placeholder="Your full name"/></label><label>Team name<input required value={team} onChange={event=>setTeam(event.target.value)} placeholder="Example: Chambly A"/></label><label>Team level<select required value={category} onChange={event=>setCategory(event.target.value as "Performance"|"Development"|"Senior")}><option value="Performance">Performance</option><option value="Development">Development</option><option value="Senior">Senior</option></select></label><label>Public city<input required value={publicCity} onChange={event=>setPublicCity(event.target.value)} placeholder="Example: St-Jean"/><small>Your public link will use this city, for example picklepilot.ca/st-jean.</small></label></>}<label>Email<input required type="email" autoComplete="username" value={username} onChange={event=>setUsername(event.target.value)}/></label><label>Password<input required minLength={8} type="password" autoComplete={creating?"new-password":"current-password"} value={password} onChange={event=>setPassword(event.target.value)}/></label>{error&&<div className="auth-error">{error}</div>}<button className="primary-btn" disabled={busy}>{busy?"Please wait…":creating?"Create account and team":"Sign in"}</button></form></section></main>
}

function LineupTable({lineup,courtLabels,results,onResult,editing,selected,onSwap}:{lineup:Round[];courtLabels?:string[];results?:Record<string,"W"|"L">;onResult?:(key:string,value:"W"|"L")=>void;editing:boolean;selected:{round:number;index:number}|null;onSwap:(round:number,index:number)=>void}){
  const courts=[courtLabels?.[0]||"1",courtLabels?.[1]||"2",courtLabels?.[2]||"3"];
  return <>
    <div className="table-wrap full-lineup desktop-lineup"><table><thead><tr><th>ROUND</th>{courts.map((court,index)=><th key={`${court}-${index}`}>COURT {court}</th>)}<th>REST</th></tr></thead><tbody>{lineup.map((row,rowIndex)=><tr key={row.round}><td><span className="round-number">{row.round}</span></td>{row.courts.map((pair,courtIndex)=><td key={courtIndex} className={mixedRequired.has(`${row.round}-${courtIndex+1}`)?"mixed-cell":""}><div className="pair">{pair.map((name,playerIndex)=>{const index=courtIndex*2+playerIndex;return <button key={`${name}-${index}`} onClick={()=>onSwap(rowIndex,index)} className={editing?(selected?.round===rowIndex&&selected.index===index?"chip selected-chip":"chip editable"):"chip"}>{name}</button>})}</div>{mixedRequired.has(`${row.round}-${courtIndex+1}`)&&<small className="mixed-label">MIXED</small>}</td>)}<td className="rest-cell"><div className="pair">{row.rest.map((name,playerIndex)=>{const index=6+playerIndex;return <button key={`${name}-${index}`} onClick={()=>onSwap(rowIndex,index)} className={editing?(selected?.round===rowIndex&&selected.index===index?"chip selected-chip":"chip editable"):"chip"}>{name}</button>})}</div></td></tr>)}</tbody></table></div>
    <div className={`mobile-lineup ${onResult?"quick-results-lineup":""}`}>{lineup.map((row,rowIndex)=><article key={row.round}><header><strong>Round {row.round}</strong></header>{row.courts.map((pair,courtIndex)=>{const key=`${row.round}-${courtIndex+1}`;return <div className={mixedRequired.has(key)?"mobile-court mixed-mobile-court":"mobile-court"} key={courtIndex}><small>Court {courts[courtIndex]}{mixedRequired.has(key)?" · MIXED":""}</small><div className="mobile-court-detail"><div className="mobile-pair">{pair.map((name,playerIndex)=>{const index=courtIndex*2+playerIndex;return <button key={`${name}-${index}`} onClick={()=>onSwap(rowIndex,index)} className={editing?(selected?.round===rowIndex&&selected.index===index?"selected":"editable"):""}>{name}</button>})}</div>{onResult&&<div className="quick-result-buttons" aria-label={`Round ${row.round}, court ${courts[courtIndex]} result`}><button aria-label="Victory" className={results?.[key]==="W"?"win selected":"win"} onClick={()=>onResult(key,"W")}>V</button><button aria-label="Defeat" className={results?.[key]==="L"?"loss selected":"loss"} onClick={()=>onResult(key,"L")}>D</button></div>}</div></div>})}<div className="mobile-rest"><small>REST</small><strong>{row.rest.join(" + ")}</strong></div></article>)}</div>
  </>
}

function PrintLineup({match,players,teamName,category,locale,onBack}:{match:Match;players:Player[];teamName:string;category:"Performance"|"Development";locale:Locale;onBack:()=>void}){
  const courts=[match.court1||"1",match.court2||"2",match.court3||"3"];
  const warmup=match.warmupMinutes??10, duration=match.roundMinutes??12, pause=match.breakMinutes??2;
  const toMinutes=(time:string)=>{const [hour,minute]=time.split(":").map(Number);return hour*60+minute};
  const format=(minutes:number)=>`${String(Math.floor(minutes/60)%24).padStart(2,"0")} h ${String(minutes%60).padStart(2,"0")}`;
  const start=toMinutes(match.matchTime);
  const date=new Date(match.matchDate+"T12:00:00").toLocaleDateString(localeCode(locale),{day:"2-digit",month:"long",year:"numeric"});
  const total=warmup+match.lineup!.length*duration+(match.lineup!.length-1)*pause;
  const women=new Set(players.filter(player=>player.gender==="W").map(player=>player.name));
  return <section className="print-page"><div className="print-controls"><button className="ghost-btn" onClick={onBack}>← Matchs</button><button className="primary-btn" onClick={()=>window.print()}>Imprimer / Enregistrer en PDF</button></div><div className="score-sheet">
    <div className="score-meta"><div className="score-date"><b>Date :</b><strong>{date}</strong></div><div className="score-team"><span><b>Local ou visiteur</b><strong>{(match.homeAway||"Local").toUpperCase()}</strong></span><span><b>Catégorie / équipe / lieu</b><strong>{category} · {teamName} | {match.location}</strong></span></div><div className="score-start"><span><b>Heure début du match :</b><strong>{match.matchTime}</strong></span><span><b>Terrain début séq. :</b><strong>{courts[0]}</strong></span></div></div>
    <table className="score-table"><colgroup><col className="round-col"/><col className="time-col"/><col/><col/><col/></colgroup><thead><tr><th rowSpan={2}>MANCHE</th><th rowSpan={2}>HEURES</th>{courts.map(court=><th className="court-title" key={court}>TERRAIN {court}</th>)}</tr><tr>{courts.map(court=><th className="side-title" key={court}>{(match.homeAway||"Local").toUpperCase()}</th>)}</tr></thead><tbody>
      <tr className="warmup-row"><td/><td>{format(start)} <i>–</i> {format(start+warmup)}</td>{courts.map(court=><td key={court}>Échauffement</td>)}</tr>
      {match.lineup!.map((round,rowIndex)=>{const roundStart=start+warmup+rowIndex*(duration+pause);return <>{<tr className="score-round-row" key={`round-${round.round}`}><th>{round.round}</th><td>{format(roundStart)} <i>–</i> {format(roundStart+duration)}</td>{round.courts.map((pair,courtIndex)=>{const mixed=mixedRequired.has(`${round.round}-${courtIndex+1}`);const printed=mixed?[...pair].sort((a,b)=>Number(women.has(b))-Number(women.has(a))):pair;return <td className="score-pair" key={courtIndex}><span className={mixed?"mixed-name":""}>{printed[0]}</span><span>{printed[1]}</span></td>})}</tr>}{rowIndex<match.lineup!.length-1&&<tr className="score-break-row" key={`break-${round.round}`}><td/><td>{pause} min.</td>{courts.map(court=><td key={court}/>)}</tr>}</>})}
      <tr className="score-total-row"><td/><td><b>Total:</b> {Math.floor(total/60)} h {String(total%60).padStart(2,"0")}</td><td colSpan={3}>Cases roses réservées aux joueuses féminines</td></tr>
    </tbody></table>
  </div></section>
}
