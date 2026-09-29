"use client";

import { useEffect, useState } from "react";

type PublicMatch={id:number;opponent:string;matchDate:string;matchTime:string;location:string;homeAway:"Local"|"Visitor";court1:string;court2:string;court3:string};
type Calendar={team:{teamName:string;publicSlug:string};matches:PublicMatch[]};
type Locale="fr"|"en";

const copy={
  fr:{brand:"PICKLEPILOT · CALENDRIER PUBLIC",loading:"Chargement du calendrier…",missingTitle:"Calendrier introuvable",missingText:"Ce calendrier public n’existe pas ou n’est plus disponible.",upcoming:"Matchs à venir",empty:"Aucun match à venir n’est prévu.",home:"Domicile",away:"Visiteurs",courts:"Terrains",footer:"Propulsé par PicklePilot"},
  en:{brand:"PICKLEPILOT · PUBLIC CALENDAR",loading:"Loading calendar…",missingTitle:"Calendar not found",missingText:"This public calendar does not exist or is no longer available.",upcoming:"Upcoming matches",empty:"No upcoming matches are scheduled yet.",home:"Home",away:"Away",courts:"Courts",footer:"Powered by PicklePilot"},
} as const;

export default function PublicCalendar(){
  const [calendar,setCalendar]=useState<Calendar|null>(null),[missing,setMissing]=useState(false),[locale,setLocale]=useState<Locale>("fr");
  const text=copy[locale];
  useEffect(()=>{
    const slug=window.location.pathname.split("/").filter(Boolean).at(-1);
    if(!slug){setMissing(true);return}
    fetch(`/api/public/${encodeURIComponent(slug)}`)
      .then(async response=>{if(response.status===404){setMissing(true);return}if(!response.ok)throw new Error();setCalendar(await response.json() as Calendar)})
      .catch(()=>setMissing(true));
  },[]);
  const languageSwitch=<div className="public-language" aria-label="Language"><button className={locale==="fr"?"active":""} onClick={()=>setLocale("fr")}>FR</button><button className={locale==="en"?"active":""} onClick={()=>setLocale("en")}>EN</button></div>;
  if(missing)return <main className="public-calendar"><div className="public-card">{languageSwitch}<p className="public-brand">PICKLEPILOT</p><h1>{text.missingTitle}</h1><p>{text.missingText}</p></div></main>;
  if(!calendar)return <main className="public-calendar"><div className="public-card">{languageSwitch}<p className="public-brand">PICKLEPILOT</p><p>{text.loading}</p></div></main>;
  return <main className="public-calendar"><section className="public-card">{languageSwitch}<p className="public-brand">{text.brand}</p><h1>{calendar.team.teamName}</h1><p className="public-intro">{text.upcoming}</p>{calendar.matches.length===0?<div className="public-empty">{text.empty}</div>:<div className="public-match-list">{calendar.matches.map(match=><article className="public-match" key={match.id}><time dateTime={`${match.matchDate}T${match.matchTime}`}>{new Date(`${match.matchDate}T12:00:00`).toLocaleDateString(locale==="fr"?"fr-CA":"en-CA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}<strong>{match.matchTime}</strong></time><div><h2>{calendar.team.teamName} <span>vs</span> {match.opponent}</h2><p>{match.homeAway==="Local"?text.home:text.away} · {match.location} · {text.courts} {match.court1}, {match.court2}, {match.court3}</p></div></article>)}</div>}<footer>{text.footer}</footer></section></main>;
}
