"use client";

import { useMemo, useState } from "react";

type Player = { name: string; gender: "W" | "M" };
type Round = { round: number; courts: string[][]; rest: string[] };

const players: Player[] = [
  { name: "Emma", gender: "W" }, { name: "Olivia", gender: "W" },
  { name: "Mia", gender: "W" }, { name: "Sophie", gender: "W" },
  { name: "Noah", gender: "M" }, { name: "Liam", gender: "M" },
  { name: "Ethan", gender: "M" }, { name: "Lucas", gender: "M" },
];

const generatedLineup: Round[] = [
  { round: 1, courts: [["Olivia","Mia"],["Sophie","Liam"],["Ethan","Lucas"]], rest: ["Emma","Noah"] },
  { round: 2, courts: [["Sophie","Noah"],["Emma","Mia"],["Ethan","Lucas"]], rest: ["Olivia","Liam"] },
  { round: 3, courts: [["Emma","Olivia"],["Liam","Lucas"],["Sophie","Noah"]], rest: ["Mia","Ethan"] },
  { round: 4, courts: [["Emma","Olivia"],["Mia","Noah"],["Liam","Ethan"]], rest: ["Sophie","Lucas"] },
  { round: 5, courts: [["Sophie","Ethan"],["Olivia","Mia"],["Noah","Lucas"]], rest: ["Emma","Liam"] },
  { round: 6, courts: [["Emma","Mia"],["Sophie","Liam"],["Noah","Lucas"]], rest: ["Olivia","Ethan"] },
  { round: 7, courts: [["Emma","Sophie"],["Liam","Ethan"],["Olivia","Noah"]], rest: ["Mia","Lucas"] },
  { round: 8, courts: [["Emma","Liam"],["Olivia","Ethan"],["Mia","Lucas"]], rest: ["Sophie","Noah"] },
];

const mixedRequired = new Set(["2-1","3-3","5-1","7-3"]);

function Sidebar({ builder, onNavigate }: { builder: boolean; onNavigate: (value: boolean) => void }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">P</span><span>PicklePilot</span></div>
    <nav aria-label="Main navigation">
      <button className={`nav-item ${!builder ? "active" : ""}`} onClick={() => onNavigate(false)}>⌁ <span>Dashboard</span></button>
      <button className={`nav-item ${builder ? "active" : ""}`} onClick={() => onNavigate(true)}>▦ <span>Lineup builder</span></button>
      <button className="nav-item">◇ <span>Matches</span></button>
      <button className="nav-item">♙ <span>Players</span></button>
      <button className="nav-item">↗ <span>Reports</span></button>
    </nav>
    <div className="sidebar-footer"><div className="avatar">JS</div><div><strong>Juliana Sellmer</strong><small>Team captain</small></div></div>
  </aside>;
}

export default function Home() {
  const [builder, setBuilder] = useState(false);
  const [lineup, setLineup] = useState<Round[]>(generatedLineup);
  const [available, setAvailable] = useState(players.map(p => p.name));
  const [opponent, setOpponent] = useState("Stronger");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<{ round: number; index: number } | null>(null);
  const [notice, setNotice] = useState("");

  const validation = useMemo(() => {
    const restCount: Record<string, number> = Object.fromEntries(players.map(p => [p.name, 0]));
    const partnerCount: Record<string, number> = {};
    const issues: string[] = [];
    lineup.forEach((row, rowIndex) => {
      row.rest.forEach(name => restCount[name]++);
      if (rowIndex && row.rest.some(name => lineup[rowIndex - 1].rest.includes(name))) issues.push(`Round ${row.round}: back-to-back rest`);
      row.courts.forEach((pair, courtIndex) => {
        const key = [...pair].sort().join("|");
        partnerCount[key] = (partnerCount[key] || 0) + 1;
        if (mixedRequired.has(`${row.round}-${courtIndex + 1}`)) {
          const genders = pair.map(name => players.find(p => p.name === name)?.gender);
          if (genders[0] === genders[1]) issues.push(`Round ${row.round}, court ${courtIndex + 1}: mixed doubles required`);
        }
      });
    });
    Object.entries(restCount).forEach(([name, count]) => { if (count !== 2) issues.push(`${name} rests ${count} times`); });
    Object.entries(partnerCount).forEach(([pair, count]) => { if (count > 3) issues.push(`${pair.replace("|", " + ")} play together ${count} times`); });
    return { issues: [...new Set(issues)], restCount };
  }, [lineup]);

  function generate() {
    setLineup(structuredClone(generatedLineup));
    setEditing(false); setSelected(null);
    setNotice(`Lineup generated for a ${opponent.toLowerCase()} opponent.`);
    setTimeout(() => setNotice(""), 2600);
  }

  function toggleAvailability(name: string) {
    setAvailable(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  }

  function swapPlayer(roundIndex: number, position: number) {
    if (!editing) return;
    if (!selected) { setSelected({ round: roundIndex, index: position }); return; }
    if (selected.round !== roundIndex) { setSelected({ round: roundIndex, index: position }); return; }
    const next = structuredClone(lineup);
    const flatten = (row: Round) => [...row.courts.flat(), ...row.rest];
    const values = flatten(next[roundIndex]);
    [values[selected.index], values[position]] = [values[position], values[selected.index]];
    next[roundIndex].courts = [[values[0],values[1]],[values[2],values[3]],[values[4],values[5]]];
    next[roundIndex].rest = [values[6],values[7]];
    setLineup(next); setSelected(null);
  }

  return <main className="app-shell">
    <Sidebar builder={builder} onNavigate={setBuilder} />
    {!builder ? <section className="content">
      <header className="topbar"><div><p className="eyebrow">SUMMER 2026 · PERFORMANCE</p><h1>Good afternoon, Juliana</h1></div><button className="outline-btn">Chambly A <span>⌄</span></button></header>
      <section className="hero-card">
        <div className="hero-copy"><span className="status">UPCOMING MATCH</span><h2>Chambly A <span>vs</span> Boucherville</h2><p>Wednesday, August 19 · 7:00 PM · Chambly Pickleball Club</p></div>
        <div className="hero-actions"><div className="readiness"><strong>{available.length}/8</strong><span>players available</span></div><button className="primary-btn" onClick={() => setBuilder(true)}>Build lineup <span>→</span></button></div>
      </section>
      <section className="stats-grid" aria-label="Team performance">
        <article><span>SEASON RECORD</span><strong>6–2</strong><small>2nd of 8 teams</small></article>
        <article><span>WIN RATE</span><strong>68%</strong><small className="positive">↑ 4% this month</small></article>
        <article><span>TOP PAIR</span><strong className="pair-name">Emma + Olivia</strong><small>9 wins · 75%</small></article>
        <article><span>NEXT OPPONENT</span><strong className="pair-name">{opponent}</strong><small>7–1 season record</small></article>
      </section>
      <section className="lineup-section">
        <div className="section-heading"><div><p className="eyebrow">AI SUGGESTION</p><h2>Recommended lineup</h2><p>Balanced for pair history, opponent strength and required mixed doubles.</p></div><div className="section-actions"><button className="ghost-btn" onClick={() => setBuilder(true)}>Edit manually</button><button className="primary-btn" onClick={() => setBuilder(true)}>Generate lineup ✦</button></div></div>
        <LineupTable lineup={lineup.slice(0,4)} editing={false} selected={null} onSwap={() => {}} />
        <button className="table-link" onClick={() => setBuilder(true)}>View complete lineup →</button>
      </section>
    </section> : <section className="content builder-content">
      <header className="builder-header"><div><button className="back-btn" onClick={() => setBuilder(false)}>← Dashboard</button><p className="eyebrow">WEDNESDAY, AUGUST 19</p><h1>Build lineup vs Boucherville</h1><p>Choose your roster, set the opponent strength, then generate a rule-compliant lineup.</p></div><button className="outline-btn">Save draft</button></header>
      <section className="setup-grid">
        <article className="setup-card roster-card"><div className="card-title"><div><span>1</span><div><h2>Available players</h2><p>Select exactly 8 players for this match.</p></div></div><strong className={available.length === 8 ? "ready-pill" : "warning-pill"}>{available.length}/8 selected</strong></div>
          <div className="player-grid">{players.map(player => <button key={player.name} className={available.includes(player.name) ? "player active" : "player"} onClick={() => toggleAvailability(player.name)}><span>{player.name.slice(0,2).toUpperCase()}</span><div><strong>{player.name}</strong><small>{player.gender === "W" ? "Women" : "Men"}</small></div><b>{available.includes(player.name) ? "✓" : "+"}</b></button>)}</div>
        </article>
        <article className="setup-card opponent-card"><div className="card-title"><div><span>2</span><div><h2>Opponent strength</h2><p>Helps prioritize the strongest combinations.</p></div></div></div>
          <div className="strength-options">{["Weaker","Equal","Stronger"].map(value => <button key={value} onClick={() => setOpponent(value)} className={opponent === value ? "selected" : ""}><span>{value === "Weaker" ? "↓" : value === "Equal" ? "≈" : "↑"}</span><strong>{value}</strong></button>)}</div>
          <button className="generate-main" disabled={available.length !== 8} onClick={generate}>Generate lineup <span>✦</span></button>
        </article>
      </section>
      <section className="builder-lineup">
        <div className="builder-lineup-head"><div><p className="eyebrow">8 ROUNDS · 3 COURTS</p><h2>Your lineup</h2><p>Click two players in the same round to swap them while editing.</p></div><div className="section-actions"><button className={editing ? "edit-active" : "ghost-btn"} onClick={() => { setEditing(!editing); setSelected(null); }}>{editing ? "Finish editing" : "Edit lineup"}</button><button className="primary-btn" onClick={generate}>Recalculate ✦</button></div></div>
        <div className={validation.issues.length ? "validation warning" : "validation success"}><strong>{validation.issues.length ? `${validation.issues.length} rule warning${validation.issues.length > 1 ? "s" : ""}` : "All lineup rules passed"}</strong><span>{validation.issues.length ? validation.issues.slice(0,2).join(" · ") : "Each player rests twice · No back-to-back rests · Required mixed doubles included · Partner limit respected"}</span></div>
        <LineupTable lineup={lineup} editing={editing} selected={selected} onSwap={swapPlayer} />
        <div className="builder-footer"><span>Changes are checked automatically against competition rules.</span><button className="primary-btn" onClick={() => setNotice("Lineup saved successfully.")}>Save lineup →</button></div>
      </section>
      {notice && <div className="toast">✓ {notice}</div>}
    </section>}
  </main>;
}

function LineupTable({ lineup, editing, selected, onSwap }: { lineup: Round[]; editing: boolean; selected: { round: number; index: number } | null; onSwap: (round: number, index: number) => void }) {
  return <div className="table-wrap full-lineup"><table><thead><tr><th>ROUND</th><th>COURT 1</th><th>COURT 2</th><th>COURT 3</th><th>REST</th></tr></thead><tbody>
    {lineup.map((row, rowIndex) => <tr key={row.round}><td><span className="round-number">{row.round}</span></td>
      {row.courts.map((pair, courtIndex) => <td key={courtIndex} className={mixedRequired.has(`${row.round}-${courtIndex + 1}`) ? "mixed-cell" : ""}><div className="pair">{pair.map((name, playerIndex) => { const index = courtIndex * 2 + playerIndex; return <button key={name} onClick={() => onSwap(rowIndex,index)} className={editing ? (selected?.round === rowIndex && selected.index === index ? "chip selected-chip" : "chip editable") : "chip"}>{name}</button>; })}</div>{mixedRequired.has(`${row.round}-${courtIndex + 1}`) && <small className="mixed-label">MIXED</small>}</td>)}
      <td className="rest-cell"><div className="pair">{row.rest.map((name, playerIndex) => { const index = 6 + playerIndex; return <button key={name} onClick={() => onSwap(rowIndex,index)} className={editing ? (selected?.round === rowIndex && selected.index === index ? "chip selected-chip" : "chip editable") : "chip"}>{name}</button>; })}</div></td></tr>)}
  </tbody></table></div>;
}
