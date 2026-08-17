const rounds = [
  { number: 1, court1: "Emma · Olivia", court2: "Mia · Sophie", court3: "Ava · Chloe", rest: "Lily · Zoey" },
  { number: 2, court1: "Emma · Noah", court2: "Olivia · Ava", court3: "Mia · Lily", rest: "Sophie · Chloe" },
  { number: 3, court1: "Sophie · Zoey", court2: "Emma · Chloe", court3: "Olivia · Noah", rest: "Mia · Ava" },
  { number: 4, court1: "Mia · Chloe", court2: "Ava · Lily", court3: "Sophie · Noah", rest: "Emma · Zoey" },
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>PicklePilot</span></div>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#">⌁ <span>Dashboard</span></a>
          <a className="nav-item" href="#lineup">▦ <span>Lineup builder</span></a>
          <a className="nav-item" href="#">◇ <span>Matches</span></a>
          <a className="nav-item" href="#">♙ <span>Players</span></a>
          <a className="nav-item" href="#">↗ <span>Reports</span></a>
        </nav>
        <div className="sidebar-footer"><div className="avatar">JS</div><div><strong>Juliana Sellmer</strong><small>Team captain</small></div></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><p className="eyebrow">SUMMER 2026 · PERFORMANCE</p><h1>Good afternoon, Juliana</h1></div>
          <button className="outline-btn">Chambly A <span>⌄</span></button>
        </header>

        <section className="hero-card">
          <div className="hero-copy"><span className="status">UPCOMING MATCH</span><h2>Chambly A <span>vs</span> Boucherville</h2><p>Wednesday, August 19 · 7:00 PM · Chambly Pickleball Club</p></div>
          <div className="hero-actions"><div className="readiness"><strong>8/8</strong><span>players available</span></div><button className="primary-btn">Build lineup <span>→</span></button></div>
        </section>

        <section className="stats-grid" aria-label="Team performance">
          <article><span>SEASON RECORD</span><strong>6–2</strong><small>2nd of 8 teams</small></article>
          <article><span>WIN RATE</span><strong>68%</strong><small className="positive">↑ 4% this month</small></article>
          <article><span>TOP PAIR</span><strong className="pair-name">Emma + Olivia</strong><small>9 wins · 75%</small></article>
          <article><span>NEXT OPPONENT</span><strong className="pair-name">Stronger</strong><small>7–1 season record</small></article>
        </section>

        <section className="lineup-section" id="lineup">
          <div className="section-heading"><div><p className="eyebrow">AI SUGGESTION</p><h2>Recommended lineup</h2><p>Balanced for pair history, opponent strength and required mixed doubles.</p></div><div className="section-actions"><button className="ghost-btn">Edit manually</button><button className="primary-btn">Generate lineup ✦</button></div></div>
          <div className="table-wrap">
            <table><thead><tr><th>ROUND</th><th>COURT 1</th><th>COURT 2</th><th>COURT 3</th><th>REST</th></tr></thead>
              <tbody>{rounds.map((round) => <tr key={round.number}><td><span className="round-number">{round.number}</span></td><td>{round.court1}</td><td>{round.court2}</td><td>{round.court3}</td><td className="rest-cell">{round.rest}</td></tr>)}</tbody>
            </table>
            <div className="table-footer"><span>Showing rounds 1–4 of 8</span><button>View complete lineup →</button></div>
          </div>
        </section>
      </section>
    </main>
  );
}
