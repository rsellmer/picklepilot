"use client";

import { useEffect, useState } from "react";

type PublicMatch={id:number;opponent:string;matchDate:string;matchTime:string;location:string;homeAway:"Local"|"Visitor";court1:string;court2:string;court3:string};
type Calendar={team:{teamName:string;publicSlug:string};matches:PublicMatch[]};

export default function PublicCalendar(){
  const [calendar,setCalendar]=useState<Calendar|null>(null),[missing,setMissing]=useState(false);
  useEffect(()=>{
    const slug=window.location.pathname.split("/").filter(Boolean).at(-1);
    if(!slug){setMissing(true);return}
    fetch(`/api/public/${encodeURIComponent(slug)}`)
      .then(async response=>{if(response.status===404){setMissing(true);return}if(!response.ok)throw new Error();setCalendar(await response.json() as Calendar)})
      .catch(()=>setMissing(true));
  },[]);
  if(missing)return <main className="public-calendar"><div className="public-card"><p className="public-brand">PICKLEPILOT</p><h1>Calendar not found</h1><p>This public calendar does not exist or is no longer available.</p></div></main>;
  if(!calendar)return <main className="public-calendar"><div className="public-card"><p className="public-brand">PICKLEPILOT</p><p>Loading calendar…</p></div></main>;
  return <main className="public-calendar"><section className="public-card"><p className="public-brand">PICKLEPILOT · PUBLIC CALENDAR</p><h1>{calendar.team.teamName}</h1><p className="public-intro">Upcoming matches</p>{calendar.matches.length===0?<div className="public-empty">No upcoming matches are scheduled yet.</div>:<div className="public-match-list">{calendar.matches.map(match=><article className="public-match" key={match.id}><time dateTime={`${match.matchDate}T${match.matchTime}`}>{new Date(`${match.matchDate}T12:00:00`).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}<strong>{match.matchTime}</strong></time><div><h2>{calendar.team.teamName} <span>vs</span> {match.opponent}</h2><p>{match.homeAway} · {match.location} · Courts {match.court1}, {match.court2}, {match.court3}</p></div></article>)}</div>}<footer>Powered by PicklePilot</footer></section></main>;
}
