"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import {
  LanguageSelector,
  Locale,
  localeCode,
  localizeDivision,
  useDomLocalization,
} from "./i18n";

type Gender = "W" | "M";
type Player = {
  id: number;
  name: string;
  gender: Gender;
  status: "Active" | "Inactive";
};
type Round = { round: number; courts: string[][]; rest: string[] };
type Match = {
  id: number;
  opponent: string;
  matchDate: string;
  matchTime: string;
  location: string;
  opponentStrength: "Weaker" | "Equal" | "Stronger";
  homeAway: "Local" | "Visitor";
  court1: string;
  court2: string;
  court3: string;
  warmupMinutes: number;
  roundMinutes: number;
  breakMinutes: number;
  playerIds: number[];
  lineup?: Round[] | null;
  results?: Record<string, "W" | "L">;
  status: "Upcoming" | "Completed";
  seasonId: number;
};
type Season = {
  id: number;
  teamId: number;
  name: string;
  status: "Active" | "Closed";
  createdAt: string;
  closedAt?: string | null;
};
type Venue = {
  id: number;
  teamId: number;
  name: string;
  status: "Active" | "Inactive";
  createdAt: string;
};
type Opponent = {
  id: number;
  teamId: number;
  city: string;
  teamName: string;
  defaultStrength: "Weaker" | "Equal" | "Stronger";
  status: "Active" | "Inactive";
  createdAt: string;
};
type Page =
  | "dashboard"
  | "builder"
  | "players"
  | "matches"
  | "results"
  | "reports"
  | "rules"
  | "seasons"
  | "venues"
  | "opponents"
  | "leagueAdmin"
  | "leagueTeams"
  | "leagueLocations"
  | "leagueSchedule"
  | "leagueStandings"
  | "leagueReports"
  | "print";
type ReportSort = "played" | "wins" | "losses" | "rate" | "score";
type RuleSettings = {
  avoidConsecutivePartners: boolean;
  preferMaxTwo: boolean;
  blockAboveThree: boolean;
  avoidBackToBackRest: boolean;
  avoidLongStreaks: boolean;
};
type PlayerRule = {
  id: number;
  playerAId: number;
  playerBId: number;
  ruleType: "Avoid" | "Required";
  minimumGames: number;
};
type AppUser = {
  id: number;
  username: string;
  role: "LeagueAdmin" | "Captain" | "Admin" | "User";
  teamId: number;
  preferredLanguage?: Locale;
  mustChangePassword?: boolean;
};
type ScanCell = {
  value: "W" | "L" | null;
  confidence: "high" | "medium" | "low";
};
type AssignedLeagueMatch = {
  id: number;
  matchDate: string;
  matchTime: string;
  homeTeamId: number;
  visitorTeamId: number;
  homeTeamName: string;
  visitorTeamName: string;
  venueName: string;
  courts: string[];
  homeWins: number | null;
  visitorWins: number | null;
  resultOutcome: "Home" | "Visitor" | "Tie" | null;
  status: string;
  rescheduleComment?: string | null;
};
type CaptainInterclubContext = {
  teamId: number;
  teamName: string;
  divisionName: string;
  seasonName: string;
};

const starterPlayers: Player[] = [
  { id: 1, name: "Emma", gender: "W", status: "Active" },
  { id: 2, name: "Olivia", gender: "W", status: "Active" },
  { id: 3, name: "Mia", gender: "W", status: "Active" },
  { id: 4, name: "Sophie", gender: "W", status: "Active" },
  { id: 5, name: "Noah", gender: "M", status: "Active" },
  { id: 6, name: "Liam", gender: "M", status: "Active" },
  { id: 7, name: "Ethan", gender: "M", status: "Active" },
  { id: 8, name: "Lucas", gender: "M", status: "Active" },
];
const template = [
  [
    [1, 2],
    [3, 5],
    [6, 7],
    [0, 4],
  ],
  [
    [3, 6],
    [0, 2],
    [4, 7],
    [1, 5],
  ],
  [
    [0, 1],
    [5, 7],
    [3, 4],
    [2, 6],
  ],
  [
    [0, 2],
    [1, 4],
    [5, 6],
    [3, 7],
  ],
  [
    [3, 6],
    [1, 2],
    [4, 7],
    [0, 5],
  ],
  [
    [0, 3],
    [2, 4],
    [5, 7],
    [1, 6],
  ],
  [
    [0, 1],
    [5, 6],
    [3, 4],
    [2, 7],
  ],
  [
    [0, 5],
    [1, 6],
    [2, 7],
    [3, 4],
  ],
];
const mixedRequired = new Set(["2-1", "3-3", "5-1", "7-3"]);
function buildLineup(
  roster: Player[],
  history: Match[],
  playerRules: PlayerRule[],
  rules: RuleSettings,
): Round[] {
  if (
    roster.length !== 8 ||
    !roster.some((player) => player.gender === "W") ||
    !roster.some((player) => player.gender === "M")
  )
    return [];
  const historyStats = new Map<
    string,
    { played: number; performance: number }
  >();
  history.forEach((match) =>
    match.lineup?.forEach((round) =>
      round.courts.forEach((pair, courtIndex) => {
        const result = match.results?.[`${round.round}-${courtIndex + 1}`];
        if (!result) return;
        const key = [...pair].sort().join("|");
        const expected =
          match.opponentStrength === "Stronger"
            ? 0.35
            : match.opponentStrength === "Weaker"
              ? 0.65
              : 0.5;
        const stat = historyStats.get(key) ?? { played: 0, performance: 0 };
        stat.played++;
        stat.performance += (result === "W" ? 1 : 0) - expected;
        historyStats.set(key, stat);
      }),
    ),
  );
  const pairScore = (a: string, b: string) => {
    const stat = historyStats.get([a, b].sort().join("|"));
    return stat
      ? Math.max(
          0,
          Math.min(100, 50 + (stat.performance / (stat.played + 4)) * 100),
        )
      : 50;
  };
  const scoreOrder = (ordered: Player[]) => {
    let score = 0;
    const counts: Record<string, number> = {};
    let previous = new Set<string>();
    for (let roundIndex = 0; roundIndex < template.length; roundIndex++) {
      const current = new Set<string>();
      for (let courtIndex = 0; courtIndex < 3; courtIndex++) {
        const [left, right] = template[roundIndex][courtIndex],
          a = ordered[left],
          b = ordered[right];
        if (
          mixedRequired.has(`${roundIndex + 1}-${courtIndex + 1}`) &&
          a.gender === b.gender
        )
          return -Infinity;
        const key = [a.name, b.name].sort().join("|");
        current.add(key);
        counts[key] = (counts[key] ?? 0) + 1;
        score += pairScore(a.name, b.name);
        if (rules.avoidConsecutivePartners && previous.has(key)) score -= 100;
      }
      previous = current;
    }
    Object.values(counts).forEach((count) => {
      if (rules.preferMaxTwo && count > 2) score -= (count - 2) * 70;
      if (rules.blockAboveThree && count > 3) score -= (count - 3) * 250;
    });
    playerRules.forEach((rule) => {
      const a = roster.find((player) => player.id === rule.playerAId)?.name,
        b = roster.find((player) => player.id === rule.playerBId)?.name;
      if (!a || !b) return;
      const count = counts[[a, b].sort().join("|")] ?? 0;
      if (rule.ruleType === "Avoid") score -= count * 350;
      else if (count < rule.minimumGames)
        score -= (rule.minimumGames - count) * 350;
    });
    return score;
  };
  let best: Player[] = [];
  let bestScore = -Infinity;
  const used = Array(8).fill(false),
    ordered: Player[] = [];
  const search = () => {
    if (ordered.length === 8) {
      const score = scoreOrder(ordered);
      if (score > bestScore) {
        bestScore = score;
        best = [...ordered];
      }
      return;
    }
    for (let index = 0; index < roster.length; index++) {
      if (used[index]) continue;
      used[index] = true;
      ordered.push(roster[index]);
      search();
      ordered.pop();
      used[index] = false;
    }
  };
  search();
  if (!best.length) return [];
  return template.map((row, index) => ({
    round: index + 1,
    courts: row.slice(0, 3).map((pair) => pair.map((slot) => best[slot].name)),
    rest: row[3].map((slot) => best[slot].name),
  }));
}

function Sidebar({
  page,
  go,
  captainName,
  canManageLeague,
  leagueOnly,
  interclubCaptain,
}: {
  page: Page;
  go: (page: Page) => void;
  captainName: string;
  canManageLeague: boolean;
  leagueOnly: boolean;
  interclubCaptain: boolean;
}) {
  const initials =
    captainName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "C";
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">P</span>
        <span>PicklePilot</span>
      </div>
      <nav aria-label="Main navigation">
        {!leagueOnly && (
          <>
            <button
              className={`nav-item ${page === "dashboard" ? "active" : ""}`}
              onClick={() => go("dashboard")}
            >
              ⌁ <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${page === "matches" ? "active" : ""}`}
              onClick={() => go("matches")}
            >
              ◇ <span>Matches</span>
            </button>
            <button
              className={`nav-item ${page === "players" ? "active" : ""}`}
              onClick={() => go("players")}
            >
              ♙ <span>Teams & players</span>
            </button>
            {!interclubCaptain && (
              <button
                className={`nav-item ${page === "opponents" ? "active" : ""}`}
                onClick={() => go("opponents")}
              >
                ◎ <span>Opponents</span>
              </button>
            )}
            <button
              className={`nav-item ${page === "rules" ? "active" : ""}`}
              onClick={() => go("rules")}
            >
              ✓ <span>Rules</span>
            </button>
            {!interclubCaptain && (
              <>
                <button
                  className={`nav-item ${page === "seasons" ? "active" : ""}`}
                  onClick={() => go("seasons")}
                >
                  ◷ <span>Seasons</span>
                </button>
                <button
                  className={`nav-item ${page === "venues" ? "active" : ""}`}
                  onClick={() => go("venues")}
                >
                  ⌖ <span>Locations</span>
                </button>
              </>
            )}
            <button
              className={`nav-item ${page === "reports" ? "active" : ""}`}
              onClick={() => go("reports")}
            >
              ↗ <span>Reports</span>
            </button>
          </>
        )}
        {canManageLeague && (
          <>
            <button
              className={`nav-item league-admin-link ${page === "leagueAdmin" ? "active" : ""}`}
              onClick={() => go("leagueAdmin")}
            >
              ⌁ <span>Overview</span>
            </button>
            <button
              className={`nav-item ${page === "leagueTeams" ? "active" : ""}`}
              onClick={() => go("leagueTeams")}
            >
              ♙ <span>Teams & captains</span>
            </button>
            <button
              className={`nav-item ${page === "leagueLocations" ? "active" : ""}`}
              onClick={() => go("leagueLocations")}
            >
              ⌖ <span>Locations</span>
            </button>
            <button
              className={`nav-item ${page === "leagueSchedule" ? "active" : ""}`}
              onClick={() => go("leagueSchedule")}
            >
              ◷ <span>Schedule</span>
            </button>
            <button
              className={`nav-item ${page === "leagueStandings" ? "active" : ""}`}
              onClick={() => go("leagueStandings")}
            >
              ↗ <span>Standings</span>
            </button>
            <button
              className={`nav-item ${page === "leagueReports" ? "active" : ""}`}
              onClick={() => go("leagueReports")}
            >
              ▤ <span>Reports</span>
            </button>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div>
          <strong>{captainName}</strong>
          <small>
            {page === "leagueAdmin" ? "League administrator" : "Team captain"}
          </small>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({
  page,
  go,
  interclubCaptain,
  leagueAdmin,
  username,
  onLogout,
}: {
  page: Page;
  go: (page: Page) => void;
  interclubCaptain: boolean;
  leagueAdmin: boolean;
  username: string;
  onLogout: () => void;
}) {
  const navigate = (
    destination: Page,
    event?: MouseEvent<HTMLButtonElement>,
  ) => {
    go(destination);
    event?.currentTarget.closest("details")?.removeAttribute("open");
  };
  if (leagueAdmin)
    return (
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          className={page === "leagueAdmin" ? "active" : ""}
          onClick={() => go("leagueAdmin")}
        >
          <b>⌁</b>
          <span>Overview</span>
        </button>
        <button
          className={page === "leagueTeams" ? "active" : ""}
          onClick={() => go("leagueTeams")}
        >
          <b>♙</b>
          <span>Teams</span>
        </button>
        <button
          className={page === "leagueSchedule" ? "active" : ""}
          onClick={() => go("leagueSchedule")}
        >
          <b>◷</b>
          <span>Schedule</span>
        </button>
        <button
          className={page === "leagueStandings" ? "active" : ""}
          onClick={() => go("leagueStandings")}
        >
          <b>↗</b>
          <span>Standings</span>
        </button>
        <details>
          <summary>
            <b>•••</b>
            <span>More</span>
          </summary>
          <div className="mobile-more-menu">
            <button onClick={(event) => navigate("leagueLocations", event)}>
              ⌖ Locations
            </button>
            <button onClick={(event) => navigate("leagueReports", event)}>
              ▤ Reports
            </button>
            <button className="mobile-signout" onClick={onLogout}>
              Sign out <small>{username}</small>
            </button>
          </div>
        </details>
      </nav>
    );
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button
        className={page === "dashboard" ? "active" : ""}
        onClick={() => go("dashboard")}
      >
        <b>⌁</b>
        <span>Home</span>
      </button>
      <button
        className={page === "matches" ? "active" : ""}
        onClick={() => go("matches")}
      >
        <b>◇</b>
        <span>Matches</span>
      </button>
      <button
        className={page === "players" ? "active" : ""}
        onClick={() => go("players")}
      >
        <b>♙</b>
        <span>Players</span>
      </button>
      <button
        className={page === "reports" ? "active" : ""}
        onClick={() => go("reports")}
      >
        <b>↗</b>
        <span>Reports</span>
      </button>
      <details>
        <summary>
          <b>•••</b>
          <span>More</span>
        </summary>
        <div className="mobile-more-menu">
          {!interclubCaptain && (
            <button onClick={(event) => navigate("opponents", event)}>
              ◎ Opponents
            </button>
          )}
          <button onClick={(event) => navigate("rules", event)}>✓ Rules</button>
          {!interclubCaptain && (
            <>
              <button onClick={(event) => navigate("seasons", event)}>
                ◷ Seasons
              </button>
              <button onClick={(event) => navigate("venues", event)}>
                ⌖ Locations
              </button>
            </>
          )}
          <button className="mobile-signout" onClick={onLogout}>
            Sign out <small>{username}</small>
          </button>
        </div>
      </details>
    </nav>
  );
}

function matchProgress(match: Match) {
  const resultCount = Object.keys(match.results ?? {}).length;
  const current =
    match.status === "Completed"
      ? 4
      : resultCount > 0
        ? 3
        : match.lineup?.length === 8
          ? 2
          : match.playerIds.length === 8
            ? 1
            : 0;
  const labels = ["Players", "Lineup", "Print", "Results"];
  return {
    resultCount,
    current,
    labels,
    nextLabel:
      match.status === "Completed"
        ? "View results"
        : resultCount > 0
          ? `Continue results (${resultCount}/24)`
          : match.lineup?.length === 8
            ? "Review & print lineup"
            : "Build lineup",
  };
}

function MatchJourney({ match }: { match: Match }) {
  const flow = matchProgress(match);
  return (
    <div className="match-journey" aria-label="Match preparation progress">
      {flow.labels.map((label, index) => (
        <div
          key={label}
          className={
            index < flow.current || flow.current === 4
              ? "done"
              : index === flow.current
                ? "current"
                : ""
          }
        >
          <b>{index < flow.current || flow.current === 4 ? "✓" : index + 1}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("fr");
  useDomLocalization(locale);
  const [authLoading, setAuthLoading] = useState(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [players, setPlayers] = useState<Player[]>([]);
  const [available, setAvailable] = useState<number[]>([]);
  const [lineup, setLineup] = useState<Round[]>([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<{
    round: number;
    index: number;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerGender, setPlayerGender] = useState<Gender>("W");
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [newSeasonName, setNewSeasonName] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [newVenueName, setNewVenueName] = useState("");
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const [opponentCity, setOpponentCity] = useState("");
  const [opponentTeam, setOpponentTeam] = useState("");
  const [opponentDefaultStrength, setOpponentDefaultStrength] = useState<
    "Weaker" | "Equal" | "Stronger"
  >("Equal");
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [matchOpponent, setMatchOpponent] = useState("");
  const [matchDate, setMatchDate] = useState("2026-08-19");
  const [matchTime, setMatchTime] = useState("20:00");
  const [matchLocation, setMatchLocation] = useState("Chambly Pickleball Club");
  const [matchStrength, setMatchStrength] = useState<
    "Weaker" | "Equal" | "Stronger"
  >("Equal");
  const [matchHomeAway, setMatchHomeAway] = useState<"Local" | "Visitor">(
    "Local",
  );
  const [matchCourts, setMatchCourts] = useState(["1", "2", "3"]);
  const [matchPlayers, setMatchPlayers] = useState<number[]>([]);
  const [results, setResults] = useState<Record<string, "W" | "L">>({});
  const [showPhotoImport, setShowPhotoImport] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [scanResults, setScanResults] = useState<Record<string, ScanCell>>({});
  const [scanAnalyzed, setScanAnalyzed] = useState(false);
  const [reportView, setReportView] = useState<"real" | "adjusted">("real");
  const [reportEntity, setReportEntity] = useState<"pairs" | "players">(
    "pairs",
  );
  const [reportScope, setReportScope] = useState<"current" | "all">("current");
  const [reportSort, setReportSort] = useState<ReportSort>("rate");
  const [reportSortDirection, setReportSortDirection] = useState<
    "desc" | "asc"
  >("desc");
  const [rules, setRules] = useState<RuleSettings>({
    avoidConsecutivePartners: true,
    preferMaxTwo: true,
    blockAboveThree: true,
    avoidBackToBackRest: true,
    avoidLongStreaks: true,
  });
  const [teamName, setTeamName] = useState("Chambly A");
  const [teamNameDraft, setTeamNameDraft] = useState("Chambly A");
  const [captainName, setCaptainName] = useState("Captain");
  const [captainNameDraft, setCaptainNameDraft] = useState("Captain");
  const [teamCategory, setTeamCategory] = useState<
    "Performance" | "Development"
  >("Performance");
  const [playerRules, setPlayerRules] = useState<PlayerRule[]>([]);
  const [ruleA, setRuleA] = useState<number | "">("");
  const [ruleB, setRuleB] = useState<number | "">("");
  const [ruleType, setRuleType] = useState<"Avoid" | "Required">("Avoid");
  const [ruleMinimum, setRuleMinimum] = useState(1);
  const [lastSaved, setLastSaved] = useState("");
  const [assignedLeagueMatches, setAssignedLeagueMatches] = useState<
      AssignedLeagueMatch[]
    >([]),
    [assignedLeagueTeamId, setAssignedLeagueTeamId] = useState(0),
    [captainInterclubContext, setCaptainInterclubContext] =
      useState<CaptainInterclubContext | null>(null),
    [preparingLeagueMatch, setPreparingLeagueMatch] = useState<number | null>(
      null,
    ),
    [assignedResultMatch, setAssignedResultMatch] =
      useState<AssignedLeagueMatch | null>(null),
    [assignedOutcome, setAssignedOutcome] = useState<
      "Home" | "Visitor" | "Tie" | ""
    >(""),
    [assignedWinnerWins, setAssignedWinnerWins] = useState<number | "">("");

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem("picklepilot-language");
      if (stored === "fr" || stored === "en") setLocale(stored);
    });
    fetch("/api/auth/status")
      .then((response) => response.json())
      .then((result: { setupRequired: boolean; user: AppUser | null }) => {
        setSetupRequired(result.setupRequired);
        setAppUser(result.user);
        if (result.user?.preferredLanguage) {
          setLocale(result.user.preferredLanguage);
          window.localStorage.setItem(
            "picklepilot-language",
            result.user.preferredLanguage,
          );
        }
        if (result.user?.role === "LeagueAdmin") setPage("leagueAdmin");
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);
  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("picklepilot-language", nextLocale);
    if (appUser) {
      setAppUser({ ...appUser, preferredLanguage: nextLocale });
      void fetch("/api/auth/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: nextLocale }),
      });
    }
  }
  async function loadAssignedLeagueMatches() {
    try {
      const response = await fetch("/api/league/schedule");
      if (!response.ok) return;
      const result = (await response.json().catch(() => null)) as {
        matches?: AssignedLeagueMatch[];
        teamId?: number;
        captainContext?: CaptainInterclubContext | null;
      } | null;
      if (!result) return;
      setAssignedLeagueMatches(result.matches ?? []);
      setAssignedLeagueTeamId(result.teamId ?? 0);
      setCaptainInterclubContext(result.captainContext ?? null);
    } catch {
      flash("The Interclub schedule could not be loaded. Please try again.");
    }
  }
  useEffect(() => {
    if (appUser?.role === "Captain") loadAssignedLeagueMatches();
  }, [appUser?.id]);
  useEffect(() => {
    if (!assignedResultMatch) return;
    if (assignedResultMatch.resultOutcome) {
      setAssignedOutcome(assignedResultMatch.resultOutcome);
      setAssignedWinnerWins(
        assignedResultMatch.resultOutcome === "Home"
          ? (assignedResultMatch.homeWins ?? "")
          : assignedResultMatch.resultOutcome === "Visitor"
            ? (assignedResultMatch.visitorWins ?? "")
            : "",
      );
      return;
    }
    const opponentName =
      assignedResultMatch.homeTeamId === assignedLeagueTeamId
        ? assignedResultMatch.visitorTeamName
        : assignedResultMatch.homeTeamName;
    const localMatch = matches.find(
        (item) =>
          item.matchDate === assignedResultMatch.matchDate &&
          item.opponent === opponentName,
      ),
      values = Object.values(localMatch?.results ?? {});
    if (values.length !== 24) return;
    const ownWins = values.filter((value) => value === "W").length,
      ownLosses = values.filter((value) => value === "L").length;
    if (ownWins === ownLosses) {
      setAssignedOutcome("Tie");
      setAssignedWinnerWins("");
    } else {
      const ownTeamWon = ownWins > ownLosses;
      setAssignedOutcome(
        ownTeamWon
          ? assignedResultMatch.homeTeamId === assignedLeagueTeamId
            ? "Home"
            : "Visitor"
          : assignedResultMatch.homeTeamId === assignedLeagueTeamId
            ? "Visitor"
            : "Home",
      );
      setAssignedWinnerWins(Math.max(ownWins, ownLosses));
    }
  }, [assignedResultMatch?.id, matches, assignedLeagueTeamId]);
  async function submitAssignedResult(event: FormEvent) {
    event.preventDefault();
    if (
      !assignedResultMatch ||
      !assignedOutcome ||
      (assignedOutcome !== "Tie" && assignedWinnerWins === "")
    )
      return;
    const response = await fetch("/api/league/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: assignedResultMatch.id,
        outcome: assignedOutcome,
        winnerWins: assignedWinnerWins,
      }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      flash(result.error ?? "Unable to submit result");
      return;
    }
    const opponentName =
        assignedResultMatch.homeTeamId === assignedLeagueTeamId
          ? assignedResultMatch.visitorTeamName
          : assignedResultMatch.homeTeamName,
      localMatch = matches.find(
        (item) =>
          item.matchDate === assignedResultMatch.matchDate &&
          item.opponent === opponentName,
      );
    if (localMatch) {
      const localResponse = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...localMatch, status: "Completed" }),
      });
      if (localResponse.ok) {
        const saved = ((await localResponse.json()) as { match: Match }).match;
        setMatches((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      }
    }
    setAssignedResultMatch(null);
    setAssignedOutcome("");
    setAssignedWinnerWins("");
    await loadAssignedLeagueMatches();
    flash("Official Interclub result submitted.");
  }
  async function prepareAssignedMatch(leagueMatch: AssignedLeagueMatch) {
    setPreparingLeagueMatch(leagueMatch.id);
    const response = await fetch("/api/league/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueMatchId: leagueMatch.id }),
    });
    const result = (await response
      .json()
      .catch(() => ({ error: "Unable to prepare this match" }))) as {
      match?: Match;
      season?: Season;
      settings?: {
        teamName: string;
        captainName: string;
        category: "Performance" | "Development";
      };
      error?: string;
    };
    if (!response.ok || !result.match || !result.season) {
      setPreparingLeagueMatch(null);
      flash(result.error ?? "Unable to prepare this match");
      return;
    }
    const recent = [...matches]
      .filter(
        (item) => item.id !== result.match!.id && item.playerIds.length === 8,
      )
      .sort((a, b) =>
        `${a.matchDate} ${a.matchTime}`.localeCompare(
          `${b.matchDate} ${b.matchTime}`,
        ),
      )
      .pop();
    const activeIds = new Set(activePlayers.map((player) => player.id));
    const previousIds =
      recent?.playerIds.filter((id) => activeIds.has(id)) ?? [];
    const defaultPlayers =
      result.match.playerIds.length === 8
        ? result.match.playerIds
        : previousIds.length === 8
          ? previousIds
          : activePlayers.slice(0, 8).map((player) => player.id);
    let preparedMatch = { ...result.match, playerIds: defaultPlayers };
    if (
      defaultPlayers.length === 8 &&
      result.match.playerIds.join(",") !== defaultPlayers.join(",")
    ) {
      const saveResponse = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedMatch),
      });
      if (saveResponse.ok)
        preparedMatch = ((await saveResponse.json()) as { match: Match }).match;
    }
    setPreparingLeagueMatch(null);
    setSeasons((current) =>
      current.some((item) => item.id === result.season!.id)
        ? current.map((item) =>
            item.id === result.season!.id ? result.season! : item,
          )
        : [...current, result.season!],
    );
    setSelectedSeason(result.season.id);
    setMatches((current) =>
      current.some((item) => item.id === preparedMatch.id)
        ? current.map((item) =>
            item.id === preparedMatch.id ? preparedMatch : item,
          )
        : [...current, preparedMatch],
    );
    if (result.settings) {
      setTeamName(result.settings.teamName);
      setTeamNameDraft(result.settings.teamName);
      setCaptainName(result.settings.captainName);
      setCaptainNameDraft(result.settings.captainName);
      setTeamCategory(result.settings.category);
    }
    if (defaultPlayers.length === 8) buildMatch(preparedMatch);
    else openMatchForm(preparedMatch);
  }
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [page]);
  useEffect(() => {
    resetTeamData();
    if (!appUser || appUser.role === "LeagueAdmin") {
      setTeamLoading(false);
      return;
    }
    let cancelled = false;
    setTeamLoading(true);
    async function loadPlayers() {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) throw new Error("Database unavailable");
        const result = (await response.json()) as { players: Player[] };
        if (cancelled) return;
        setPlayers(result.players);
        setAvailable(
          result.players
            .filter((p) => p.status === "Active")
            .slice(0, 8)
            .map((p) => p.id),
        );
      } catch {
        if (!cancelled) flash("The roster could not be loaded.");
      }
    }
    const playerLoad = loadPlayers();
    const loads = [
      playerLoad,
      fetch("/api/matches")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((result: { matches: Match[] }) => {
          if (!cancelled) setMatches(result.matches);
        }),
      fetch("/api/settings")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then(
          (result: {
            settings: {
              teamName: string;
              captainName: string;
              category: "Performance" | "Development";
            };
          }) => {
            if (cancelled) return;
            setTeamName(result.settings.teamName);
            setTeamNameDraft(result.settings.teamName);
            setCaptainName(result.settings.captainName);
            setCaptainNameDraft(result.settings.captainName);
            setTeamCategory(result.settings.category ?? "Performance");
          },
        ),
      fetch("/api/player-rules")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((result: { rules: PlayerRule[] }) => {
          if (!cancelled) setPlayerRules(result.rules);
        }),
      fetch("/api/seasons")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((result: { seasons: Season[] }) => {
          if (cancelled) return;
          setSeasons(result.seasons);
          const active = result.seasons.find(
            (season) => season.status === "Active",
          );
          setSelectedSeason(active?.id ?? "all");
        }),
      fetch("/api/venues")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((result: { venues: Venue[] }) => {
          if (!cancelled) setVenues(result.venues);
        }),
      fetch("/api/opponents")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((result: { opponents: Opponent[] }) => {
          if (!cancelled) setOpponents(result.opponents);
        }),
    ];
    Promise.allSettled(loads).then(() => {
      if (!cancelled) setTeamLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [appUser?.id]);
  function resetTeamData() {
    setPlayers([]);
    setAvailable([]);
    setLineup([]);
    setMatches([]);
    setSeasons([]);
    setVenues([]);
    setOpponents([]);
    setPlayerRules([]);
    setResults({});
    setActiveMatch(null);
    setSelectedSeason("all");
    setReportScope("current");
    setTeamName("My team");
    setTeamNameDraft("My team");
    setCaptainName("Captain");
    setCaptainNameDraft("Captain");
    setTeamCategory("Performance");
  }
  const persist = (next: Player[]) => {
    setPlayers(next);
  };
  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  };
  const activePlayers = players.filter((p) => p.status === "Active");
  const selectedPlayers = available
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];
  const mixedReady =
    selectedPlayers.some((p) => p.gender === "W") &&
    selectedPlayers.some((p) => p.gender === "M");
  const activeSeason =
    seasons.find((season) => season.status === "Active") ?? null;
  const seasonMatches = useMemo(
    () =>
      selectedSeason === "all"
        ? matches
        : matches.filter((match) => match.seasonId === selectedSeason),
    [matches, selectedSeason],
  );
  const reportMatches = useMemo(
    () =>
      reportScope === "all"
        ? matches
        : matches.filter((match) => match.seasonId === activeSeason?.id),
    [matches, reportScope, activeSeason?.id],
  );
  const report = useMemo(() => {
    const pairs: Record<
      string,
      {
        players: string[];
        played: number;
        wins: number;
        losses: number;
        performance: number;
        rate: number;
        score: number;
      }
    > = {};
    const individuals: Record<
      string,
      {
        players: string[];
        played: number;
        wins: number;
        losses: number;
        performance: number;
        rate: number;
        score: number;
      }
    > = {};
    let played = 0,
      wins = 0,
      losses = 0;
    reportMatches.forEach((match) =>
      match.lineup?.forEach((round) =>
        round.courts.forEach((pair, courtIndex) => {
          const result = match.results?.[`${round.round}-${courtIndex + 1}`];
          if (!result) return;
          const players = [...pair].sort((a, b) => a.localeCompare(b));
          const key = players.join("|");
          const expected =
            match.opponentStrength === "Stronger"
              ? 0.35
              : match.opponentStrength === "Weaker"
                ? 0.65
                : 0.5;
          pairs[key] ??= {
            players,
            played: 0,
            wins: 0,
            losses: 0,
            performance: 0,
            rate: 0,
            score: 50,
          };
          pairs[key].played++;
          played++;
          pairs[key].performance += (result === "W" ? 1 : 0) - expected;
          if (result === "W") {
            pairs[key].wins++;
            wins++;
          } else {
            pairs[key].losses++;
            losses++;
          }
          pair.forEach((name) => {
            individuals[name] ??= {
              players: [name],
              played: 0,
              wins: 0,
              losses: 0,
              performance: 0,
              rate: 0,
              score: 50,
            };
            individuals[name].played++;
            individuals[name].performance +=
              (result === "W" ? 1 : 0) - expected;
            if (result === "W") individuals[name].wins++;
            else individuals[name].losses++;
          });
        }),
      ),
    );
    const ranking = Object.values(pairs).map((pair) => ({
      ...pair,
      rate: (pair.wins / pair.played) * 100,
      score: Math.max(
        0,
        Math.min(100, 50 + (pair.performance / (pair.played + 4)) * 100),
      ),
    }));
    const playerRanking = Object.values(individuals).map((player) => ({
      ...player,
      rate: (player.wins / player.played) * 100,
      score: Math.max(
        0,
        Math.min(100, 50 + (player.performance / (player.played + 4)) * 100),
      ),
    }));
    return {
      ranking,
      playerRanking,
      played,
      wins,
      losses,
      completed: reportMatches.filter((match) => match.status === "Completed")
        .length,
    };
  }, [reportMatches]);
  const sortedReport = useMemo(
    () =>
      [
        ...(reportEntity === "pairs" ? report.ranking : report.playerRanking),
      ].sort((a, b) => {
        const key =
          reportView === "real" && reportSort === "score" ? "rate" : reportSort;
        const difference = a[key] - b[key];
        return (
          (reportSortDirection === "desc" ? -difference : difference) ||
          b.played - a.played ||
          a.players.join().localeCompare(b.players.join())
        );
      }),
    [
      report.ranking,
      report.playerRanking,
      reportEntity,
      reportSort,
      reportSortDirection,
      reportView,
    ],
  );
  const dashboard = useMemo(() => {
    const nextMatch =
      seasonMatches.find((match) => match.status !== "Completed") ?? null;
    const completed = seasonMatches.filter(
      (match) => match.status === "Completed",
    );
    const matchRecords = completed.map((match) => {
      const values = Object.values(match.results ?? {});
      const wins = values.filter((value) => value === "W").length;
      const losses = values.filter((value) => value === "L").length;
      return { wins, losses };
    });
    const teamWins = matchRecords.filter(
      (record) => record.wins > record.losses,
    ).length;
    const teamLosses = matchRecords.filter(
      (record) => record.losses > record.wins,
    ).length;
    return { nextMatch, teamWins, teamLosses };
  }, [seasonMatches]);
  const today = new Date().toISOString().slice(0, 10);
  const nextLeagueMatch = useMemo(
    () =>
      [...assignedLeagueMatches]
        .filter(
          (match) => match.status !== "Completed" && match.matchDate >= today,
        )
        .sort((a, b) =>
          `${a.matchDate} ${a.matchTime}`.localeCompare(
            `${b.matchDate} ${b.matchTime}`,
          ),
        )[0] ?? null,
    [assignedLeagueMatches, today],
  );
  const overdueLeagueMatches = useMemo(
    () =>
      assignedLeagueMatches.filter(
        (match) => match.status !== "Completed" && match.matchDate < today,
      ),
    [assignedLeagueMatches, today],
  );

  const validation = useMemo(() => {
    const restCount: Record<string, number> = Object.fromEntries(
      selectedPlayers.map((p) => [p.name, 0]),
    );
    const partners: Record<string, number> = {};
    const blocking: string[] = [];
    const warnings: string[] = [];
    lineup.forEach((row, rowIndex) => {
      const all = [...row.courts.flat(), ...row.rest];
      [...new Set(all.filter((n, i) => all.indexOf(n) !== i))].forEach((n) =>
        blocking.push(`Round ${row.round}: ${n} appears more than once`),
      );
      all
        .filter((n) => !selectedPlayers.some((p) => p.name === n))
        .forEach((n) =>
          blocking.push(`Round ${row.round}: ${n} is not in this roster`),
        );
      row.rest.forEach((n) => {
        if (n in restCount) restCount[n]++;
      });
      if (
        rules.avoidBackToBackRest &&
        rowIndex &&
        row.rest.some((n) => lineup[rowIndex - 1].rest.includes(n))
      )
        warnings.push(`Round ${row.round}: back-to-back rest`);
      row.courts.forEach((pair, courtIndex) => {
        const key = [...pair].sort().join("|");
        partners[key] = (partners[key] || 0) + 1;
        if (
          rules.avoidConsecutivePartners &&
          rowIndex &&
          lineup[rowIndex - 1].courts.some(
            (previous) => [...previous].sort().join("|") === key,
          )
        )
          warnings.push(
            `Round ${row.round}: ${pair.join(" + ")} also played together in the previous round`,
          );
        if (mixedRequired.has(`${row.round}-${courtIndex + 1}`)) {
          const genders = pair.map(
            (n) => selectedPlayers.find((p) => p.name === n)?.gender,
          );
          if (!genders[0] || genders[0] === genders[1])
            blocking.push(
              `Round ${row.round}, court ${courtIndex + 1}: mixed doubles required`,
            );
        }
      });
    });
    Object.entries(restCount).forEach(([n, c]) => {
      if (c !== 2) blocking.push(`${n} rests ${c} times`);
    });
    Object.entries(partners).forEach(([pair, c]) => {
      if (rules.blockAboveThree && c > 3)
        warnings.push(`${pair.replace("|", " + ")} play together ${c} times`);
    });
    playerRules.forEach((rule) => {
      const a = players.find((player) => player.id === rule.playerAId)?.name,
        b = players.find((player) => player.id === rule.playerBId)?.name;
      if (!a || !b) return;
      const count = partners[[a, b].sort().join("|")] || 0;
      if (rule.ruleType === "Avoid" && count > 0)
        warnings.push(`${a} and ${b} should not play together`);
      if (rule.ruleType === "Required" && count < rule.minimumGames)
        warnings.push(
          `${a} and ${b} should play together at least ${rule.minimumGames} time${rule.minimumGames === 1 ? "" : "s"}`,
        );
    });
    return {
      blocking: [...new Set(blocking)],
      warnings: [...new Set(warnings)],
    };
  }, [lineup, selectedPlayers, rules, playerRules, players]);

  async function saveTeamName() {
    const name = teamNameDraft.trim(),
      captain = captainNameDraft.trim();
    if (!name || !captain) return;
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamName: name,
        captainName: captain,
        category: teamCategory,
      }),
    });
    if (response.ok) {
      setTeamName(name);
      setCaptainName(captain);
      flash("Team settings saved.");
    } else flash("The settings could not be saved.");
  }
  async function createSeason() {
    const name = newSeasonName.trim();
    if (!name) return;
    const response = await fetch("/api/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      flash("The season could not be created.");
      return;
    }
    const { season } = (await response.json()) as { season: Season };
    setSeasons((current) => [
      ...current.map((item) =>
        item.status === "Active"
          ? {
              ...item,
              status: "Closed" as const,
              closedAt: new Date().toISOString(),
            }
          : item,
      ),
      season,
    ]);
    setSelectedSeason(season.id);
    setNewSeasonName("");
    flash(`${season.name} is now the active season.`);
  }
  async function createVenue() {
    const name = newVenueName.trim();
    if (!name) return;
    const response = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      flash("The location could not be saved.");
      return;
    }
    const { venue } = (await response.json()) as { venue: Venue };
    setVenues((current) =>
      current.some((item) => item.id === venue.id)
        ? current
        : [...current, venue].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setNewVenueName("");
    flash(`${venue.name} added.`);
  }
  async function toggleVenue(venue: Venue) {
    const status = venue.status === "Active" ? "Inactive" : "Active";
    const response = await fetch("/api/venues", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: venue.id, status }),
    });
    if (!response.ok) {
      flash("The location could not be updated.");
      return;
    }
    setVenues((current) =>
      current.map((item) =>
        item.id === venue.id ? { ...item, status } : item,
      ),
    );
    flash(`${venue.name} is now ${status.toLowerCase()}.`);
  }
  const opponentLabel = (item: Opponent) => `${item.city} · ${item.teamName}`;
  async function saveOpponent() {
    const city = opponentCity.trim(),
      teamName = opponentTeam.trim();
    if (!city || !teamName) return;
    const response = await fetch("/api/opponents", {
      method: editingOpponent ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingOpponent?.id,
        city,
        teamName,
        defaultStrength: opponentDefaultStrength,
      }),
    });
    if (!response.ok) {
      flash("The opponent could not be saved.");
      return;
    }
    const { opponent } = (await response.json()) as { opponent: Opponent };
    setOpponents((current) =>
      (editingOpponent
        ? current.map((item) => (item.id === opponent.id ? opponent : item))
        : [...current, opponent]
      ).sort((a, b) => opponentLabel(a).localeCompare(opponentLabel(b))),
    );
    setEditingOpponent(null);
    setOpponentCity("");
    setOpponentTeam("");
    setOpponentDefaultStrength("Equal");
    flash(
      editingOpponent
        ? `${opponentLabel(opponent)} updated.`
        : `${opponentLabel(opponent)} added.`,
    );
  }
  function editOpponent(item: Opponent) {
    setEditingOpponent(item);
    setOpponentCity(item.city);
    setOpponentTeam(item.teamName);
    setOpponentDefaultStrength(item.defaultStrength);
  }
  function cancelOpponentEdit() {
    setEditingOpponent(null);
    setOpponentCity("");
    setOpponentTeam("");
    setOpponentDefaultStrength("Equal");
  }
  async function removeOpponent(item: Opponent) {
    if (
      !window.confirm(
        `Remove ${opponentLabel(item)}? Existing matches will not be changed.`,
      )
    )
      return;
    const response = await fetch(`/api/opponents?id=${item.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      flash("The opponent could not be removed.");
      return;
    }
    setOpponents((current) =>
      current.filter((opponent) => opponent.id !== item.id),
    );
    if (editingOpponent?.id === item.id) cancelOpponentEdit();
    flash(`${opponentLabel(item)} removed.`);
  }
  async function toggleOpponent(item: Opponent) {
    const status = item.status === "Active" ? "Inactive" : "Active";
    const response = await fetch("/api/opponents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });
    if (!response.ok) {
      flash("The opponent could not be updated.");
      return;
    }
    setOpponents((current) =>
      current.map((opponent) =>
        opponent.id === item.id ? { ...opponent, status } : opponent,
      ),
    );
    flash(`${opponentLabel(item)} is now ${status.toLowerCase()}.`);
  }
  async function addPlayerRule() {
    if (!ruleA || !ruleB || ruleA === ruleB) {
      flash("Select two different players.");
      return;
    }
    const response = await fetch("/api/player-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerAId: ruleA,
        playerBId: ruleB,
        ruleType,
        minimumGames: ruleMinimum,
      }),
    });
    if (!response.ok) {
      flash("The player rule could not be saved.");
      return;
    }
    const { rule } = (await response.json()) as { rule: PlayerRule };
    setPlayerRules((current) => [...current, rule]);
    setRuleA("");
    setRuleB("");
    flash("Player rule saved.");
  }
  async function removePlayerRule(id: number) {
    const response = await fetch(`/api/player-rules?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setPlayerRules((current) => current.filter((rule) => rule.id !== id));
      flash("Player rule removed.");
    }
  }

  function generate() {
    if (selectedPlayers.length !== 8 || !mixedReady) return;
    setLineup(buildLineup(selectedPlayers, matches, playerRules, rules));
    setEditing(false);
    setSelected(null);
    flash(
      "Best available lineup generated from pair rankings, game volume and active preferences.",
    );
  }
  function sortReport(key: ReportSort) {
    if (reportSort === key)
      setReportSortDirection((direction) =>
        direction === "desc" ? "asc" : "desc",
      );
    else {
      setReportSort(key);
      setReportSortDirection("desc");
    }
  }
  function swapPlayer(round: number, index: number) {
    if (!editing) return;
    if (!selected || selected.round !== round) {
      setSelected({ round, index });
      return;
    }
    const next = structuredClone(lineup),
      values = [...next[round].courts.flat(), ...next[round].rest];
    [values[selected.index], values[index]] = [
      values[index],
      values[selected.index],
    ];
    next[round].courts = [
      [values[0], values[1]],
      [values[2], values[3]],
      [values[4], values[5]],
    ];
    next[round].rest = [values[6], values[7]];
    setLineup(next);
    setSelected(null);
  }
  function openForm(player?: Player) {
    setEditingPlayer(player || null);
    setPlayerName(player?.name || "");
    setPlayerGender(player?.gender || "W");
    setShowForm(true);
  }
  async function savePlayer(e: FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) return;
    if (
      players.some(
        (p) =>
          p.name.toLowerCase() === name.toLowerCase() &&
          p.id !== editingPlayer?.id,
      )
    ) {
      flash("A player with this name already exists.");
      return;
    }
    try {
      const response = await fetch("/api/players", {
        method: editingPlayer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlayer?.id,
          name,
          gender: playerGender,
          status: editingPlayer?.status ?? "Active",
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      const {
        player,
        previousName,
        renamedMatchIds = [],
      } = (await response.json()) as {
        player: Player;
        previousName?: string;
        renamedMatchIds?: number[];
      };
      persist(
        editingPlayer
          ? players.map((p) => (p.id === player.id ? player : p))
          : [...players, player],
      );
      if (editingPlayer && previousName && previousName !== player.name) {
        const rename = (rounds: Round[] | null | undefined) =>
          rounds?.map((round) => ({
            ...round,
            courts: round.courts.map((pair) =>
              pair.map((value) =>
                value === previousName ? player.name : value,
              ),
            ),
            rest: round.rest.map((value) =>
              value === previousName ? player.name : value,
            ),
          })) ?? rounds;
        setMatches((current) =>
          current.map((match) =>
            renamedMatchIds.includes(match.id)
              ? { ...match, lineup: rename(match.lineup) }
              : match,
          ),
        );
        setActiveMatch((current) =>
          current && renamedMatchIds.includes(current.id)
            ? { ...current, lineup: rename(current.lineup) }
            : current,
        );
        setLineup((current) => rename(current) ?? []);
      }
      setShowForm(false);
      flash(
        editingPlayer ? "Player updated and saved." : "Player added and saved.",
      );
    } catch {
      flash("The player could not be saved. Please try again.");
    }
  }
  async function toggleStatus(player: Player) {
    const status = player.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch("/api/players", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...player, status }),
      });
      if (!response.ok) throw new Error("Update failed");
      const payload = (await response.json()) as { player: Player };
      persist(players.map((p) => (p.id === player.id ? payload.player : p)));
      if (status === "Inactive")
        setAvailable((ids) => ids.filter((id) => id !== player.id));
      flash(`${player.name} is now ${status.toLowerCase()} and saved.`);
    } catch {
      flash("The status could not be saved. Please try again.");
    }
  }
  async function removePlayer(player: Player) {
    try {
      const response = await fetch(`/api/players?id=${player.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      persist(players.filter((p) => p.id !== player.id));
      setAvailable((ids) => ids.filter((id) => id !== player.id));
      flash(`${player.name} removed.`);
    } catch {
      flash("The player could not be removed. Please try again.");
    }
  }
  function openMatchForm(match?: Match) {
    if (!match && !activeSeason) {
      flash("Create your first season before adding a match.");
      setPage("seasons");
      return;
    }
    const recentMatch = match
      ? undefined
      : [...matches]
          .sort((a, b) =>
            `${a.matchDate} ${a.matchTime}`.localeCompare(
              `${b.matchDate} ${b.matchTime}`,
            ),
          )
          .pop();
    const activePlayerIds = new Set(activePlayers.map((player) => player.id));
    setEditingMatch(match ?? null);
    setMatchOpponent(match?.opponent ?? "");
    setMatchDate(match?.matchDate ?? new Date().toISOString().slice(0, 10));
    setMatchTime(match?.matchTime ?? "20:00");
    setMatchLocation(match?.location ?? "");
    setMatchStrength(match?.opponentStrength ?? "Equal");
    setMatchHomeAway(match?.homeAway ?? "Local");
    setMatchCourts(
      match ? [match.court1, match.court2, match.court3] : ["1", "2", "3"],
    );
    setMatchPlayers(
      match?.playerIds ??
        recentMatch?.playerIds.filter((id) => activePlayerIds.has(id)) ??
        [],
    );
    setShowMatchForm(true);
  }
  async function saveMatch(e: FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/matches", {
        method: editingMatch ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingMatch ?? {}),
          opponent: matchOpponent,
          matchDate,
          matchTime,
          location: matchLocation,
          opponentStrength: matchStrength,
          homeAway: matchHomeAway,
          court1: matchCourts[0],
          court2: matchCourts[1],
          court3: matchCourts[2],
          warmupMinutes: editingMatch?.warmupMinutes ?? 10,
          roundMinutes: editingMatch?.roundMinutes ?? 12,
          breakMinutes: editingMatch?.breakMinutes ?? 2,
          playerIds: matchPlayers,
          seasonId: editingMatch?.seasonId ?? activeSeason?.id,
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      const { match } = (await response.json()) as { match: Match };
      setMatches((current) =>
        editingMatch
          ? current.map((item) => (item.id === match.id ? match : item))
          : [...current, match],
      );
      setActiveMatch(match);
      setEditingMatch(null);
      setShowMatchForm(false);
      flash(
        captainInterclubContext
          ? "Players confirmed. Your lineup is ready to review."
          : editingMatch
            ? "Match updated. Lineup and results were preserved."
            : "Match created and saved.",
      );
      if (captainInterclubContext) buildMatch(match);
    } catch {
      flash("The match could not be saved. Please try again.");
    }
  }
  function buildMatch(match: Match) {
    setActiveMatch(match);
    setAvailable(match.playerIds);
    if (match.lineup?.length === 8) {
      setLineup(match.lineup);
    } else if (match.playerIds.length === 8) {
      const roster = match.playerIds
        .map((id) => players.find((player) => player.id === id))
        .filter(Boolean) as Player[];
      if (roster.length === 8)
        setLineup(buildLineup(roster, matches, playerRules, rules));
    }
    setPage("builder");
  }
  async function continueMatch(match: Match) {
    const flow = matchProgress(match);
    if (captainInterclubContext && match.playerIds.length !== 8) {
      const activeIds = new Set(activePlayers.map((player) => player.id));
      const recent = [...matches]
        .filter((item) => item.id !== match.id && item.playerIds.length === 8)
        .sort((a, b) =>
          `${a.matchDate} ${a.matchTime}`.localeCompare(
            `${b.matchDate} ${b.matchTime}`,
          ),
        )
        .pop();
      const previousIds =
        recent?.playerIds.filter((id) => activeIds.has(id)) ?? [];
      const defaults =
        previousIds.length === 8
          ? previousIds
          : activePlayers.slice(0, 8).map((player) => player.id);
      if (defaults.length !== 8) {
        openMatchForm(match);
        return;
      }
      const response = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...match, playerIds: defaults }),
      });
      const prepared = response.ok
        ? ((await response.json()) as { match: Match }).match
        : { ...match, playerIds: defaults };
      setMatches((current) =>
        current.map((item) => (item.id === prepared.id ? prepared : item)),
      );
      buildMatch(prepared);
      return;
    }
    if (flow.resultCount > 0 || match.status === "Completed")
      openResults(match);
    else buildMatch(match);
  }
  function openPrint(match: Match) {
    if (!match.lineup?.length) {
      flash("Save the lineup before printing.");
      return;
    }
    setActiveMatch(match);
    setPage("print");
  }
  async function saveLineup() {
    if (!activeMatch) {
      flash("Open the lineup from a saved match before saving.");
      setPage("matches");
      return;
    }
    try {
      const response = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeMatch, playerIds: available, lineup }),
      });
      if (!response.ok) throw new Error("Save failed");
      const { match } = (await response.json()) as { match: Match };
      setActiveMatch(match);
      setMatches((current) =>
        current.map((item) => (item.id === match.id ? match : item)),
      );
      setLastSaved(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      flash("Lineup saved to this match.");
    } catch {
      flash("The lineup could not be saved. Please try again.");
    }
  }
  async function openResults(match: Match) {
    if (!match.lineup?.length) {
      flash("Save the lineup before entering results.");
      return;
    }
    setResults({});
    try {
      const response = await fetch(`/api/matches?id=${match.id}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Load failed");
      const { match: freshMatch } = (await response.json()) as { match: Match };
      setActiveMatch(freshMatch);
      setResults({ ...(freshMatch.results ?? {}) });
      setPage("results");
    } catch {
      flash("The match results could not be loaded. Please try again.");
    }
  }
  async function saveResults() {
    if (!activeMatch) return;
    const completed = Object.keys(results).length === 24;
    try {
      const response = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeMatch,
          results,
          status:
            completed && !captainInterclubContext ? "Completed" : "Upcoming",
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      const { match } = (await response.json()) as { match: Match };
      setActiveMatch(match);
      setMatches((current) =>
        current.map((item) => (item.id === match.id ? match : item)),
      );
      flash(
        completed
          ? "All 24 results saved. Match completed!"
          : "Results saved as a draft.",
      );
      if (completed) setPage("matches");
    } catch {
      flash("The results could not be saved. Please try again.");
    }
  }
  function selectResultPhoto(file?: File) {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoName(file.name);
    setScanResults({});
    setScanAnalyzed(false);
  }
  function clearPhotoImport() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview("");
    setPhotoName("");
    setScanResults({});
    setScanAnalyzed(false);
  }
  function openPhotoImport() {
    clearPhotoImport();
    setShowPhotoImport(true);
  }
  function closePhotoImport() {
    clearPhotoImport();
    setShowPhotoImport(false);
  }
  function simulatePhotoReading() {
    const values: ("W" | "L" | null)[][] = [
      ["W", "W", "L"],
      ["W", "L", "L"],
      ["W", "W", "W"],
      ["W", "W", "W"],
      ["W", "L", null],
      ["W", "W", "W"],
      ["W", "L", null],
      ["L", "W", "W"],
    ];
    const next: Record<string, ScanCell> = {};
    values.forEach((row, roundIndex) =>
      row.forEach((value, courtIndex) => {
        const confidence =
          value === null
            ? "low"
            : roundIndex === 6 || roundIndex === 7
              ? "medium"
              : "high";
        next[`${roundIndex + 1}-${courtIndex + 1}`] = { value, confidence };
      }),
    );
    setScanResults(next);
    setScanAnalyzed(true);
  }
  function applyPhotoReading() {
    const detected = Object.fromEntries(
      Object.entries(scanResults)
        .filter(([, cell]) => cell.value)
        .map(([key, cell]) => [key, cell.value]),
    ) as Record<string, "W" | "L">;
    setResults((current) => ({ ...current, ...detected }));
    closePhotoImport();
    flash(
      `${Object.keys(detected).length} photo results applied. Review the remaining courts.`,
    );
  }

  if (authLoading)
    return <div className="auth-loading">Loading PicklePilot…</div>;
  if (!appUser)
    return (
      <AuthScreen
        setupRequired={setupRequired}
        locale={locale}
        onLocaleChange={changeLocale}
        onAuthenticated={(user) => {
          setAppUser(user);
          if (user.preferredLanguage) changeLocale(user.preferredLanguage);
          setPage(user.role === "LeagueAdmin" ? "leagueAdmin" : "dashboard");
          setSetupRequired(false);
        }}
      />
    );
  if (appUser.mustChangePassword)
    return (
      <PasswordChange
        user={appUser}
        locale={locale}
        onLocaleChange={changeLocale}
        onDone={() => setAppUser({ ...appUser, mustChangePassword: false })}
      />
    );
  if (teamLoading)
    return <div className="auth-loading">Loading your team…</div>;

  const signOut = async () => {
    setTeamLoading(true);
    resetTeamData();
    await fetch("/api/auth/logout", { method: "POST" });
    setAppUser(null);
  };

  const integratedDashboard =
    page === "dashboard" && captainInterclubContext ? (
      <section className="content interclub-dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {captainInterclubContext.seasonName} ·{" "}
              {captainInterclubContext.divisionName}
            </p>
            <h1>Good afternoon, {captainName}</h1>
          </div>
          <button className="outline-btn" onClick={() => setPage("matches")}>
            View all matches →
          </button>
        </header>
        {nextLeagueMatch ? (
          <section className="hero-card">
            <div className="hero-copy">
              <span className="status">YOUR NEXT MATCH</span>
              <h2>
                {nextLeagueMatch.homeTeamName} <span>vs</span>{" "}
                {nextLeagueMatch.visitorTeamName}
              </h2>
              <p>
                {new Date(
                  `${nextLeagueMatch.matchDate}T12:00:00`,
                ).toLocaleDateString(localeCode(locale), {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {nextLeagueMatch.matchTime} · {nextLeagueMatch.venueName}
              </p>
              <div className="league-next-details">
                <span>
                  Division {localizeDivision(captainInterclubContext.divisionName, locale)}
                </span>
                <span>Courts {nextLeagueMatch.courts.join(", ")}</span>
              </div>
            </div>
            <div className="hero-actions">
              <div className="readiness">
                <strong>{activePlayers.length}</strong>
                <span>active players</span>
              </div>
              <button
                className="primary-btn"
                disabled={preparingLeagueMatch === nextLeagueMatch.id}
                onClick={() => {
                  const opponentName =
                    nextLeagueMatch.homeTeamId === assignedLeagueTeamId
                      ? nextLeagueMatch.visitorTeamName
                      : nextLeagueMatch.homeTeamName;
                  const localMatch = matches.find(
                    (item) =>
                      item.matchDate === nextLeagueMatch.matchDate &&
                      item.opponent === opponentName,
                  );
                  localMatch
                    ? continueMatch(localMatch)
                    : prepareAssignedMatch(nextLeagueMatch);
                }}
              >
                {preparingLeagueMatch === nextLeagueMatch.id
                  ? "Preparing…"
                  : "Build lineup →"}
              </button>
            </div>
          </section>
        ) : (
          <section className="hero-card">
            <div className="hero-copy">
              <span className="status">SCHEDULE</span>
              <h2>No upcoming match</h2>
              <p>
                The next match will appear here as soon as the league
                administrator adds it.
              </p>
            </div>
            <button className="primary-btn" onClick={() => setPage("matches")}>
              View schedule →
            </button>
          </section>
        )}
        <section className="stats-grid">
          <article>
            <span>TEAM</span>
            <strong className="pair-name">
              {captainInterclubContext.teamName}
            </strong>
            <small>{captainInterclubContext.divisionName}</small>
          </article>
          <article>
            <span>SCHEDULED MATCHES</span>
            <strong>{assignedLeagueMatches.length}</strong>
            <small>
              {
                assignedLeagueMatches.filter(
                  (match) => match.status === "Completed",
                ).length
              }{" "}
              completed
            </small>
          </article>
          <article>
            <span>ACTIVE PLAYERS</span>
            <strong>{activePlayers.length}</strong>
            <small>Available for the next lineup</small>
          </article>
          <article>
            <span>NEXT LOCATION</span>
            <strong className="pair-name">
              {nextLeagueMatch?.venueName ?? "—"}
            </strong>
            <small>
              {nextLeagueMatch
                ? `${nextLeagueMatch.matchDate} · ${nextLeagueMatch.matchTime}`
                : "No match scheduled"}
            </small>
          </article>
        </section>
      </section>
    ) : null;

  return (
    <main className="app-shell">
      <LanguageSelector locale={locale} onChange={changeLocale} />
      <Sidebar
        page={page}
        go={setPage}
        captainName={
          appUser.role === "LeagueAdmin" ? appUser.username : captainName
        }
        canManageLeague={appUser.role === "LeagueAdmin"}
        leagueOnly={appUser.role === "LeagueAdmin"}
        interclubCaptain={Boolean(captainInterclubContext)}
      />
      <MobileNav
        page={page}
        go={setPage}
        interclubCaptain={Boolean(captainInterclubContext)}
        leagueAdmin={appUser.role === "LeagueAdmin"}
        username={appUser.username}
        onLogout={signOut}
      />{" "}
      {integratedDashboard}
      {page === "dashboard" &&
        captainInterclubContext &&
        overdueLeagueMatches.length > 0 && (
          <button
            className="overdue-dashboard-warning"
            onClick={() => setPage("matches")}
          >
            <b>!</b>
            <span>
              <strong>
                {overdueLeagueMatches.length} past match
                {overdueLeagueMatches.length === 1 ? " is" : "es are"} still
                incomplete
              </strong>
              <small>
                The official final result has not been submitted. Review the
                match schedule.
              </small>
            </span>
            <i>Review →</i>
          </button>
        )}
      {page === "dashboard" && (
        <section className="content">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                {selectedSeason === "all"
                  ? "ALL SEASONS"
                  : seasons
                      .find((season) => season.id === selectedSeason)
                      ?.name.toUpperCase()}
              </p>
              <h1>Good afternoon, {captainName}</h1>
            </div>
            <div className="season-switcher">
              <select
                aria-label="Selected season"
                value={selectedSeason}
                onChange={(event) =>
                  setSelectedSeason(
                    event.target.value === "all"
                      ? "all"
                      : Number(event.target.value),
                  )
                }
              >
                <option value="all">All seasons</option>
                {seasons.map((season) => (
                  <option value={season.id} key={season.id}>
                    {season.name}
                    {season.status === "Active" ? " · Active" : ""}
                  </option>
                ))}
              </select>
              <button
                className="outline-btn"
                onClick={() => setPage("seasons")}
              >
                Manage
              </button>
            </div>
          </header>
          <section className="hero-card">
            <div className="hero-copy">
              <span className="status">
                {dashboard.nextMatch ? "YOUR NEXT ACTION" : "SCHEDULE"}
              </span>
              <h2>
                {dashboard.nextMatch ? (
                  <>
                    {teamName} <span>vs</span> {dashboard.nextMatch.opponent}
                  </>
                ) : (
                  "No upcoming match"
                )}
              </h2>
              <p>
                {dashboard.nextMatch
                  ? `${dashboard.nextMatch.matchDate} · ${dashboard.nextMatch.matchTime} · ${dashboard.nextMatch.location}`
                  : "Create a match to start selecting players and building the lineup."}
              </p>
              {dashboard.nextMatch && (
                <MatchJourney match={dashboard.nextMatch} />
              )}
            </div>
            <div className="hero-actions">
              {dashboard.nextMatch && (
                <div className="readiness">
                  <strong>
                    {matchProgress(dashboard.nextMatch).resultCount ||
                      dashboard.nextMatch.playerIds.length}
                  </strong>
                  <span>
                    {matchProgress(dashboard.nextMatch).resultCount
                      ? "results entered"
                      : "players selected"}
                  </span>
                </div>
              )}
              <button
                className="primary-btn"
                onClick={() =>
                  dashboard.nextMatch
                    ? continueMatch(dashboard.nextMatch)
                    : setPage("matches")
                }
              >
                {dashboard.nextMatch
                  ? `${matchProgress(dashboard.nextMatch).nextLabel} →`
                  : "Create match →"}
              </button>
            </div>
          </section>
          <section className="stats-grid">
            <article>
              <span>SEASON RECORD</span>
              <strong>
                {dashboard.teamWins}–{dashboard.teamLosses}
              </strong>
              <small>
                {report.completed} completed match
                {report.completed === 1 ? "" : "es"}
              </small>
            </article>
            <article>
              <span>WIN RATE</span>
              <strong>
                {report.played
                  ? `${Math.round((report.wins / report.played) * 100)}%`
                  : "—"}
              </strong>
              <small>
                {report.played
                  ? `${report.wins} wins in ${report.played} recorded games`
                  : "No results recorded"}
              </small>
            </article>
            <article>
              <span>ACTIVE PLAYERS</span>
              <strong>{activePlayers.length}</strong>
              <small>Chambly A roster</small>
            </article>
            <article>
              <span>NEXT OPPONENT</span>
              <strong className="pair-name">
                {dashboard.nextMatch?.opponent ?? "—"}
              </strong>
              <small>
                {dashboard.nextMatch
                  ? `${dashboard.nextMatch.matchDate} · ${dashboard.nextMatch.matchTime}`
                  : "No match scheduled"}
              </small>
            </article>
          </section>
          <section className="lineup-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">NEXT LINEUP</p>
                <h2>
                  {dashboard.nextMatch?.lineup?.length
                    ? "Saved lineup"
                    : "No lineup saved"}
                </h2>
                <p>
                  {dashboard.nextMatch?.lineup?.length
                    ? `Complete 8-round lineup for the match against ${dashboard.nextMatch.opponent}.`
                    : "Open a real match to generate and save its lineup."}
                </p>
              </div>
              <div className="section-actions">
                <button
                  className="ghost-btn"
                  onClick={() => setPage("players")}
                >
                  Manage players
                </button>
                <button
                  className="primary-btn"
                  onClick={() =>
                    dashboard.nextMatch
                      ? buildMatch(dashboard.nextMatch)
                      : setPage("matches")
                  }
                >
                  {dashboard.nextMatch ? "Open match →" : "Create match →"}
                </button>
              </div>
            </div>
            {dashboard.nextMatch?.lineup?.length ? (
              <LineupTable
                lineup={dashboard.nextMatch.lineup}
                editing={false}
                selected={null}
                onSwap={() => {}}
              />
            ) : (
              <div className="dashboard-empty-lineup">
                <span>▦</span>
                <strong>Your first real lineup will appear here.</strong>
              </div>
            )}
          </section>
        </section>
      )}
      {page === "builder" && (
        <section className="content builder-content">
          <header className="builder-header">
            <div>
              <button className="back-btn" onClick={() => setPage("matches")}>
                ← All matches
              </button>
              <p className="eyebrow">
                {activeMatch
                  ? `${activeMatch.matchDate} · ${activeMatch.matchTime} · ${activeMatch.location}`
                  : "LINEUP WORKSPACE"}
              </p>
              <h1>
                {activeMatch?.opponent
                  ? `${teamName} vs ${activeMatch.opponent}`
                  : "Lineup builder"}
              </h1>
              <p>
                Follow the steps below. PicklePilot keeps the whole match
                preparation in one place.
              </p>
            </div>
            <div className="save-state">
              <strong>{lastSaved ? "✓ Saved" : "Match workspace"}</strong>
              <span>
                {lastSaved
                  ? `Last saved at ${lastSaved}`
                  : "Save the lineup when it is ready"}
              </span>
            </div>
          </header>
          {activeMatch && <MatchJourney match={{ ...activeMatch, lineup }} />}
          <section className="setup-grid">
            <article className="setup-card roster-card">
              <div className="card-title">
                <div>
                  <span>1</span>
                  <div>
                    <h2>Available players</h2>
                    <p>Select exactly 8 players for this match.</p>
                  </div>
                </div>
                <strong
                  className={
                    available.length === 8 ? "ready-pill" : "warning-pill"
                  }
                >
                  {available.length}/8 selected
                </strong>
              </div>
              <div className="player-grid">
                {activePlayers.map((player) => (
                  <button
                    key={player.id}
                    className={
                      available.includes(player.id) ? "player active" : "player"
                    }
                    onClick={() =>
                      setAvailable((ids) =>
                        ids.includes(player.id)
                          ? ids.filter((id) => id !== player.id)
                          : ids.length < 8
                            ? [...ids, player.id]
                            : ids,
                      )
                    }
                  >
                    <span>{player.name.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <strong>{player.name}</strong>
                      <small>{player.gender === "W" ? "Women" : "Men"}</small>
                    </div>
                    <b>{available.includes(player.id) ? "✓" : "+"}</b>
                  </button>
                ))}
              </div>
              {activePlayers.length < 8 && (
                <button
                  className="inline-link"
                  onClick={() => setPage("players")}
                >
                  + Add players to complete the roster
                </button>
              )}
            </article>
            <article className="setup-card opponent-card best-lineup-card">
              <div className="card-title">
                <div>
                  <span>2</span>
                  <div>
                    <h2>Generate the best lineup</h2>
                    <p>
                      PicklePilot compares possible combinations using pair
                      rankings, game volume, required rules and active
                      preferences.
                    </p>
                  </div>
                </div>
              </div>
              <div className="best-lineup-note">
                <b>✦</b>
                <span>
                  <strong>Ranking-based optimization</strong>
                  <small>
                    Pairs without history start at a neutral score of 50.
                  </small>
                </span>
              </div>
              {available.length === 8 && !mixedReady && (
                <p className="mixed-roster-error">
                  Select at least 1 woman and 1 man to generate the required
                  mixed courts.
                </p>
              )}
              <button
                className="generate-main"
                disabled={available.length !== 8 || !mixedReady}
                onClick={generate}
              >
                Generate best lineup <span>✦</span>
              </button>
            </article>
          </section>
          <div className="builder-rules-summary">
            <div>
              <strong>
                {Object.values(rules).filter(Boolean).length} preferences active
              </strong>
              <span>Required competition rules are always enforced.</span>
            </div>
            <button className="ghost-btn" onClick={() => setPage("rules")}>
              Edit rules →
            </button>
          </div>
          <section className="builder-lineup">
            <div className="builder-lineup-head">
              <div>
                <p className="eyebrow">STEP 2 · 8 ROUNDS · 3 COURTS</p>
                <h2>Review your lineup</h2>
                <p>Swap players if needed, then save before printing.</p>
              </div>
              <div className="section-actions">
                <button
                  className={editing ? "edit-active" : "ghost-btn"}
                  onClick={() => {
                    setEditing(!editing);
                    setSelected(null);
                  }}
                >
                  {editing ? "Finish editing" : "Edit lineup"}
                </button>
                <button
                  className="ghost-btn"
                  disabled={available.length !== 8 || !mixedReady}
                  onClick={generate}
                >
                  Generate again ✦
                </button>
              </div>
            </div>
            <div
              className={
                validation.blocking.length
                  ? "validation warning"
                  : "validation success"
              }
            >
              <strong>
                {validation.blocking.length
                  ? `${validation.blocking.length} blocking error${validation.blocking.length > 1 ? "s" : ""}`
                  : "Ready to save"}
              </strong>
              <span>
                {validation.blocking.length
                  ? validation.blocking.slice(0, 3).join(" · ")
                  : "All Always on rules are respected."}
              </span>
            </div>
            {validation.warnings.length > 0 && (
              <div className="validation warning">
                <strong>
                  {validation.warnings.length} preference warning
                  {validation.warnings.length > 1 ? "s" : ""}
                </strong>
                <span>
                  {validation.warnings.slice(0, 3).join(" · ")} · You can still
                  save this lineup.
                </span>
              </div>
            )}
            <LineupTable
              lineup={lineup}
              editing={editing}
              selected={selected}
              onSwap={swapPlayer}
            />
            <div className="builder-footer">
              <span>
                {validation.blocking.length
                  ? "Fix all required-rule errors before saving the lineup."
                  : validation.warnings.length
                    ? "Preferences are warnings only; this lineup can be saved."
                    : activeMatch
                      ? "Everything is ready for the next step."
                      : "Open the builder from Matches to save this lineup."}
              </span>
              <div className="builder-footer-actions">
                {activeMatch?.lineup?.length === 8 && (
                  <button
                    className="ghost-btn"
                    onClick={() => openResults(activeMatch)}
                  >
                    Enter results
                  </button>
                )}
                {activeMatch?.lineup?.length === 8 && (
                  <button
                    className="ghost-btn"
                    onClick={() => openPrint(activeMatch)}
                  >
                    Print lineup
                  </button>
                )}
                <button
                  className="primary-btn"
                  disabled={
                    validation.blocking.length > 0 ||
                    available.length !== 8 ||
                    !mixedReady
                  }
                  onClick={saveLineup}
                >
                  {activeMatch?.lineup?.length === 8
                    ? "Save changes"
                    : "Save lineup"}{" "}
                  →
                </button>
              </div>
            </div>
          </section>
        </section>
      )}
      {page === "print" && activeMatch?.lineup && (
        <PrintLineup
          match={activeMatch}
          players={players}
          teamName={teamName}
          category={teamCategory}
          locale={locale}
          onBack={() => setPage("matches")}
        />
      )}
      {page === "rules" && (
        <section className="content rules-content">
          <header className="rules-header">
            <div>
              <p className="eyebrow">LINEUP CONFIGURATION</p>
              <h1>Rules</h1>
              <p>Set how PicklePilot should build and validate every lineup.</p>
            </div>
            <button className="primary-btn" onClick={() => setPage("builder")}>
              Back to lineup builder →
            </button>
          </header>
          <section className="rules-page-grid">
            <article className="rules-panel mandatory-panel">
              <div className="rules-panel-head">
                <span>✓</span>
                <div>
                  <p className="eyebrow">ALWAYS ON</p>
                  <h2>Required rules</h2>
                  <small>
                    These protect the competition format and cannot be disabled.
                  </small>
                </div>
              </div>
              <div className="mandatory-list">
                <div>
                  <b>8</b>
                  <span>
                    <strong>Eight selected players</strong>
                    <small>A complete roster is required.</small>
                  </span>
                </div>
                <div>
                  <b>6+2</b>
                  <span>
                    <strong>Six play, two rest</strong>
                    <small>Applied in every round.</small>
                  </span>
                </div>
                <div>
                  <b>1×</b>
                  <span>
                    <strong>One appearance per round</strong>
                    <small>No player can be on two courts.</small>
                  </span>
                </div>
                <div>
                  <b>M</b>
                  <span>
                    <strong>Required mixed courts</strong>
                    <small>Rounds 2, 3, 5 and 7.</small>
                  </span>
                </div>
              </div>
            </article>
            <article className="rules-panel preference-panel">
              <div className="rules-panel-head">
                <span>⚙</span>
                <div>
                  <p className="eyebrow">CUSTOMIZABLE</p>
                  <h2>Lineup preferences</h2>
                  <small>
                    Preferences generate warnings but never block saving.
                  </small>
                </div>
              </div>
              <div className="optional-rules">
                {(
                  [
                    [
                      "avoidConsecutivePartners",
                      "Avoid the same pair in consecutive rounds",
                    ],
                    [
                      "preferMaxTwo",
                      "Prefer no more than 2 games with the same partner",
                    ],
                    [
                      "blockAboveThree",
                      "Block more than 3 games with the same partner",
                    ],
                    ["avoidBackToBackRest", "Avoid back-to-back rests"],
                    ["avoidLongStreaks", "Avoid long streaks without rest"],
                  ] as [keyof RuleSettings, string][]
                ).map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={rules[key]}
                      onChange={() =>
                        setRules((current) => ({
                          ...current,
                          [key]: !current[key],
                        }))
                      }
                    />
                    <span>
                      <b>{rules[key] ? "✓" : ""}</b>
                      <i>
                        <strong>{label}</strong>
                        <small>{rules[key] ? "Active" : "Not applied"}</small>
                      </i>
                    </span>
                  </label>
                ))}
              </div>
            </article>
            <article className="rules-panel player-rules-panel">
              <div className="rules-panel-head">
                <span>2</span>
                <div>
                  <p className="eyebrow">PLAYER RELATIONSHIPS</p>
                  <h2>Player preferences</h2>
                  <small>
                    Choose preferred pairings. These create warnings and never
                    block saving.
                  </small>
                </div>
              </div>
              <div className="player-rule-form">
                <select
                  aria-label="First player"
                  value={ruleA}
                  onChange={(event) =>
                    setRuleA(Number(event.target.value) || "")
                  }
                >
                  <option value="">First player</option>
                  {activePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Rule type"
                  value={ruleType}
                  onChange={(event) =>
                    setRuleType(event.target.value as "Avoid" | "Required")
                  }
                >
                  <option value="Avoid">Should not play together</option>
                  <option value="Required">Should play together</option>
                </select>
                <select
                  aria-label="Second player"
                  value={ruleB}
                  onChange={(event) =>
                    setRuleB(Number(event.target.value) || "")
                  }
                >
                  <option value="">Second player</option>
                  {activePlayers
                    .filter((player) => player.id !== ruleA)
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
                {ruleType === "Required" && (
                  <label>
                    Games together
                    <select
                      value={ruleMinimum}
                      onChange={(event) =>
                        setRuleMinimum(Number(event.target.value))
                      }
                    >
                      <option value={1}>1 game</option>
                      <option value={2}>2 games</option>
                      <option value={3}>3 games</option>
                    </select>
                  </label>
                )}
                <button className="primary-btn" onClick={addPlayerRule}>
                  Add preference
                </button>
              </div>
              <div className="saved-player-rules">
                {playerRules.length === 0 ? (
                  <p>No specific player preferences yet.</p>
                ) : (
                  playerRules.map((rule) => {
                    const a =
                        players.find((player) => player.id === rule.playerAId)
                          ?.name ?? "Player",
                      b =
                        players.find((player) => player.id === rule.playerBId)
                          ?.name ?? "Player";
                    return (
                      <div key={rule.id}>
                        <span>
                          <strong>
                            {a} + {b}
                          </strong>
                          <small>
                            {rule.ruleType === "Avoid"
                              ? "Should not play together"
                              : `Should play together ${rule.minimumGames} time${rule.minimumGames === 1 ? "" : "s"}`}
                          </small>
                        </span>
                        <button onClick={() => removePlayerRule(rule.id)}>
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>
        </section>
      )}
      {page === "seasons" && (
        <section className="content seasons-content">
          <header className="players-header">
            <div>
              <p className="eyebrow">HISTORY</p>
              <h1>Seasons</h1>
              <p>
                Create and name each season yourself. Previous results remain
                saved.
              </p>
            </div>
            <button
              className="outline-btn"
              onClick={() => setPage("dashboard")}
            >
              ← Dashboard
            </button>
          </header>
          <section className="season-create-card">
            <div>
              <p className="eyebrow">ACTIVE SEASON</p>
              <h2>{activeSeason?.name ?? "No active season"}</h2>
              <p>
                {activeSeason
                  ? "Creating a new season closes the current one and preserves its complete history."
                  : "Choose any name to create your first season and begin adding matches."}
              </p>
            </div>
            <div>
              <label>
                {activeSeason ? "New season name" : "First season name"}
                <input
                  value={newSeasonName}
                  onChange={(event) => setNewSeasonName(event.target.value)}
                  placeholder="Enter any name"
                />
              </label>
              <button className="primary-btn" onClick={createSeason}>
                {activeSeason
                  ? "Close current & start new →"
                  : "Create first season →"}
              </button>
            </div>
          </section>
          <section className="season-history">
            <div className="season-history-head">
              <h2>Season history</h2>
              <button
                className="ghost-btn"
                onClick={() => {
                  setReportScope("all");
                  setPage("reports");
                }}
              >
                View all-time reports
              </button>
            </div>
            {[...seasons].reverse().map((season) => {
              const count = matches.filter(
                (match) => match.seasonId === season.id,
              ).length;
              return (
                <article key={season.id}>
                  <div>
                    <strong>{season.name}</strong>
                    <span
                      className={
                        season.status === "Active"
                          ? "season-active"
                          : "season-closed"
                      }
                    >
                      {season.status}
                    </span>
                  </div>
                  <p>
                    {count} match{count === 1 ? "" : "es"}
                  </p>
                  <button
                    onClick={() => {
                      setReportScope(
                        season.status === "Active" ? "current" : "all",
                      );
                      setPage("reports");
                    }}
                  >
                    {season.status === "Active"
                      ? "View current report →"
                      : "View all-time report →"}
                  </button>
                </article>
              );
            })}
          </section>
        </section>
      )}
      {(page === "leagueAdmin" ||
        page === "leagueTeams" ||
        page === "leagueLocations" ||
        page === "leagueSchedule" ||
        page === "leagueStandings" ||
        page === "leagueReports") && (
          <LeagueAdminPortal section={page} locale={locale} />
        )}
      {page === "venues" && (
        <section className="content venues-content">
          <header className="players-header">
            <div>
              <p className="eyebrow">MATCH LOCATIONS</p>
              <h1>Locations</h1>
              <p>
                Save the places used by your team. The selected location appears
                on the printed match sheet.
              </p>
            </div>
            <button className="outline-btn" onClick={() => setPage("matches")}>
              ← Matches
            </button>
          </header>
          <section className="venue-create-card">
            <label>
              Location name
              <input
                value={newVenueName}
                onChange={(event) => setNewVenueName(event.target.value)}
                placeholder="e.g. Sani Sport Boucherville"
                onKeyDown={(event) => {
                  if (event.key === "Enter") createVenue();
                }}
              />
            </label>
            <button
              className="primary-btn"
              onClick={createVenue}
              disabled={!newVenueName.trim()}
            >
              + Add location
            </button>
          </section>
          <section className="venue-list">
            {venues.length === 0 ? (
              <div className="venue-empty">
                <span>⌖</span>
                <h2>No locations yet</h2>
                <p>
                  Add Chambly, Sani Sport Boucherville, ZAC Pickleball or any
                  other place you use.
                </p>
              </div>
            ) : (
              venues.map((venue) => (
                <article key={venue.id}>
                  <div>
                    <span>⌖</span>
                    <strong>{venue.name}</strong>
                  </div>
                  <button
                    className={
                      venue.status === "Active"
                        ? "venue-active"
                        : "venue-inactive"
                    }
                    onClick={() => toggleVenue(venue)}
                  >
                    {venue.status}
                  </button>
                </article>
              ))
            )}
          </section>
        </section>
      )}
      {page === "opponents" && (
        <section className="content opponents-content">
          <header className="players-header">
            <div>
              <p className="eyebrow">OPPONENT DIRECTORY</p>
              <h1>Opponents</h1>
              <p>
                Save each city and team once. Its default strength will be
                suggested when creating a match.
              </p>
            </div>
            <button className="outline-btn" onClick={() => setPage("matches")}>
              ← Matches
            </button>
          </header>
          <section
            className={`opponent-create-card ${editingOpponent ? "editing-opponent" : ""}`}
          >
            <label>
              City
              <input
                value={opponentCity}
                onChange={(event) => setOpponentCity(event.target.value)}
                placeholder="e.g. Boucherville"
              />
            </label>
            <label>
              Team
              <input
                value={opponentTeam}
                onChange={(event) => setOpponentTeam(event.target.value)}
                placeholder="e.g. Performance A"
              />
            </label>
            <label>
              Default strength
              <select
                value={opponentDefaultStrength}
                onChange={(event) =>
                  setOpponentDefaultStrength(
                    event.target.value as "Weaker" | "Equal" | "Stronger",
                  )
                }
              >
                <option>Weaker</option>
                <option>Equal</option>
                <option>Stronger</option>
              </select>
            </label>
            <div className="opponent-form-actions">
              {editingOpponent && (
                <button className="ghost-btn" onClick={cancelOpponentEdit}>
                  Cancel
                </button>
              )}
              <button
                className="primary-btn"
                onClick={saveOpponent}
                disabled={!opponentCity.trim() || !opponentTeam.trim()}
              >
                {editingOpponent ? "Save changes" : "+ Add opponent"}
              </button>
            </div>
          </section>
          <section className="opponent-list">
            {opponents.length === 0 ? (
              <div className="venue-empty">
                <span>◎</span>
                <h2>No opponents yet</h2>
                <p>
                  Add a city, team and its usual strength. You can still
                  override the strength for any match.
                </p>
              </div>
            ) : (
              opponents.map((item) => (
                <article key={item.id}>
                  <div className="opponent-name">
                    <span>◎</span>
                    <div>
                      <strong>{item.teamName}</strong>
                      <small>{item.city}</small>
                    </div>
                  </div>
                  <span
                    className={`strength-badge ${item.defaultStrength.toLowerCase()}`}
                  >
                    {item.defaultStrength}
                  </span>
                  <button
                    className={
                      item.status === "Active"
                        ? "venue-active"
                        : "venue-inactive"
                    }
                    onClick={() => toggleOpponent(item)}
                  >
                    {item.status}
                  </button>
                  <div className="opponent-row-actions">
                    <button onClick={() => editOpponent(item)}>Edit</button>
                    <button
                      className="remove-opponent"
                      onClick={() => removeOpponent(item)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      )}
      {page === "results" && activeMatch?.lineup && (
        <section className="content results-content">
          <header className="results-header">
            <div>
              <button className="back-btn" onClick={() => setPage("matches")}>
                ← Matches
              </button>
              <p className="eyebrow">
                {activeMatch.matchDate} · {activeMatch.matchTime}
              </p>
              <h1>Results vs {activeMatch.opponent}</h1>
              <p>
                Mark one result for each pair. You can save and finish later.
              </p>
            </div>
            <div className="results-header-right">
              <button className="photo-import-btn" onClick={openPhotoImport}>
                ▣ Import photo
              </button>
              <div className="result-summary">
                <span>
                  <strong>{Object.keys(results).length}</strong>/24 entered
                </span>
                <span className="wins">
                  <strong>
                    {
                      Object.values(results).filter((value) => value === "W")
                        .length
                    }
                  </strong>{" "}
                  wins
                </span>
                <span className="losses">
                  <strong>
                    {
                      Object.values(results).filter((value) => value === "L")
                        .length
                    }
                  </strong>{" "}
                  losses
                </span>
              </div>
            </div>
          </header>
          <div className="results-progress">
            <i
              style={{ width: `${(Object.keys(results).length / 24) * 100}%` }}
            />
          </div>
          <section className="results-sheet-wrap">
            <div className="results-sheet">
              <div className="results-sheet-head">
                <span>ROUND</span>
                <span>COURT 1</span>
                <span>COURT 2</span>
                <span>COURT 3</span>
              </div>
              {activeMatch.lineup.map((round) => (
                <div className="results-sheet-row" key={round.round}>
                  <div className="result-round">
                    <strong>{round.round}</strong>
                    <small>
                      {
                        round.courts.filter(
                          (_, courtIndex) =>
                            results[`${round.round}-${courtIndex + 1}`],
                        ).length
                      }
                      /3 entered
                    </small>
                  </div>
                  {round.courts.map((pair, courtIndex) => {
                    const key = `${round.round}-${courtIndex + 1}`;
                    return (
                      <div
                        className={
                          mixedRequired.has(key)
                            ? "result-court-cell mixed-result-cell"
                            : "result-court-cell"
                        }
                        key={key}
                      >
                        <div className="result-pair">
                          <small>
                            {mixedRequired.has(key) ? "MIXED" : "PAIR"}
                          </small>
                          <strong>{pair[0]}</strong>
                          <strong>{pair[1]}</strong>
                        </div>
                        <div
                          className="result-buttons"
                          aria-label={`Round ${round.round}, court ${courtIndex + 1} result`}
                        >
                          <button
                            aria-label="Win"
                            className={
                              results[key] === "W" ? "win selected" : ""
                            }
                            onClick={() =>
                              setResults((current) => ({
                                ...current,
                                [key]: "W",
                              }))
                            }
                          >
                            W
                          </button>
                          <button
                            aria-label="Loss"
                            className={
                              results[key] === "L" ? "loss selected" : ""
                            }
                            onClick={() =>
                              setResults((current) => ({
                                ...current,
                                [key]: "L",
                              }))
                            }
                          >
                            L
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
          <div className="results-footer">
            <div>
              <strong>
                {Object.keys(results).length === 24
                  ? "All results are complete"
                  : "Results can be saved at any time"}
              </strong>
              <span>
                {Object.keys(results).length === 24
                  ? "Saving will complete this match."
                  : "Complete the remaining courts later."}
              </span>
            </div>
            <button className="primary-btn" onClick={saveResults}>
              {Object.keys(results).length === 24
                ? "Complete match →"
                : "Save results"}
            </button>
          </div>
          {showPhotoImport && (
            <div
              className="photo-modal-backdrop"
              onMouseDown={() => setShowPhotoImport(false)}
            >
              <section
                className="photo-import-modal"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <p className="eyebrow">
                      ASSISTED PHOTO IMPORT · SIMULATION
                    </p>
                    <h2>Read V / D from the score sheet</h2>
                    <span>
                      Pick a photo, review every suggestion, then apply it to
                      this match.
                    </span>
                  </div>
                  <button onClick={() => setShowPhotoImport(false)}>×</button>
                </header>
                {!photoPreview ? (
                  <label className="photo-drop">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        selectResultPhoto(event.target.files?.[0])
                      }
                    />
                    <b>＋</b>
                    <strong>Choose or take a photo</strong>
                    <span>JPG, PNG or phone camera</span>
                  </label>
                ) : (
                  <div className="photo-import-body">
                    <aside>
                      <img src={photoPreview} alt="Uploaded score sheet" />
                      <div>
                        <strong>{photoName}</strong>
                        <label>
                          Change photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              selectResultPhoto(event.target.files?.[0])
                            }
                          />
                        </label>
                      </div>
                    </aside>
                    <main>
                      <div className="scan-summary">
                        <div>
                          <strong>
                            {scanAnalyzed
                              ? `${Object.values(scanResults).filter((cell) => cell.value).length}/24 read`
                              : "Ready to analyze"}
                          </strong>
                          <span>
                            {scanAnalyzed
                              ? `${Object.values(scanResults).filter((cell) => !cell.value).length} need confirmation`
                              : "The original photo is never changed."}
                          </span>
                        </div>
                        <button
                          className="primary-btn"
                          onClick={simulatePhotoReading}
                        >
                          {scanAnalyzed
                            ? "Analyze again"
                            : "Simulate reading ✦"}
                        </button>
                      </div>
                      {scanAnalyzed && (
                        <div className="scan-grid">
                          <div className="scan-grid-head">
                            <span>ROUND</span>
                            <span>COURT 1</span>
                            <span>COURT 2</span>
                            <span>COURT 3</span>
                          </div>
                          {Array.from({ length: 8 }, (_, roundIndex) => (
                            <div className="scan-row" key={roundIndex}>
                              <strong>{roundIndex + 1}</strong>
                              {[0, 1, 2].map((courtIndex) => {
                                const key = `${roundIndex + 1}-${courtIndex + 1}`,
                                  cell = scanResults[key];
                                return (
                                  <div
                                    className={`scan-cell ${cell?.confidence || "low"}`}
                                    key={key}
                                  >
                                    <div>
                                      <button
                                        className={
                                          cell?.value === "W"
                                            ? "selected win"
                                            : ""
                                        }
                                        onClick={() =>
                                          setScanResults((current) => ({
                                            ...current,
                                            [key]: {
                                              value: "W",
                                              confidence: "high",
                                            },
                                          }))
                                        }
                                      >
                                        V
                                      </button>
                                      <button
                                        className={
                                          cell?.value === "L"
                                            ? "selected loss"
                                            : ""
                                        }
                                        onClick={() =>
                                          setScanResults((current) => ({
                                            ...current,
                                            [key]: {
                                              value: "L",
                                              confidence: "high",
                                            },
                                          }))
                                        }
                                      >
                                        D
                                      </button>
                                      <button
                                        className={
                                          cell?.value === null
                                            ? "selected unknown"
                                            : ""
                                        }
                                        onClick={() =>
                                          setScanResults((current) => ({
                                            ...current,
                                            [key]: {
                                              value: null,
                                              confidence: "low",
                                            },
                                          }))
                                        }
                                      >
                                        ?
                                      </button>
                                    </div>
                                    <small>
                                      {cell?.confidence === "high"
                                        ? "Clear"
                                        : cell?.confidence === "medium"
                                          ? "Check"
                                          : "Unreadable"}
                                    </small>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </main>
                  </div>
                )}
                <footer>
                  <span>
                    {scanAnalyzed
                      ? "Green = clear · Amber = check · Red = unreadable"
                      : "Upload a score sheet to begin."}
                  </span>
                  <button
                    className="primary-btn"
                    disabled={!scanAnalyzed}
                    onClick={applyPhotoReading}
                  >
                    Apply confirmed results →
                  </button>
                </footer>
              </section>
            </div>
          )}
        </section>
      )}
      {page === "reports" && (
        <section className="content reports-content">
          <header className="reports-header">
            <div>
              <p className="eyebrow">TEAM RESULTS</p>
              <h1>Reports</h1>
              <p>Results update automatically whenever a match is saved.</p>
            </div>
            <button className="outline-btn" onClick={() => setPage("matches")}>
              View matches →
            </button>
          </header>
          <div className="report-scope">
            <div>
              <strong>Analysis period</strong>
              <span>
                {reportScope === "current"
                  ? (activeSeason?.name ?? "Current season")
                  : "Complete team history"}
              </span>
            </div>
            <div role="group" aria-label="Report analysis period">
              <button
                className={reportScope === "current" ? "active" : ""}
                onClick={() => setReportScope("current")}
              >
                Current season
              </button>
              <button
                className={reportScope === "all" ? "active" : ""}
                onClick={() => setReportScope("all")}
              >
                All-time
              </button>
            </div>
          </div>
          <section className="report-summary">
            <article>
              <span>RECORDED GAMES</span>
              <strong>{report.played}</strong>
              <small>
                {report.completed} completed match
                {report.completed === 1 ? "" : "es"}
              </small>
            </article>
            <article>
              <span>WINS</span>
              <strong className="report-win">{report.wins}</strong>
              <small>
                {report.played
                  ? Math.round((report.wins / report.played) * 100)
                  : 0}
                % win rate
              </small>
            </article>
            <article>
              <span>LOSSES</span>
              <strong className="report-loss">{report.losses}</strong>
              <small>
                {report.played
                  ? Math.round((report.losses / report.played) * 100)
                  : 0}
                % of games
              </small>
            </article>
            <article>
              <span>ACTIVE PAIRS</span>
              <strong>{report.ranking.length}</strong>
              <small>with saved results</small>
            </article>
          </section>
          <section className="pair-ranking">
            <div className="pair-ranking-head">
              <div>
                <h2>
                  {reportEntity === "pairs" ? "Pair ranking" : "Player ranking"}
                </h2>
                <p>
                  {reportView === "real"
                    ? "Actual results, without adjustment."
                    : "Adjusted for opponent strength and number of games."}
                </p>
              </div>
              <span>
                {reportScope === "current"
                  ? (activeSeason?.name ?? "CURRENT SEASON").toUpperCase()
                  : "ALL SEASONS"}
              </span>
            </div>
            <div className="entity-tabs">
              <button
                className={reportEntity === "pairs" ? "active" : ""}
                onClick={() => setReportEntity("pairs")}
              >
                By pair
              </button>
              <button
                className={reportEntity === "players" ? "active" : ""}
                onClick={() => setReportEntity("players")}
              >
                By player
              </button>
            </div>
            <div className="ranking-tabs">
              <button
                className={reportView === "real" ? "active" : ""}
                onClick={() => {
                  setReportView("real");
                  if (reportSort === "score") setReportSort("rate");
                }}
              >
                Real ranking
              </button>
              <button
                className={reportView === "adjusted" ? "active" : ""}
                onClick={() => {
                  setReportView("adjusted");
                  setReportSort("score");
                  setReportSortDirection("desc");
                }}
              >
                Adjusted ranking
              </button>
              <small>
                {reportView === "adjusted"
                  ? "The score starts at 50 and becomes more reliable as games are played."
                  : "No weighting: wins ÷ games played"}
              </small>
            </div>
            {reportView === "adjusted" && (
              <div className="score-legend">
                <div>
                  <span>0 · Avoid pairing</span>
                  <span>50 · Neutral</span>
                  <span>100 · Strong pairing</span>
                </div>
                <i />
                <p>
                  The adjusted score is not a win percentage. It compares each
                  result with the expected result for the opponent level and
                  reduces distortion from very few games.
                </p>
              </div>
            )}
            {(reportEntity === "pairs" ? report.ranking : report.playerRanking)
              .length === 0 ? (
              <div className="empty-report">
                <span>↗</span>
                <h3>No results yet</h3>
                <p>
                  Enter the first match results and this ranking will appear
                  here automatically.
                </p>
                <button
                  className="primary-btn"
                  onClick={() => setPage("matches")}
                >
                  Go to matches
                </button>
              </div>
            ) : (
              <div
                className={`ranking-table ${reportView === "adjusted" ? "adjusted-table" : ""}`}
              >
                <div className="ranking-row ranking-labels">
                  <span>RANK</span>
                  <span>{reportEntity === "pairs" ? "PAIR" : "PLAYER"}</span>
                  <button onClick={() => sortReport("played")}>
                    PLAYED{" "}
                    {reportSort === "played"
                      ? reportSortDirection === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </button>
                  <button onClick={() => sortReport("wins")}>
                    W{" "}
                    {reportSort === "wins"
                      ? reportSortDirection === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </button>
                  <button onClick={() => sortReport("losses")}>
                    L{" "}
                    {reportSort === "losses"
                      ? reportSortDirection === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </button>
                  <button onClick={() => sortReport("rate")}>
                    WIN %{" "}
                    {reportSort === "rate"
                      ? reportSortDirection === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </button>
                  {reportView === "adjusted" && (
                    <button onClick={() => sortReport("score")}>
                      SCORE{" "}
                      {reportSort === "score"
                        ? reportSortDirection === "desc"
                          ? "↓"
                          : "↑"
                        : "↕"}
                    </button>
                  )}
                </div>
                {sortedReport.map((item, index) => {
                  const rate = Math.round(item.rate);
                  const score = Math.round(item.score);
                  const rowColor = `hsl(${score * 1.2} 58% ${94 - Math.abs(score - 50) * 0.16}%)`;
                  return (
                    <div
                      className="ranking-row"
                      style={
                        reportView === "adjusted"
                          ? { background: rowColor }
                          : undefined
                      }
                      key={item.players.join("|")}
                    >
                      <span className="ranking-position">{index + 1}</span>
                      <div className="ranking-pair">
                        <span>
                          {item.players
                            .map((name) => name.slice(0, 1))
                            .join("")}
                        </span>
                        <strong>{item.players.join(" + ")}</strong>
                      </div>
                      <span>{item.played}</span>
                      <span className="ranking-win">{item.wins}</span>
                      <span className="ranking-loss">{item.losses}</span>
                      <div className="ranking-rate">
                        <strong>{rate}%</strong>
                        <i>
                          <b style={{ width: `${rate}%` }} />
                        </i>
                      </div>
                      {reportView === "adjusted" && (
                        <span
                          className="ranking-score"
                          title="Adjusted score from 0 to 100"
                        >
                          {score}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      )}
      {page === "matches" && (
        <section
          className={`content matches-content ${captainInterclubContext ? "integrated-captain" : ""}`}
        >
          <header className="players-header">
            <div>
              <p className="eyebrow">
                {captainInterclubContext
                  ? `${captainInterclubContext.seasonName} · ${captainInterclubContext.divisionName}`
                  : "MATCH SCHEDULE"}
              </p>
              <h1>
                {captainInterclubContext
                  ? captainInterclubContext.teamName
                  : "Matches"}
              </h1>
              <p>
                {captainInterclubContext
                  ? "The league creates your schedule. Open an assigned match to prepare the team and lineup."
                  : "Create a match, confirm availability and build the lineup."}
              </p>
            </div>
            {!captainInterclubContext && (
              <button className="primary-btn" onClick={() => openMatchForm()}>
                + New match
              </button>
            )}
          </header>
          {captainInterclubContext && assignedLeagueMatches.length > 0 && (
            <section className="matches-list interclub-captain-matches">
              {assignedLeagueMatches
                .sort((a, b) => a.matchDate.localeCompare(b.matchDate))
                .map((leagueMatch) => {
                  const opponentName =
                    leagueMatch.homeTeamId === assignedLeagueTeamId
                      ? leagueMatch.visitorTeamName
                      : leagueMatch.homeTeamName;
                  const localMatch = matches.find(
                    (item) =>
                      item.matchDate === leagueMatch.matchDate &&
                      item.opponent === opponentName,
                  );
                  const flow = localMatch ? matchProgress(localMatch) : null;
                  const officialComplete = leagueMatch.status === "Completed";
                  return (
                    <article
                      className={`match-card guided-match-card ${officialComplete ? "official-complete" : "official-pending"}`}
                      key={leagueMatch.id}
                    >
                      <div className="match-date">
                        <strong>
                          {new Date(
                            `${leagueMatch.matchDate}T12:00:00`,
                          ).toLocaleDateString(localeCode(locale), { day: "2-digit" })}
                        </strong>
                        <span>
                          {new Date(`${leagueMatch.matchDate}T12:00:00`)
                            .toLocaleDateString(localeCode(locale), { month: "short" })
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="match-info">
                        <p className="eyebrow">
                          {officialComplete
                            ? "OFFICIAL RESULT CONFIRMED"
                            : "AWAITING OFFICIAL RESULT"}{" "}
                          · {leagueMatch.matchTime} ·{" "}
                          {captainInterclubContext.seasonName}
                        </p>
                        <div className="captain-fixture">
                          <div>
                            <small>HOME · SENDS RESULT</small>
                            <strong>{leagueMatch.homeTeamName}</strong>
                          </div>
                          <b>VS</b>
                          <div>
                            <small>VISITOR</small>
                            <strong>{leagueMatch.visitorTeamName}</strong>
                          </div>
                        </div>
                        <p>
                          {leagueMatch.venueName} · Courts{" "}
                          {leagueMatch.courts.join(", ")} ·{" "}
                          {captainInterclubContext.divisionName}
                        </p>
                        {leagueMatch.rescheduleComment && (
                          <p className="schedule-update">
                            Schedule update: {leagueMatch.rescheduleComment}
                          </p>
                        )}
                        {localMatch ? (
                          <MatchJourney
                            match={{
                              ...localMatch,
                              status: officialComplete
                                ? "Completed"
                                : "Upcoming",
                            }}
                          />
                        ) : (
                          <div
                            className="match-journey"
                            aria-label="Match preparation progress"
                          >
                            {["Players", "Lineup", "Print", "Results"].map(
                              (label, index) => (
                                <div
                                  key={label}
                                  className={index === 0 ? "current" : ""}
                                >
                                  <b>{index + 1}</b>
                                  <span>{label}</span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                      <div className="match-actions">
                        <span
                          className={
                            officialComplete
                              ? "completed-pill"
                              : localMatch?.lineup?.length === 8
                                ? "saved-pill"
                                : localMatch?.playerIds.length === 8
                                  ? "ready-pill"
                                  : "warning-pill"
                          }
                        >
                          {officialComplete
                            ? "Official result sent"
                            : flow?.resultCount
                              ? `${flow.resultCount}/24 results`
                              : localMatch?.lineup?.length === 8
                                ? "Lineup saved"
                                : `${localMatch?.playerIds.length ?? 0}/8 players`}
                        </span>
                        {localMatch?.lineup?.length === 8 && (
                          <button
                            className="ghost-btn"
                            onClick={() => openPrint(localMatch)}
                          >
                            Print
                          </button>
                        )}
                        <button
                          className="primary-btn"
                          disabled={preparingLeagueMatch === leagueMatch.id}
                          onClick={() =>
                            localMatch
                              ? continueMatch(localMatch)
                              : prepareAssignedMatch(leagueMatch)
                          }
                        >
                          {preparingLeagueMatch === leagueMatch.id
                            ? "Preparing…"
                            : (flow?.nextLabel ?? "Build lineup")}{" "}
                          →
                        </button>
                        {leagueMatch.homeTeamId === assignedLeagueTeamId && (
                          <button
                            className="ghost-btn"
                            onClick={() => {
                              setAssignedResultMatch(leagueMatch);
                              setAssignedOutcome(
                                leagueMatch.resultOutcome ?? "",
                              );
                              setAssignedWinnerWins(
                                leagueMatch.resultOutcome === "Home"
                                  ? (leagueMatch.homeWins ?? "")
                                  : leagueMatch.resultOutcome === "Visitor"
                                    ? (leagueMatch.visitorWins ?? "")
                                    : "",
                              );
                            }}
                          >
                            {officialComplete
                              ? "Correct official result"
                              : "Submit official result"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
            </section>
          )}
          {!captainInterclubContext &&
            (seasonMatches.length === 0 ? (
              <section className="empty-matches">
                <span>◇</span>
                <h2>
                  {activeSeason
                    ? "No matches in this season"
                    : "Create your first season"}
                </h2>
                <p>
                  {activeSeason
                    ? `Create the first match for ${activeSeason.name}.`
                    : "Name your season before adding matches and results."}
                </p>
                <button
                  className="primary-btn"
                  onClick={
                    activeSeason
                      ? () => openMatchForm()
                      : () => setPage("seasons")
                  }
                >
                  {activeSeason ? "Create first match" : "Go to seasons"}
                </button>
              </section>
            ) : (
              <section className="matches-list">
                {seasonMatches.map((match) => {
                  const flow = matchProgress(match);
                  return (
                    <article
                      className="match-card guided-match-card"
                      key={match.id}
                    >
                      <div className="match-date">
                        <strong>
                          {new Date(
                            match.matchDate + "T12:00:00",
                          ).toLocaleDateString(localeCode(locale), { day: "2-digit" })}
                        </strong>
                        <span>
                          {new Date(match.matchDate + "T12:00:00")
                            .toLocaleDateString(localeCode(locale), { month: "short" })
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="match-info">
                        <p className="eyebrow">
                          {match.status} · {match.matchTime} ·{" "}
                          {
                            seasons.find(
                              (season) => season.id === match.seasonId,
                            )?.name
                          }
                        </p>
                        <h2>
                          {teamName} <span>vs</span> {match.opponent}
                        </h2>
                        <p>
                          {match.location} · {match.opponentStrength} opponent
                        </p>
                        <MatchJourney match={match} />
                      </div>
                      <div className="match-actions">
                        <span
                          className={
                            match.status === "Completed"
                              ? "completed-pill"
                              : match.lineup?.length === 8
                                ? "saved-pill"
                                : match.playerIds.length === 8
                                  ? "ready-pill"
                                  : "warning-pill"
                          }
                        >
                          {match.status === "Completed"
                            ? "Completed"
                            : flow.resultCount
                              ? `${flow.resultCount}/24 results`
                              : match.lineup?.length === 8
                                ? "Lineup saved"
                                : `${match.playerIds.length}/8 players`}
                        </span>
                        <button
                          className="ghost-btn"
                          onClick={() => openMatchForm(match)}
                        >
                          Edit match
                        </button>
                        {match.lineup?.length === 8 && (
                          <button
                            className="ghost-btn"
                            onClick={() => openPrint(match)}
                          >
                            Print
                          </button>
                        )}
                        <button
                          className="primary-btn"
                          onClick={() => continueMatch(match)}
                        >
                          {flow.nextLabel} →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            ))}
          {captainInterclubContext && assignedLeagueMatches.length === 0 && (
            <section className="empty-matches">
              <span>◇</span>
              <h2>No league matches assigned yet</h2>
              <p>
                Your season and division are already configured. Matches will
                appear here when the league publishes the schedule.
              </p>
            </section>
          )}
          {assignedResultMatch && (
            <div
              className="modal-backdrop"
              onMouseDown={() => setAssignedResultMatch(null)}
            >
              <form
                className="player-modal league-season-modal"
                onSubmit={submitAssignedResult}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="modal-head">
                  <div>
                    <p className="eyebrow">OFFICIAL INTERCLUB RESULT</p>
                    <h2>Who won the game night?</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignedResultMatch(null)}
                  >
                    ×
                  </button>
                </div>
                <p className="league-modal-intro">
                  Select the winner or a tie. For a victory, enter the winner's
                  total from 13 to 24.
                </p>
                <div className="outcome-options">
                  <button
                    type="button"
                    className={assignedOutcome === "Home" ? "selected" : ""}
                    onClick={() => setAssignedOutcome("Home")}
                  >
                    {assignedResultMatch.homeTeamName}
                    <small>Home team won</small>
                  </button>
                  <button
                    type="button"
                    className={assignedOutcome === "Tie" ? "selected" : ""}
                    onClick={() => {
                      setAssignedOutcome("Tie");
                      setAssignedWinnerWins("");
                    }}
                  >
                    Tie<small>Automatically recorded as 12–12</small>
                  </button>
                  <button
                    type="button"
                    className={assignedOutcome === "Visitor" ? "selected" : ""}
                    onClick={() => setAssignedOutcome("Visitor")}
                  >
                    {assignedResultMatch.visitorTeamName}
                    <small>Visitor team won</small>
                  </button>
                </div>
                {assignedOutcome && assignedOutcome !== "Tie" && (
                  <label className="winner-wins-field">
                    Winning team's victories
                    <input
                      required
                      autoFocus
                      type="number"
                      min={13}
                      max={24}
                      value={assignedWinnerWins}
                      onChange={(event) =>
                        setAssignedWinnerWins(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                    />
                    <small>
                      The other team will be{" "}
                      {assignedWinnerWins === ""
                        ? "calculated automatically"
                        : `${24 - Number(assignedWinnerWins)} victories`}
                      .
                    </small>
                  </label>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setAssignedResultMatch(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-btn"
                    disabled={
                      !assignedOutcome ||
                      (assignedOutcome !== "Tie" &&
                        (assignedWinnerWins === "" ||
                          Number(assignedWinnerWins) < 13 ||
                          Number(assignedWinnerWins) > 24))
                    }
                  >
                    Confirm official result
                  </button>
                </div>
              </form>
            </div>
          )}
          {showMatchForm && (
            <div
              className="modal-backdrop"
              onMouseDown={() => {
                setShowMatchForm(false);
                setEditingMatch(null);
              }}
            >
              <form
                className="player-modal match-modal"
                onSubmit={saveMatch}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="modal-head">
                  <div>
                    <p className="eyebrow">{teamName.toUpperCase()}</p>
                    <h2>{editingMatch ? "Edit match" : "Create match"}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMatchForm(false);
                      setEditingMatch(null);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="match-fields">
                  <label>
                    Opponent
                    <select
                      autoFocus
                      required
                      value={matchOpponent}
                      onChange={(event) => {
                        const value = event.target.value;
                        setMatchOpponent(value);
                        const selectedOpponent = opponents.find(
                          (item) => opponentLabel(item) === value,
                        );
                        if (selectedOpponent)
                          setMatchStrength(selectedOpponent.defaultStrength);
                      }}
                    >
                      <option value="">Select an opponent</option>
                      {matchOpponent &&
                        !opponents.some(
                          (item) => opponentLabel(item) === matchOpponent,
                        ) && (
                          <option value={matchOpponent}>{matchOpponent}</option>
                        )}
                      {opponents
                        .filter(
                          (item) =>
                            item.status === "Active" ||
                            opponentLabel(item) === matchOpponent,
                        )
                        .map((item) => (
                          <option key={item.id} value={opponentLabel(item)}>
                            {item.city} — {item.teamName}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="field-link"
                      onClick={() => {
                        setShowMatchForm(false);
                        setEditingMatch(null);
                        setPage("opponents");
                      }}
                    >
                      Manage opponents
                    </button>
                  </label>
                  <label>
                    Date
                    <input
                      required
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Time
                    <input
                      required
                      type="time"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                    />
                  </label>
                  <label>
                    Location
                    <select
                      required
                      value={matchLocation}
                      onChange={(e) => setMatchLocation(e.target.value)}
                    >
                      <option value="">Select a location</option>
                      {venues
                        .filter(
                          (venue) =>
                            venue.status === "Active" ||
                            venue.name === matchLocation,
                        )
                        .map((venue) => (
                          <option key={venue.id} value={venue.name}>
                            {venue.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="field-link"
                      onClick={() => {
                        setShowMatchForm(false);
                        setEditingMatch(null);
                        setPage("venues");
                      }}
                    >
                      Manage locations
                    </button>
                  </label>
                </div>
                <fieldset>
                  <legend>Home or visitor</legend>
                  <div className="gender-options">
                    <button
                      type="button"
                      className={matchHomeAway === "Local" ? "selected" : ""}
                      onClick={() => setMatchHomeAway("Local")}
                    >
                      Local
                    </button>
                    <button
                      type="button"
                      className={matchHomeAway === "Visitor" ? "selected" : ""}
                      onClick={() => setMatchHomeAway("Visitor")}
                    >
                      Visitor
                    </button>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Court numbers</legend>
                  <div className="court-number-fields">
                    {matchCourts.map((court, index) => (
                      <label key={index}>
                        Court {index + 1}
                        <input
                          required
                          value={court}
                          onChange={(e) =>
                            setMatchCourts((current) =>
                              current.map((value, i) =>
                                i === index ? e.target.value : value,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Opponent strength for this match</legend>
                  <div className="gender-options">
                    {(["Weaker", "Equal", "Stronger"] as const).map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={matchStrength === value ? "selected" : ""}
                        onClick={() => setMatchStrength(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="form-note">
                    The saved default is suggested automatically, but you can
                    override it for this match.
                  </p>
                </fieldset>
                <fieldset>
                  <legend>
                    Available players · {matchPlayers.length}/8 selected
                  </legend>
                  {editingMatch?.lineup?.length === 8 && (
                    <p className="form-note">
                      Changing selected players may require adjusting the saved
                      lineup.
                    </p>
                  )}
                  <div className="match-player-picker">
                    {activePlayers.map((player) => (
                      <button
                        type="button"
                        key={player.id}
                        className={
                          matchPlayers.includes(player.id) ? "selected" : ""
                        }
                        onClick={() =>
                          setMatchPlayers((ids) =>
                            ids.includes(player.id)
                              ? ids.filter((id) => id !== player.id)
                              : ids.length < 8
                                ? [...ids, player.id]
                                : ids,
                          )
                        }
                      >
                        {player.name}
                        <span>
                          {matchPlayers.includes(player.id) ? "✓" : "+"}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      setShowMatchForm(false);
                      setEditingMatch(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-btn"
                    disabled={
                      matchPlayers.length !== 8 ||
                      !matchLocation ||
                      !matchOpponent
                    }
                  >
                    {editingMatch ? "Save changes" : "Create match"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
      {page === "players" && (
        <section className="content players-content">
          <header className="players-header">
            <div>
              <p className="eyebrow">TEAM MANAGEMENT</p>
              <h1>Teams & players</h1>
              <p>Keep your roster ready for every match.</p>
            </div>
            <button className="primary-btn" onClick={() => openForm()}>
              + Add player
            </button>
          </header>
          <section className="team-card">
            <div>
              <span className="team-badge">
                {(captainInterclubContext?.teamName ?? teamName)
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div>
                <p className="eyebrow">YOUR TEAM</p>
                <h2>{captainInterclubContext?.teamName ?? teamName}</h2>
                <small>
                  {captainInterclubContext
                    ? `${captainInterclubContext.seasonName} · ${captainInterclubContext.divisionName}`
                    : (activeSeason?.name ?? "No active season")}
                </small>
              </div>
            </div>
            {!captainInterclubContext && (
              <div className="team-name-edit">
                <label>
                  Captain
                  <input
                    aria-label="Captain name"
                    value={captainNameDraft}
                    onChange={(event) =>
                      setCaptainNameDraft(event.target.value)
                    }
                  />
                </label>
                <label>
                  Team
                  <input
                    aria-label="Team name"
                    value={teamNameDraft}
                    onChange={(event) => setTeamNameDraft(event.target.value)}
                  />
                </label>
                <button onClick={saveTeamName}>Save</button>
              </div>
            )}
            <div className="team-counts">
              <span>
                <strong>{players.length}</strong>Total
              </span>
              <span>
                <strong>{activePlayers.length}</strong>Active
              </span>
              <span>
                <strong>
                  {
                    players.filter(
                      (p) => p.gender === "W" && p.status === "Active",
                    ).length
                  }
                </strong>
                Women
              </span>
              <span>
                <strong>
                  {
                    players.filter(
                      (p) => p.gender === "M" && p.status === "Active",
                    ).length
                  }
                </strong>
                Men
              </span>
            </div>
          </section>
          {captainInterclubContext ? (
            <section className="team-category-card interclub-division-card">
              <div>
                <p className="eyebrow">ASSIGNED BY THE LEAGUE</p>
                <h2>Division {captainInterclubContext.divisionName}</h2>
                <p>
                  The season, division, opponents and locations are managed by
                  the Interclub administrator.
                </p>
              </div>
              <span>Locked</span>
            </section>
          ) : (
            <section className="team-category-card">
              <div>
                <p className="eyebrow">TEAM CATEGORY</p>
                <h2>Competition level</h2>
                <p>
                  Separate from the season name and shown on the printed match
                  sheet.
                </p>
              </div>
              <div className="category-options">
                <button
                  className={teamCategory === "Performance" ? "active" : ""}
                  onClick={() => setTeamCategory("Performance")}
                >
                  Performance
                </button>
                <button
                  className={teamCategory === "Development" ? "active" : ""}
                  onClick={() => setTeamCategory("Development")}
                >
                  Development
                </button>
                <button className="category-save" onClick={saveTeamName}>
                  Save category
                </button>
              </div>
            </section>
          )}
          <section className="roster-panel">
            <div className="roster-heading">
              <div>
                <h2>Player roster</h2>
                <p>
                  {captainInterclubContext
                    ? "Open an assigned match to select its eight players."
                    : "Active players are available in the Lineup Builder."}
                </p>
              </div>
              {!captainInterclubContext && (
                <button
                  className="ghost-btn"
                  onClick={() => setPage("builder")}
                >
                  Open Lineup Builder →
                </button>
              )}
            </div>
            <div className="roster-table">
              <div className="roster-row roster-labels">
                <span>PLAYER</span>
                <span>DIVISION</span>
                <span>STATUS</span>
                <span>ACTIONS</span>
              </div>
              {players.map((player) => (
                <div className="roster-row" key={player.id}>
                  <div className="roster-person">
                    <span>{player.name.slice(0, 2).toUpperCase()}</span>
                    <strong>{player.name}</strong>
                  </div>
                  <div>{player.gender === "W" ? "Women" : "Men"}</div>
                  <button
                    className={`status-toggle ${player.status.toLowerCase()}`}
                    onClick={() => toggleStatus(player)}
                  >
                    <i />
                    {player.status}
                  </button>
                  <div className="row-actions">
                    <button onClick={() => openForm(player)}>Edit</button>
                    <button
                      className="delete-action"
                      onClick={() => removePlayer(player)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {showForm && (
            <div
              className="modal-backdrop"
              onMouseDown={() => setShowForm(false)}
            >
              <form
                className="player-modal"
                onSubmit={savePlayer}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="modal-head">
                  <div>
                    <p className="eyebrow">CHAMBLY A</p>
                    <h2>{editingPlayer ? "Edit player" : "Add a player"}</h2>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)}>
                    ×
                  </button>
                </div>
                <label>
                  Player name
                  <input
                    autoFocus
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <fieldset>
                  <legend>Division</legend>
                  <div className="gender-options">
                    <button
                      type="button"
                      className={playerGender === "W" ? "selected" : ""}
                      onClick={() => setPlayerGender("W")}
                    >
                      Women
                    </button>
                    <button
                      type="button"
                      className={playerGender === "M" ? "selected" : ""}
                      onClick={() => setPlayerGender("M")}
                    >
                      Men
                    </button>
                  </div>
                </fieldset>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-btn">
                    {editingPlayer ? "Save changes" : "Add player"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
      {notice && <div className="toast">✓ {notice}</div>}
      <button className="logout-button" onClick={signOut}>
        Sign out · {appUser.username}
      </button>
    </main>
  );
}

function LeagueAdminPortal({
  section,
  locale,
}: {
  section:
    | "leagueAdmin"
    | "leagueTeams"
    | "leagueLocations"
    | "leagueSchedule"
    | "leagueStandings"
    | "leagueReports";
  locale: Locale;
}) {
  type LeagueSeason = {
    id: number;
    name: string;
    status: "Active" | "Closed";
    createdAt: string;
  };
  type LeagueLevel = {
    id: number;
    seasonId: number;
    name: string;
    status: "Active" | "Inactive";
    displayOrder: number;
  };
  type LeagueTeam = {
    id: number;
    seasonId: number;
    levelId: number;
    city: string;
    teamName: string;
    captainUserId?: number;
  };
  type LeagueCaptain = {
    userId: number;
    leagueTeamId: number;
    displayName: string;
    email: string;
    phone?: string;
    username: string;
    mustChangePassword: boolean;
  };
  type LeagueVenue = {
    id: number;
    name: string;
    address?: string;
    venueType: "Indoor" | "Outdoor";
    courts: string[];
    status: "Active" | "Inactive";
  };
  type LeagueMatch = {
    id: number;
    seasonId: number;
    levelId: number;
    venueId: number;
    matchDate: string;
    matchTime: string;
    homeTeamId: number;
    visitorTeamId: number;
    courts: string[];
    homeWins: number | null;
    visitorWins: number | null;
    resultOutcome: "Home" | "Visitor" | "Tie" | null;
    rescheduleComment?: string | null;
    status: string;
  };
  type LeagueReportRow = {
    name: string;
    played: number;
    wins: number;
    losses: number;
    rate: number;
    score: number;
  };
  type LeagueTeamReport = {
    teamId: number;
    teamName: string;
    seasonId: number;
    seasonName: string;
    rosterCount: number;
    pairs: LeagueReportRow[];
    players: LeagueReportRow[];
  };
  type NightGame = {
    levelId: number | "";
    homeTeamId: number | "";
    visitorTeamId: number | "";
    courts: string[];
  };
  const [seasons, setSeasons] = useState<LeagueSeason[]>([]),
    [levels, setLevels] = useState<LeagueLevel[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false),
    [seasonName, setSeasonName] = useState(""),
    [levelNames, setLevelNames] = useState(["Performance", "Development"]),
    [newLevel, setNewLevel] = useState(""),
    [showDivisionEdit, setShowDivisionEdit] = useState(false),
    [divisionDrafts, setDivisionDrafts] = useState<
      { id: number; name: string }[]
    >([]);
  const [teams, setTeams] = useState<LeagueTeam[]>([]),
    [captains, setCaptains] = useState<LeagueCaptain[]>([]),
    [showTeam, setShowTeam] = useState(false),
    [editingTeam, setEditingTeam] = useState<LeagueTeam | null>(null),
    [teamCity, setTeamCity] = useState(""),
    [teamName, setTeamName] = useState(""),
    [teamLevel, setTeamLevel] = useState<number | "">(""),
    [captainName, setCaptainName] = useState(""),
    [captainUsername, setCaptainUsername] = useState(""),
    [captainEmail, setCaptainEmail] = useState(""),
    [captainPhone, setCaptainPhone] = useState(""),
    [credentials, setCredentials] = useState<{
      username: string;
      password: string;
    } | null>(null),
    [teamLevelTab, setTeamLevelTab] = useState<number | "">("");
  const [leagueVenues, setLeagueVenues] = useState<LeagueVenue[]>([]),
    [showVenue, setShowVenue] = useState(false),
    [leagueVenueName, setLeagueVenueName] = useState(""),
    [leagueVenueAddress, setLeagueVenueAddress] = useState(""),
    [leagueVenueType, setLeagueVenueType] = useState<"Indoor" | "Outdoor">(
      "Indoor",
    ),
    [leagueVenueCourts, setLeagueVenueCourts] = useState(["1", "2", "3"]),
    [venueImportDone, setVenueImportDone] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false),
    [nightDate, setNightDate] = useState(""),
    [nightTime, setNightTime] = useState("20:00"),
    [nightVenue, setNightVenue] = useState<number | "">(""),
    [nightGames, setNightGames] = useState<NightGame[]>([
      {
        levelId: "",
        homeTeamId: "",
        visitorTeamId: "",
        courts: ["1", "2", "3"],
      },
    ]),
    [leagueMatches, setLeagueMatches] = useState<LeagueMatch[]>([]),
    [scheduleLevelTab, setScheduleLevelTab] = useState<number | "">(""),
    [scheduleModalError, setScheduleModalError] = useState(""),
    [expandedScheduleWeeks, setExpandedScheduleWeeks] = useState<
      Record<string, boolean>
    >({}),
    [scheduleImportDone, setScheduleImportDone] = useState(false);
  const [resultMatch, setResultMatch] = useState<LeagueMatch | null>(null),
    [resultOutcome, setResultOutcome] = useState<
      "Home" | "Visitor" | "Tie" | ""
    >(""),
    [resultWinnerWins, setResultWinnerWins] = useState<number | "">(""),
    [standingLevelTab, setStandingLevelTab] = useState<number | "">(""),
    [editingLeagueMatch, setEditingLeagueMatch] = useState<LeagueMatch | null>(
      null,
    ),
    [rescheduleComment, setRescheduleComment] = useState("");
  const [leagueReports, setLeagueReports] = useState<LeagueTeamReport[]>([]),
    [reportSeasonId, setReportSeasonId] = useState<number | "">(""),
    [reportTeamId, setReportTeamId] = useState<number | "">(""),
    [leagueReportEntity, setLeagueReportEntity] = useState<"players" | "pairs">(
      "players",
    );
  const active = seasons.find((season) => season.status === "Active") ?? null,
    activeLevels = active
      ? levels.filter(
          (level) => level.seasonId === active.id && level.status === "Active",
        )
      : [],
    activeTeams = active
      ? teams.filter((team) => team.seasonId === active.id)
      : [];
  async function loadSetup() {
    setLoading(true);
    setError("");
    try {
      const [setupResponse, teamsResponse, venuesResponse, scheduleResponse] =
        await Promise.all([
          fetch("/api/league/setup"),
          fetch("/api/league/teams"),
          fetch("/api/league/venues"),
          fetch("/api/league/schedule"),
        ]);
      const result = (await setupResponse.json()) as {
        seasons?: LeagueSeason[];
        levels?: LeagueLevel[];
        error?: string;
      };
      const teamResult = (await teamsResponse.json()) as {
        teams?: LeagueTeam[];
        captains?: LeagueCaptain[];
      };
      const venueResult = (await venuesResponse.json()) as {
        venues?: LeagueVenue[];
      };
      const scheduleResult = (await scheduleResponse.json()) as {
        matches?: LeagueMatch[];
      };
      if (!setupResponse.ok)
        throw new Error(result.error ?? "Unable to load competition");
      setSeasons(result.seasons ?? []);
      setLevels(result.levels ?? []);
      if (teamsResponse.ok) {
        setTeams(teamResult.teams ?? []);
        setCaptains(teamResult.captains ?? []);
      }
      if (venuesResponse.ok) setLeagueVenues(venueResult.venues ?? []);
      if (scheduleResponse.ok) setLeagueMatches(scheduleResult.matches ?? []);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load competition",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadSetup();
  }, []);
  useEffect(() => {
    if (
      loading ||
      !active ||
      activeTeams.length ||
      !/(automne|outono|fall)/i.test(active.name) ||
      !active.name.includes("2026")
    )
      return;
    let cancelled = false;
    fetch("/api/league/import-autumn-2026", { method: "POST" })
      .then((response) =>
        response.json().then((result) => ({ ok: response.ok, result })),
      )
      .then(({ ok, result }: { ok: boolean; result: { error?: string } }) => {
        if (cancelled) return;
        if (ok) loadSetup();
        else setError(result.error ?? "Unable to import Automne 2026 teams");
      })
      .catch(
        () => !cancelled && setError("Unable to import Automne 2026 teams"),
      );
    return () => {
      cancelled = true;
    };
  }, [loading, active?.id, activeTeams.length]);
  useEffect(() => {
    if (
      loading ||
      !active ||
      venueImportDone ||
      !/(automne|outono|fall)/i.test(active.name) ||
      !active.name.includes("2026")
    )
      return;
    setVenueImportDone(true);
    fetch("/api/league/import-autumn-2026-venues", { method: "POST" })
      .then((response) =>
        response.json().then((result) => ({ ok: response.ok, result })),
      )
      .then(({ ok, result }: { ok: boolean; result: { error?: string } }) => {
        if (ok) loadSetup();
        else
          setError(result.error ?? "Unable to import Automne 2026 locations");
      })
      .catch(() => setError("Unable to import Automne 2026 locations"));
  }, [loading, active?.id, venueImportDone]);
  useEffect(() => {
    if (
      loading ||
      !active ||
      scheduleImportDone ||
      activeTeams.length < 24 ||
      leagueVenues.length < 5 ||
      !/(automne|outono|fall)/i.test(active.name) ||
      !active.name.includes("2026")
    )
      return;
    setScheduleImportDone(true);
    fetch("/api/league/import-autumn-2026-schedule", { method: "POST" })
      .then((response) =>
        response.json().then((result) => ({ ok: response.ok, result })),
      )
      .then(
        ({
          ok,
          result,
        }: {
          ok: boolean;
          result: { error?: string; errors?: string[] };
        }) => {
          if (ok || result.errors?.length === 0) loadSetup();
          else
            setError(
              result.error ??
                `Some schedule rows could not be imported: ${result.errors?.slice(0, 3).join(" · ")}`,
            );
        },
      )
      .catch(() => setError("Unable to import the Automne 2026 schedule"));
  }, [
    loading,
    active?.id,
    activeTeams.length,
    leagueVenues.length,
    scheduleImportDone,
  ]);
  useEffect(() => {
    if (section !== "leagueReports" || !active) return;
    fetch("/api/league/reports")
      .then((response) => response.json())
      .then((result: { reports?: LeagueTeamReport[] }) => {
        const reports = result.reports ?? [],
          currentSeasonReports = reports.filter(
            (item) => item.seasonId === active.id,
          ),
          first = currentSeasonReports[0];
        setLeagueReports(reports);
        setReportSeasonId(active.id);
        setReportTeamId(first?.teamId ?? "");
      })
      .catch(() => setError("Unable to load league reports"));
  }, [section, active?.id]);
  function addLevel() {
    const name = newLevel.trim();
    if (
      !name ||
      levelNames.some((level) => level.toLowerCase() === name.toLowerCase())
    )
      return;
    setLevelNames((current) => [...current, name]);
    setNewLevel("");
  }
  async function createCompetition(event: FormEvent) {
    event.preventDefault();
    if (!seasonName.trim() || levelNames.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/league/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: seasonName, levels: levelNames }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Unable to create season");
      setSeasonName("");
      setShowSetup(false);
      await loadSetup();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create season",
      );
    } finally {
      setSaving(false);
    }
  }
  function openDivisionEditor() {
    setDivisionDrafts(
      activeLevels.map((level) => ({ id: level.id, name: level.name })),
    );
    setShowDivisionEdit(true);
  }
  async function saveDivisions(event: FormEvent) {
    event.preventDefault();
    if (!active) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/league/setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId: active.id, levels: divisionDrafts }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Unable to update divisions");
      setShowDivisionEdit(false);
      await loadSetup();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to update divisions",
      );
    } finally {
      setSaving(false);
    }
  }
  function openTeamForm(team?: LeagueTeam) {
    const captain = team
      ? captains.find((item) => item.leagueTeamId === team.id)
      : undefined;
    setEditingTeam(team ?? null);
    setTeamCity(team?.city ?? "");
    setTeamName(team?.teamName ?? "");
    setTeamLevel(team?.levelId ?? teamLevelTab ?? activeLevels[0]?.id ?? "");
    setCaptainName(captain?.displayName ?? "");
    setCaptainUsername(captain?.username ?? "");
    setCaptainEmail(captain?.email ?? "");
    setCaptainPhone(captain?.phone ?? "");
    setShowTeam(true);
  }
  async function createTeam(event: FormEvent) {
    event.preventDefault();
    if (!active || !teamLevel) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/league/teams", {
        method: editingTeam ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTeam?.id,
          seasonId: active.id,
          levelId: teamLevel,
          city: teamCity,
          teamName,
          captainName,
          username: captainUsername,
          email: captainEmail,
          phone: captainPhone,
        }),
      });
      const result = (await response.json()) as {
        temporaryPassword?: string;
        username?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "Unable to save team");
      if (result.temporaryPassword)
        setCredentials({
          username: result.username!,
          password: result.temporaryPassword,
        });
      setShowTeam(false);
      setEditingTeam(null);
      await loadSetup();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save team",
      );
    } finally {
      setSaving(false);
    }
  }
  async function resetCaptainPassword(team: LeagueTeam) {
    if (!confirm("Reset this captain's password?")) return;
    const response = await fetch("/api/league/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: team.id }),
    });
    const result = (await response.json()) as {
      temporaryPassword?: string;
      username?: string;
      error?: string;
    };
    if (!response.ok) {
      setError(result.error ?? "Unable to reset password");
      return;
    }
    setCredentials({
      username: result.username!,
      password: result.temporaryPassword!,
    });
    await loadSetup();
  }
  async function removeTeam(id: number) {
    if (!confirm("Remove this team and its captain access?")) return;
    await fetch(`/api/league/teams?id=${id}`, { method: "DELETE" });
    await loadSetup();
  }
  async function createLeagueVenue(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/league/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leagueVenueName,
        address: leagueVenueAddress,
        venueType: leagueVenueType,
        courts: leagueVenueCourts,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to create location");
      return;
    }
    setShowVenue(false);
    setLeagueVenueName("");
    setLeagueVenueAddress("");
    setLeagueVenueType("Indoor");
    setLeagueVenueCourts(["1", "2", "3"]);
    await loadSetup();
  }
  async function removeLeagueVenue(id: number) {
    if (!confirm("Remove this location?")) return;
    await fetch(`/api/league/venues?id=${id}`, { method: "DELETE" });
    await loadSetup();
  }
  function addNightGame(copy?: NightGame) {
    const venue = leagueVenues.find((v) => v.id === nightVenue),
      used = nightGames.flatMap((g) => g.courts),
      available =
        venue?.courts.filter((c) => !used.includes(c)).slice(0, 3) ?? [];
    setNightGames((current) => [
      ...current,
      copy
        ? { ...copy, courts: [...copy.courts] }
        : {
            levelId: "",
            homeTeamId: "",
            visitorTeamId: "",
            courts: available.length === 3 ? available : ["", "", ""],
          },
    ]);
  }
  function openScheduleEdit(match: LeagueMatch) {
    setEditingLeagueMatch(match);
    setNightDate(match.matchDate);
    setNightTime(match.matchTime);
    setNightVenue(match.venueId);
    setNightGames([
      {
        levelId: match.levelId,
        homeTeamId: match.homeTeamId,
        visitorTeamId: match.visitorTeamId,
        courts: [...match.courts],
      },
    ]);
    setRescheduleComment("");
    setShowSchedule(true);
  }
  async function saveGameNight(event: FormEvent) {
    event.preventDefault();
    if (!active || !nightVenue) return;
    const selectedTeams = nightGames
      .flatMap((game) => [game.homeTeamId, game.visitorTeamId])
      .filter((id): id is number => typeof id === "number");
    if (new Set(selectedTeams).size !== selectedTeams.length) {
      setScheduleModalError(
        "A team can play only once on the same date. Choose a different team.",
      );
      return;
    }
    setSaving(true);
    setError("");
    setScheduleModalError("");
    const editing = editingLeagueMatch,
      game = nightGames[0];
    const response = await fetch("/api/league/schedule", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing
          ? {
              id: editing.id,
              levelId: game.levelId,
              venueId: nightVenue,
              date: nightDate,
              time: nightTime,
              homeTeamId: game.homeTeamId,
              visitorTeamId: game.visitorTeamId,
              courts: game.courts,
              comment: rescheduleComment,
            }
          : {
              seasonId: active.id,
              date: nightDate,
              time: nightTime,
              venueId: nightVenue,
              games: nightGames,
            },
      ),
    });
    const result = (await response
      .json()
      .catch(() => ({
        error: "The schedule could not be saved. Please try again.",
      }))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setScheduleModalError(result.error ?? "Unable to save schedule");
      return;
    }
    setShowSchedule(false);
    setEditingLeagueMatch(null);
    setRescheduleComment("");
    setNightGames([
      {
        levelId: "",
        homeTeamId: "",
        visitorTeamId: "",
        courts: ["1", "2", "3"],
      },
    ]);
    await loadSetup();
  }
  async function saveLeagueResult(event: FormEvent) {
    event.preventDefault();
    if (
      !resultMatch ||
      !resultOutcome ||
      (resultOutcome !== "Tie" && resultWinnerWins === "")
    )
      return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/league/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: resultMatch.id,
        outcome: resultOutcome,
        winnerWins: resultWinnerWins,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to save result");
      return;
    }
    setResultMatch(null);
    setResultOutcome("");
    setResultWinnerWins("");
    await loadSetup();
  }
  const standings = activeLevels.map((level) => ({
    level,
    rows: teams
      .filter(
        (team) => team.seasonId === active?.id && team.levelId === level.id,
      )
      .map((team) => {
        let played = 0,
          wins16 = 0,
          wins15 = 0,
          losses8 = 0,
          losses7 = 0,
          ties = 0,
          forGames = 0,
          against = 0,
          points = 0;
        leagueMatches
          .filter(
            (match) =>
              match.seasonId === active?.id &&
              match.levelId === level.id &&
              match.status === "Completed" &&
              (match.homeTeamId === team.id || match.visitorTeamId === team.id),
          )
          .forEach((match) => {
            const home = match.homeTeamId === team.id,
              own = home ? match.homeWins : match.visitorWins,
              other = home ? match.visitorWins : match.homeWins;
            if (own == null || other == null) return;
            played++;
            forGames += own;
            against += other;
            if (own === other) {
              ties++;
              points++;
            } else if (own > other) {
              if (own >= 16) {
                wins16++;
                points += 3;
              } else {
                wins15++;
                points += 2;
              }
            } else if (own >= 8) {
              losses8++;
              points++;
            } else losses7++;
          });
        return {
          team,
          played,
          wins16,
          wins15,
          losses8,
          losses7,
          ties,
          forGames,
          against,
          difference: forGames - against,
          points,
        };
      })
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.difference - a.difference ||
          b.forGames - a.forGames,
      ),
  }));
  const activeScheduleMatches = leagueMatches
    .filter(
      (match) =>
        match.seasonId === active?.id &&
        match.levelId === (scheduleLevelTab || activeLevels[0]?.id),
    )
    .sort((a, b) =>
      `${a.matchDate}${a.matchTime}`.localeCompare(
        `${b.matchDate}${b.matchTime}`,
      ),
    );
  const sundayOf = (date: string) => {
    const item = new Date(`${date}T12:00:00`);
    item.setDate(item.getDate() - item.getDay());
    return item.toISOString().slice(0, 10);
  };
  const scheduleWeeks = activeScheduleMatches.reduce<
    Record<string, LeagueMatch[]>
  >((groups, match) => {
    const week = sundayOf(match.matchDate);
    (groups[week] ??= []).push(match);
    return groups;
  }, {});
  const steps = [
    {
      number: "01",
      title: "Season & divisions",
      description:
        "Create the season and its Performance, Development or other divisions.",
      status: active ? "Ready" : "Next",
      action: active ? "Manage season" : "Set up competition",
      enabled: true,
    },
    {
      number: "02",
      title: "Teams & captains",
      description:
        "Add every team, captain login and temporary first-access password.",
      status: activeTeams.length
        ? `${activeTeams.length} teams`
        : active
          ? "Next"
          : "Pending",
      action: "Manage teams",
      enabled: Boolean(active),
    },
    {
      number: "03",
      title: "Locations & courts",
      description:
        "Centralize venues and the court numbers used by the whole league.",
      status: leagueVenues.length
        ? `${leagueVenues.length} locations`
        : active
          ? "Next"
          : "Pending",
      action: "Manage locations",
      enabled: Boolean(active),
    },
    {
      number: "04",
      title: "Season schedule",
      description:
        "Create home and visitor fixtures that appear automatically for captains.",
      status:
        active && activeTeams.length > 1 && leagueVenues.length
          ? "Next"
          : "Pending",
      action: "Build schedule",
      enabled: Boolean(active && activeTeams.length > 1 && leagueVenues.length),
    },
  ];
  const selectedLeagueReport = leagueReports.find(
      (item) =>
        item.teamId === reportTeamId && item.seasonId === reportSeasonId,
    ),
    selectedLeagueRows = selectedLeagueReport?.[leagueReportEntity] ?? [];
  const leagueReportsPanel =
    section === "leagueReports" ? (
      <section className="league-reports-panel">
        <div className="league-report-filters">
          <label>
            Season
            <select
              value={reportSeasonId}
              onChange={(event) => {
                const id = Number(event.target.value);
                setReportSeasonId(id);
                setReportTeamId(
                  leagueReports.find((item) => item.seasonId === id)?.teamId ??
                    "",
                );
              }}
            >
              {[
                ...new Map(
                  leagueReports.map((item) => [item.seasonId, item.seasonName]),
                ).entries(),
              ].map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Team
            <select
              value={reportTeamId}
              onChange={(event) => setReportTeamId(Number(event.target.value))}
            >
              {leagueReports
                .filter((item) => item.seasonId === reportSeasonId)
                .map((item) => (
                  <option key={item.teamId} value={item.teamId}>
                    {item.teamName}
                  </option>
                ))}
            </select>
          </label>
          <div className="entity-tabs">
            <button
              className={leagueReportEntity === "players" ? "active" : ""}
              onClick={() => setLeagueReportEntity("players")}
            >
              By player
            </button>
            <button
              className={leagueReportEntity === "pairs" ? "active" : ""}
              onClick={() => setLeagueReportEntity("pairs")}
            >
              By pair
            </button>
          </div>
        </div>
        <div className="pair-ranking-head">
          <div>
            <h2>{selectedLeagueReport?.teamName ?? "Select a team"}</h2>
            <p>
              {leagueReportEntity === "players" ? "Player" : "Pair"} results for{" "}
              {selectedLeagueReport?.seasonName ?? "the selected season"}.
            </p>
          </div>
          <span>{selectedLeagueRows.length} RANKED</span>
        </div>
        {selectedLeagueRows.length ? (
          <div className="ranking-table adjusted-table">
            <div className="ranking-row ranking-labels">
              <span>RANK</span>
              <span>
                {leagueReportEntity === "players" ? "PLAYER" : "PAIR"}
              </span>
              <span>PLAYED</span>
              <span>W</span>
              <span>L</span>
              <span>WIN %</span>
              <span>SCORE</span>
            </div>
            {selectedLeagueRows.map((row, index) => (
              <div
                className="ranking-row"
                key={row.name}
                style={{
                  background: `hsl(${row.score * 1.2} 58% ${94 - Math.abs(row.score - 50) * 0.16}%)`,
                }}
              >
                <span className="ranking-position">{index + 1}</span>
                <div className="ranking-pair">
                  <span>
                    {row.name
                      .split(" + ")
                      .map((name) => name[0])
                      .join("")}
                  </span>
                  <strong>{row.name}</strong>
                </div>
                <span>{row.played}</span>
                <span className="ranking-win">{row.wins}</span>
                <span className="ranking-loss">{row.losses}</span>
                <strong>{row.rate}%</strong>
                <span className="ranking-score">{row.score}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="league-empty">
            No saved game results for this team and season yet.
          </p>
        )}
      </section>
    ) : null;
  const scheduleModalNotice =
    showSchedule && scheduleModalError ? (
      <div className="schedule-modal-notice" role="alert">
        <strong>Schedule needs attention</strong>
        <span>{scheduleModalError}</span>
      </div>
    ) : null;
  const divisionEditModal =
    showDivisionEdit && active ? (
      <div
        className="modal-backdrop"
        onMouseDown={() => setShowDivisionEdit(false)}
      >
        <form
          className="player-modal league-season-modal"
          onSubmit={saveDivisions}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal-head">
            <div>
              <p className="eyebrow">CURRENT SEASON</p>
              <h2>Edit divisions</h2>
            </div>
            <button type="button" onClick={() => setShowDivisionEdit(false)}>
              ×
            </button>
          </div>
          <p className="league-modal-intro">
            Rename the divisions for {active.name}. Teams and scheduled matches
            remain linked to the same division.
          </p>
          <div className="division-edit-list">
            {divisionDrafts.map((division, index) => (
              <label key={division.id}>
                Division {index + 1}
                <input
                  autoFocus={index === 0}
                  required
                  value={division.name}
                  onChange={(event) =>
                    setDivisionDrafts((current) =>
                      current.map((item) =>
                        item.id === division.id
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowDivisionEdit(false)}
            >
              Cancel
            </button>
            <button
              className="primary-btn"
              disabled={
                saving || divisionDrafts.some((item) => !item.name.trim())
              }
            >
              {saving ? "Saving…" : "Save division names"}
            </button>
          </div>
        </form>
      </div>
    ) : null;
  return (
    <section className={`content league-admin-content section-${section}`}>
      {divisionEditModal}
      <header className="league-admin-header">
        <div>
          <p className="eyebrow">PICKLEPILOT INTERCLUB</p>
          <h1>
            {section === "leagueTeams"
              ? "Teams & captains"
              : section === "leagueLocations"
                ? "Locations & courts"
                : section === "leagueSchedule"
                  ? "Season schedule"
                  : section === "leagueStandings"
                    ? "Standings"
                    : section === "leagueReports"
                      ? "League reports"
                      : "League administration"}
          </h1>
          <p>
            {section === "leagueStandings"
              ? "Automatically calculated from the official results submitted for each game night."
              : section === "leagueReports"
                ? "Compare player and pair performance across every team and season."
                : "Manage the current competition from one clear workspace."}
          </p>
        </div>
        <span className="league-admin-status">
          {active?.name ?? "League administrator"}
        </span>
      </header>
      {leagueReportsPanel}
      {scheduleModalNotice}
      <div id="league-overview" />
      <section className="league-admin-hero">
        <div>
          <span className="league-role-pill">CURRENT COMPETITION</span>
          <h2>
            {loading
              ? "Loading…"
              : (active?.name ?? "Create your first Interclub season")}
          </h2>
          <p>
            {active
              ? `${activeLevels.length} active division${activeLevels.length === 1 ? "" : "s"}: ${activeLevels.map((division) => division.name).join(", ")}`
              : "Start with a season name and the competition divisions used by your organization."}
          </p>
        </div>
        <div className="league-hero-buttons">
          {active && (
            <button className="outline-btn" onClick={openDivisionEditor}>
              Edit divisions
            </button>
          )}
          <button
            className="primary-btn league-hero-action"
            onClick={() => setShowSetup(true)}
          >
            {active ? "Create next season" : "Create season & divisions"} →
          </button>
        </div>
      </section>
      {error && <div className="league-error">{error}</div>}
      <section className="league-summary">
        <article>
          <span>ACTIVE SEASON</span>
          <strong>{active?.name ?? "Not created"}</strong>
          <small>Managed only by the league</small>
        </article>
        <article>
          <span>DIVISIONS</span>
          <strong>{activeLevels.length || "—"}</strong>
          <small>
            {activeLevels.map((division) => division.name).join(" · ") ||
              "Performance, Development…"}
          </small>
        </article>
        <article>
          <span>TEAMS</span>
          <strong>
            {teams.filter((team) => team.seasonId === active?.id).length}
          </strong>
          <small>Captain access included</small>
        </article>
        <article>
          <span>SCHEDULED MATCHES</span>
          <strong>
            {
              leagueMatches.filter((match) => match.seasonId === active?.id)
                .length
            }
          </strong>
          <small>Captains receive them automatically</small>
        </article>
      </section>
      <div className="league-admin-section-head">
        <div>
          <p className="eyebrow">GUIDED SETUP</p>
          <h2>Build the season step by step</h2>
        </div>
        <span>Complete each step from left to right</span>
      </div>
      <section className="league-setup-grid">
        {steps.map((step, index) => (
          <article key={step.number} className={step.enabled ? "current" : ""}>
            <div className="league-step-number">{step.number}</div>
            <div className="league-step-copy">
              <div>
                <h3>{step.title}</h3>
                <span>{step.status}</span>
              </div>
              <p>{step.description}</p>
              <button
                disabled={!step.enabled}
                onClick={() =>
                  step.enabled &&
                  (index === 0
                    ? setShowSetup(true)
                    : index === 1
                      ? document
                          .getElementById("league-teams")
                          ?.scrollIntoView({ behavior: "smooth" })
                      : index === 2
                        ? document
                            .getElementById("league-locations")
                            ?.scrollIntoView({ behavior: "smooth" })
                        : document
                            .getElementById("league-schedule")
                            ?.scrollIntoView({ behavior: "smooth" }))
                }
              >
                {step.action} <b>→</b>
              </button>
            </div>
          </article>
        ))}
      </section>
      {credentials && (
        <div className="captain-credentials">
          <div>
            <strong>Temporary captain access</strong>
            <span>
              Copy and send these credentials to the captain. A new password
              will be required at first login.
            </span>
          </div>
          <code>
            Username: {credentials.username}
            <br />
            Password: {credentials.password}
          </code>
          <button
            onClick={() =>
              navigator.clipboard?.writeText(
                `${credentials.username}\n${credentials.password}`,
              )
            }
          >
            Copy
          </button>
          <button onClick={() => setCredentials(null)}>Done</button>
        </div>
      )}
      <section id="league-teams" className="league-team-list">
        <header>
          <div>
            <p className="eyebrow">TEAMS & CAPTAINS</p>
            <h2>Active season teams</h2>
          </div>
          <button className="primary-btn" onClick={() => openTeamForm()}>
            + Add team
          </button>
        </header>
        <div className="league-level-tabs">
          {activeLevels.map((level) => (
            <button
              className={
                (teamLevelTab || activeLevels[0]?.id) === level.id
                  ? "active"
                  : ""
              }
              key={level.id}
              onClick={() => setTeamLevelTab(level.id)}
            >
              {level.name}{" "}
              <span>
                {
                  teams.filter(
                    (team) =>
                      team.seasonId === active?.id && team.levelId === level.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        {teams
          .filter(
            (team) =>
              team.seasonId === active?.id &&
              team.levelId === (teamLevelTab || activeLevels[0]?.id),
          )
          .map((team) => {
            const captain = captains.find(
              (item) => item.leagueTeamId === team.id,
            );
            return (
              <article key={team.id}>
                <div>
                  <strong>
                    {team.city} · {team.teamName}
                  </strong>
                  <small>
                    {
                      activeLevels.find((level) => level.id === team.levelId)
                        ?.name
                    }
                  </small>
                </div>
                <div>
                  <strong>{captain?.displayName}</strong>
                  <small>
                    @{captain?.username} ·{" "}
                    {captain?.mustChangePassword
                      ? "Temporary password active"
                      : "Password updated"}
                  </small>
                </div>
                <div className="league-row-actions">
                  <button onClick={() => openTeamForm(team)}>Edit</button>
                  <button onClick={() => resetCaptainPassword(team)}>
                    Reset password
                  </button>
                  <button
                    className="danger"
                    onClick={() => removeTeam(team.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        {!teams.some(
          (team) =>
            team.seasonId === active?.id &&
            team.levelId === (teamLevelTab || activeLevels[0]?.id),
        ) && <p className="league-empty">No teams in this level yet.</p>}
      </section>
      <section id="league-locations" className="league-team-list">
        <header>
          <div>
            <p className="eyebrow">LOCATIONS & COURTS</p>
            <h2>League locations</h2>
          </div>
          <button
            className="primary-btn"
            onClick={() => {
              setLeagueVenueType("Indoor");
              setShowVenue(true);
            }}
          >
            + Add location
          </button>
        </header>
        {leagueVenues.map((venue) => (
          <article key={venue.id}>
            <div>
              <strong>{venue.name}</strong>
              <small>{venue.address || "No address"}</small>
            </div>
            <div>
              <strong>
                {venue.courts.length} courts · {venue.venueType}
              </strong>
              <small>{venue.courts.join(" · ")}</small>
            </div>
            <button onClick={() => removeLeagueVenue(venue.id)}>Remove</button>
          </article>
        ))}
        {leagueVenues.length === 0 && (
          <p className="league-empty">No locations created yet.</p>
        )}
      </section>
      <section
        id="league-schedule"
        className="league-team-list league-schedule-list"
      >
        <header>
          <div>
            <p className="eyebrow">SEASON SCHEDULE</p>
            <h2>All scheduled matches</h2>
          </div>
          <button
            className="primary-btn"
            disabled={!active || teams.length < 2 || !leagueVenues.length}
            onClick={() => {
              setEditingLeagueMatch(null);
              setScheduleModalError("");
              setNightDate("");
              setNightTime("20:00");
              setNightVenue("");
              setNightGames([
                {
                  levelId: "",
                  homeTeamId: "",
                  visitorTeamId: "",
                  courts: ["1", "2", "3"],
                },
              ]);
              setShowSchedule(true);
            }}
          >
            + New game night
          </button>
        </header>
        <div className="league-level-tabs">
          {activeLevels.map((division) => (
            <button
              className={
                (scheduleLevelTab || activeLevels[0]?.id) === division.id
                  ? "active"
                  : ""
              }
              key={division.id}
              onClick={() => setScheduleLevelTab(division.id)}
            >
              {division.name}{" "}
              <span>
                {
                  leagueMatches.filter(
                    (match) =>
                      match.seasonId === active?.id &&
                      match.levelId === division.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        {Object.entries(scheduleWeeks).map(([week, matchesInWeek]) => {
          const end = new Date(`${week}T12:00:00`);
          end.setDate(end.getDate() + 6);
          const pastWeek =
            end.toISOString().slice(0, 10) <
            new Date().toISOString().slice(0, 10);
          const expanded = expandedScheduleWeeks[week] ?? !pastWeek;
          return (
            <section className="schedule-week" key={week}>
              <button
                className="schedule-week-toggle"
                onClick={() =>
                  setExpandedScheduleWeeks((current) => ({
                    ...current,
                    [week]: !expanded,
                  }))
                }
              >
                <span>
                  <b>
                    Week of{" "}
                    {new Date(`${week}T12:00:00`).toLocaleDateString(localeCode(locale), {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {end.toLocaleDateString(localeCode(locale), {
                      month: "short",
                      day: "numeric",
                    })}
                  </b>
                  <small>
                    Sunday to Saturday · {matchesInWeek.length} match
                    {matchesInWeek.length === 1 ? "" : "es"}
                  </small>
                </span>
                <i>{expanded ? "−" : "+"}</i>
              </button>
              {expanded && (
                <div className="schedule-week-matches">
                  {matchesInWeek.map((match) => {
                    const home = teams.find(
                        (team) => team.id === match.homeTeamId,
                      ),
                      visitor = teams.find(
                        (team) => team.id === match.visitorTeamId,
                      ),
                      venue = leagueVenues.find(
                        (item) => item.id === match.venueId,
                      ),
                      official = match.status === "Completed",
                      pastPending =
                        !official &&
                        match.matchDate < new Date().toISOString().slice(0, 10),
                      winner =
                        match.resultOutcome === "Tie"
                          ? "Tie · 12–12"
                          : match.resultOutcome === "Home"
                            ? `${home?.city} won · ${match.homeWins}–${match.visitorWins}`
                            : match.resultOutcome === "Visitor"
                              ? `${visitor?.city} won · ${match.homeWins}–${match.visitorWins}`
                              : "Official result pending";
                    return (
                      <article
                        className={
                          official
                            ? "schedule-complete"
                            : pastPending
                              ? "schedule-past-pending"
                              : ""
                        }
                        key={match.id}
                      >
                        <div>
                          <strong>
                            {new Date(
                              `${match.matchDate}T12:00:00`,
                            ).toLocaleDateString(localeCode(locale))}{" "}
                            · {match.matchTime}
                          </strong>
                          <small>
                            {venue?.name} · Courts {match.courts.join(", ")}
                          </small>
                          {match.rescheduleComment && (
                            <em>{match.rescheduleComment}</em>
                          )}
                        </div>
                        <div className="schedule-team home-team">
                          <small>HOME · SENDS RESULT</small>
                          <strong>
                            {home?.city} · {home?.teamName}
                          </strong>
                        </div>
                        <div className="schedule-team visitor-team">
                          <small>VISITOR</small>
                          <strong>
                            {visitor?.city} · {visitor?.teamName}
                          </strong>
                        </div>
                        <div className="schedule-result">
                          <strong>
                            {official
                              ? "✓ Official result sent"
                              : pastPending
                                ? "! Past match needs result"
                                : winner}
                          </strong>
                          <span>
                            <button onClick={() => openScheduleEdit(match)}>
                              Edit game
                            </button>
                            <button
                              onClick={() => {
                                setResultMatch(match);
                                setResultOutcome(match.resultOutcome ?? "");
                                setResultWinnerWins(
                                  match.resultOutcome === "Home"
                                    ? (match.homeWins ?? "")
                                    : match.resultOutcome === "Visitor"
                                      ? (match.visitorWins ?? "")
                                      : "",
                                );
                              }}
                            >
                              {official ? "Correct result" : "Enter result"}
                            </button>
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        {activeScheduleMatches.length === 0 && (
          <p className="league-empty">
            No matches scheduled for this division yet.
          </p>
        )}
      </section>
      <section
        id="league-standings"
        className="league-team-list league-standings"
      >
        <header>
          <div>
            <p className="eyebrow">AUTOMATIC CLASSIFICATION</p>
            <h2>Current season standings</h2>
          </div>
          <span className="standings-rule">Updated from official results</span>
        </header>
        <div className="league-level-tabs">
          {activeLevels.map((division) => (
            <button
              className={
                (standingLevelTab || activeLevels[0]?.id) === division.id
                  ? "active"
                  : ""
              }
              key={division.id}
              onClick={() => setStandingLevelTab(division.id)}
            >
              {division.name}
            </button>
          ))}
        </div>
        <div className="standings-table">
          <div className="standings-head">
            <span>RANK</span>
            <span>TEAM</span>
            <span>MJ</span>
            <span>
              WINS
              <br />
              16+ PTS
            </span>
            <span>
              WINS
              <br />
              13–15 PTS
            </span>
            <span>
              LOSSES
              <br />
              8+ PTS
            </span>
            <span>
              LOSSES
              <br />
              0–7 PTS
            </span>
            <span>TIES</span>
            <span>POINTS</span>
            <span>DIFFERENTIAL</span>
          </div>
          {standings
            .find(
              (item) =>
                item.level.id === (standingLevelTab || activeLevels[0]?.id),
            )
            ?.rows.map((row, index) => (
              <div className="standings-row" key={row.team.id}>
                <b>{index + 1}</b>
                <strong>
                  {row.team.teamName}
                  <small>{row.team.city}</small>
                </strong>
                <span>{row.played}</span>
                <span>{row.wins16}</span>
                <span>{row.wins15}</span>
                <span>{row.losses8}</span>
                <span>{row.losses7}</span>
                <span>{row.ties}</span>
                <b>{row.points}</b>
                <span>
                  {row.difference > 0 ? `+${row.difference}` : row.difference}
                </span>
              </div>
            ))}
        </div>
        <p className="standings-explanation">
          3 points: win with 16+ games · 2 points: win with 13–15 games · 1
          point: loss with 8+ games or a tie.
        </p>
      </section>
      {seasons.length > 0 && (
        <section className="league-season-history">
          <div>
            <p className="eyebrow">SEASON HISTORY</p>
            <h2>Interclub seasons</h2>
          </div>
          {[...seasons].reverse().map((season) => (
            <article key={season.id}>
              <div>
                <strong>{season.name}</strong>
                <span
                  className={
                    season.status === "Active"
                      ? "season-active"
                      : "season-closed"
                  }
                >
                  {season.status}
                </span>
              </div>
              <p>
                {levels
                  .filter((level) => level.seasonId === season.id)
                  .map((level) => level.name)
                  .join(" · ")}
              </p>
            </article>
          ))}
        </section>
      )}
      {showSetup && (
        <div className="modal-backdrop" onMouseDown={() => setShowSetup(false)}>
          <form
            className="player-modal league-season-modal"
            onSubmit={createCompetition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">STEP 1 OF 4</p>
                <h2>{active ? "Create the next season" : "Season & levels"}</h2>
              </div>
              <button type="button" onClick={() => setShowSetup(false)}>
                ×
              </button>
            </div>
            <p className="league-modal-intro">
              Use any season name. Add all levels before creating the teams.
            </p>
            <label>
              Season name
              <input
                autoFocus
                required
                value={seasonName}
                onChange={(event) => setSeasonName(event.target.value)}
                placeholder="Example: Fall 2026"
              />
            </label>
            <fieldset>
              <legend>Competition levels</legend>
              <div className="league-level-tags">
                {levelNames.map((level) => (
                  <span key={level}>
                    {level}
                    <button
                      type="button"
                      aria-label={`Remove ${level}`}
                      onClick={() =>
                        setLevelNames((current) =>
                          current.filter((item) => item !== level),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="league-add-level">
                <input
                  value={newLevel}
                  onChange={(event) => setNewLevel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addLevel();
                    }
                  }}
                  placeholder="Add another level"
                />
                <button type="button" onClick={addLevel}>
                  + Add
                </button>
              </div>
            </fieldset>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowSetup(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={
                  saving || !seasonName.trim() || levelNames.length === 0
                }
              >
                {saving ? "Creating…" : "Create season"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showTeam && active && (
        <div className="modal-backdrop" onMouseDown={() => setShowTeam(false)}>
          <form
            className="player-modal league-season-modal"
            onSubmit={createTeam}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">TEAMS & CAPTAINS</p>
                <h2>
                  {editingTeam ? "Edit team & captain" : "Add team & captain"}
                </h2>
              </div>
              <button type="button" onClick={() => setShowTeam(false)}>
                ×
              </button>
            </div>
            <div className="auth-field-row">
              <label>
                City
                <input
                  autoFocus
                  required
                  value={teamCity}
                  onChange={(e) => setTeamCity(e.target.value)}
                  placeholder="Chambly"
                />
              </label>
              <label>
                Team name
                <input
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Les Forts"
                />
              </label>
            </div>
            <label>
              Level
              <select
                required
                value={teamLevel}
                onChange={(e) => setTeamLevel(Number(e.target.value))}
              >
                <option value="">Select level</option>
                {activeLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="auth-field-row">
              <label>
                Captain name
                <input
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                />
              </label>
              <label>
                Username
                <input
                  required
                  value={captainUsername}
                  onChange={(e) => setCaptainUsername(e.target.value)}
                />
              </label>
            </div>
            <label>
              Email
              <input
                required
                type="email"
                value={captainEmail}
                onChange={(e) => setCaptainEmail(e.target.value)}
              />
            </label>
            <label>
              Phone <small>Optional</small>
              <input
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowTeam(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingTeam
                    ? "Save changes"
                    : "Create team & access"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showVenue && (
        <div className="modal-backdrop" onMouseDown={() => setShowVenue(false)}>
          <form
            className="player-modal league-season-modal"
            onSubmit={createLeagueVenue}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">LOCATION DIRECTORY</p>
                <h2>Add location & courts</h2>
              </div>
              <button type="button" onClick={() => setShowVenue(false)}>
                ×
              </button>
            </div>
            <label>
              Location name
              <input
                autoFocus
                required
                value={leagueVenueName}
                onChange={(e) => setLeagueVenueName(e.target.value)}
                placeholder="Sani Sport Boucherville"
              />
            </label>
            <label>
              Address <small>Optional</small>
              <input
                value={leagueVenueAddress}
                onChange={(e) => setLeagueVenueAddress(e.target.value)}
              />
            </label>
            <fieldset>
              <legend>Location type</legend>
              <div className="gender-options">
                <button
                  type="button"
                  className={leagueVenueType === "Indoor" ? "selected" : ""}
                  onClick={() => setLeagueVenueType("Indoor")}
                >
                  Indoor
                </button>
                <button
                  type="button"
                  className={leagueVenueType === "Outdoor" ? "selected" : ""}
                  onClick={() => setLeagueVenueType("Outdoor")}
                >
                  Outdoor
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>Court numbers</legend>
              <div className="court-number-fields">
                {leagueVenueCourts.map((court, index) => (
                  <label key={index}>
                    Court {index + 1}
                    <input
                      required
                      value={court}
                      onChange={(e) =>
                        setLeagueVenueCourts((current) =>
                          current.map((value, i) =>
                            i === index ? e.target.value : value,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="inline-link"
                onClick={() =>
                  setLeagueVenueCourts((current) => [
                    ...current,
                    String(current.length + 1),
                  ])
                }
              >
                + Add another court
              </button>
            </fieldset>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowVenue(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={saving || leagueVenueCourts.length < 3}
              >
                {saving ? "Saving…" : "Save location"}
              </button>
            </div>
          </form>
        </div>
      )}
      {resultMatch && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setResultMatch(null)}
        >
          <form
            className="player-modal league-season-modal"
            onSubmit={saveLeagueResult}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">ADMINISTRATOR CORRECTION</p>
                <h2>Official game-night result</h2>
              </div>
              <button type="button" onClick={() => setResultMatch(null)}>
                ×
              </button>
            </div>
            <p className="league-modal-intro">
              Normally submitted by the home captain. Use this only to enter or
              correct an official result.
            </p>
            <div className="outcome-options">
              <button
                type="button"
                className={resultOutcome === "Home" ? "selected" : ""}
                onClick={() => setResultOutcome("Home")}
              >
                {teams.find((team) => team.id === resultMatch.homeTeamId)?.city}{" "}
                ·{" "}
                {
                  teams.find((team) => team.id === resultMatch.homeTeamId)
                    ?.teamName
                }
                <small>Home team won</small>
              </button>
              <button
                type="button"
                className={resultOutcome === "Tie" ? "selected" : ""}
                onClick={() => {
                  setResultOutcome("Tie");
                  setResultWinnerWins("");
                }}
              >
                Tie<small>Automatically 12–12</small>
              </button>
              <button
                type="button"
                className={resultOutcome === "Visitor" ? "selected" : ""}
                onClick={() => setResultOutcome("Visitor")}
              >
                {
                  teams.find((team) => team.id === resultMatch.visitorTeamId)
                    ?.city
                }{" "}
                ·{" "}
                {
                  teams.find((team) => team.id === resultMatch.visitorTeamId)
                    ?.teamName
                }
                <small>Visitor team won</small>
              </button>
            </div>
            {resultOutcome && resultOutcome !== "Tie" && (
              <label className="winner-wins-field">
                Winning team's victories
                <input
                  required
                  type="number"
                  min={13}
                  max={24}
                  value={resultWinnerWins}
                  onChange={(event) =>
                    setResultWinnerWins(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                />
                <small>The other team is calculated automatically.</small>
              </label>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setResultMatch(null)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={
                  saving ||
                  !resultOutcome ||
                  (resultOutcome !== "Tie" &&
                    (resultWinnerWins === "" ||
                      Number(resultWinnerWins) < 13 ||
                      Number(resultWinnerWins) > 24))
                }
              >
                {saving ? "Saving…" : "Confirm official result"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showSchedule && active && (
        <div
          className="modal-backdrop"
          onMouseDown={() => {
            setShowSchedule(false);
            setEditingLeagueMatch(null);
          }}
        >
          <form
            className="game-night-modal"
            onSubmit={saveGameNight}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">SEASON SCHEDULE</p>
                <h2>
                  {editingLeagueMatch
                    ? "Edit scheduled match"
                    : "Create a game night"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSchedule(false);
                  setEditingLeagueMatch(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="game-night-shared">
              <label>
                Date
                <input
                  required
                  type="date"
                  value={nightDate}
                  onChange={(e) => setNightDate(e.target.value)}
                />
              </label>
              <label>
                Time
                <input
                  required
                  type="time"
                  value={nightTime}
                  onChange={(e) => setNightTime(e.target.value)}
                />
              </label>
              <label>
                Location
                <select
                  required
                  value={nightVenue}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setNightVenue(id);
                    const courts = leagueVenues
                      .find((v) => v.id === id)
                      ?.courts.slice(0, 3) ?? ["1", "2", "3"];
                    setNightGames((rows) =>
                      rows.map((row) => ({ ...row, courts })),
                    );
                  }}
                >
                  <option value="">Select location</option>
                  {leagueVenues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.venueType}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="game-night-rows">
              {nightGames.map((game, index) => {
                const divisionTeams = teams.filter(
                  (t) =>
                    t.seasonId === active.id &&
                    (!game.levelId || t.levelId === game.levelId),
                );
                return (
                  <article key={index}>
                    <b>Match {index + 1}</b>
                    <select
                      required
                      value={game.levelId}
                      onChange={(e) =>
                        setNightGames((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  levelId: Number(e.target.value),
                                  homeTeamId: "",
                                  visitorTeamId: "",
                                }
                              : r,
                          ),
                        )
                      }
                    >
                      <option value="">Division</option>
                      {activeLevels.map((division) => (
                        <option key={division.id} value={division.id}>
                          {division.name}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={game.homeTeamId}
                      onChange={(e) =>
                        setNightGames((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, homeTeamId: Number(e.target.value) }
                              : r,
                          ),
                        )
                      }
                    >
                      <option value="">Home</option>
                      {divisionTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.city} · {t.teamName}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={game.visitorTeamId}
                      onChange={(e) =>
                        setNightGames((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, visitorTeamId: Number(e.target.value) }
                              : r,
                          ),
                        )
                      }
                    >
                      <option value="">Visitor</option>
                      {divisionTeams
                        .filter((t) => t.id !== game.homeTeamId)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.city} · {t.teamName}
                          </option>
                        ))}
                    </select>
                    <div className="night-courts">
                      {game.courts.map((c, ci) => (
                        <input
                          required
                          key={ci}
                          value={c}
                          onChange={(e) =>
                            setNightGames((rows) =>
                              rows.map((r, i) =>
                                i === index
                                  ? {
                                      ...r,
                                      courts: r.courts.map((v, j) =>
                                        j === ci ? e.target.value : v,
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                    {!editingLeagueMatch && (
                      <button type="button" onClick={() => addNightGame(game)}>
                        Duplicate
                      </button>
                    )}
                    {!editingLeagueMatch && nightGames.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNightGames((rows) =>
                            rows.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
            {editingLeagueMatch &&
              nightDate !== editingLeagueMatch.matchDate && (
                <label className="reschedule-reason">
                  Reason for the date change
                  <textarea
                    autoFocus
                    required
                    value={rescheduleComment}
                    onChange={(event) =>
                      setRescheduleComment(event.target.value)
                    }
                    placeholder="Explain why this match was rescheduled. Captains will see this note."
                  />
                </label>
              )}
            {!editingLeagueMatch && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => addNightGame()}
              >
                + Add another match
              </button>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setShowSchedule(false);
                  setEditingLeagueMatch(null);
                }}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={
                  saving ||
                  Boolean(
                    editingLeagueMatch &&
                    nightDate !== editingLeagueMatch.matchDate &&
                    !rescheduleComment.trim(),
                  )
                }
              >
                {saving
                  ? "Saving…"
                  : editingLeagueMatch
                    ? "Save schedule changes"
                    : `Create ${nightGames.length} match${nightGames.length === 1 ? "" : "es"}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function PasswordChange({
  user,
  onDone,
  locale,
  onLocaleChange,
}: {
  user: AppUser;
  onDone: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  const [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to change password");
      return;
    }
    onDone();
  }
  return (
    <main className="auth-page">
      <LanguageSelector locale={locale} onChange={onLocaleChange} />
      <section className="auth-card">
        <div className="auth-brand">
          <span>P</span>
          <strong>PicklePilot</strong>
        </div>
        <p className="eyebrow">FIRST ACCESS</p>
        <h1>Create your password</h1>
        <p>Choose a private password before opening the captain portal.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input disabled value={user.username} />
          </label>
          <label>
            New password
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm password
            <input
              required
              minLength={8}
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn" disabled={busy}>
            {busy ? "Saving…" : "Save password & continue"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthScreen({
  setupRequired,
  onAuthenticated,
  locale,
  onLocaleChange,
}: {
  setupRequired: boolean;
  onAuthenticated: (user: AppUser) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">(
    setupRequired ? "register" : "login",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint =
        mode === "register" || setupRequired
          ? "/api/auth/register"
          : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          organizationName,
          displayName,
          email,
          phone,
          preferredLanguage: locale,
        }),
      });
      const result = (await response
        .json()
        .catch(() => ({
          error: "The server returned an unexpected response.",
        }))) as { user?: AppUser; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error ?? "Unable to continue");
        return;
      }
      onAuthenticated(result.user);
    } catch {
      setError("The connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const creating = setupRequired || mode === "register";
  return (
    <main className="auth-page">
      <LanguageSelector locale={locale} onChange={onLocaleChange} />
      <section
        className={`auth-card ${creating ? "organization-register" : ""}`}
      >
        <div className="auth-brand">
          <span>P</span>
          <strong>PicklePilot</strong>
        </div>
        {!setupRequired && (
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Register an Interclub
            </button>
          </div>
        )}
        <p className="eyebrow">
          {creating ? "LEAGUE REGISTRATION" : "SECURE ACCESS"}
        </p>
        <h1>{creating ? "Register your organization" : "Welcome back"}</h1>
        <p>
          {creating
            ? "This registration is only for an Interclub administrator. Team captains receive their access directly from the league."
            : "Enter your username. PicklePilot will open the correct administrator or captain portal."}
        </p>
        <form onSubmit={submit}>
          {creating && (
            <>
              <label>
                Organization name
                <input
                  required
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="Example: Interclub Rive-Sud"
                />
              </label>
              <div className="auth-field-row">
                <label>
                  Your name
                  <input
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Contact and recovery"
                  />
                </label>
              </div>
              <label>
                Phone <small>Optional</small>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Optional phone number"
                />
              </label>
            </>
          )}
          <label>
            Username
            <input
              required
              minLength={3}
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={creating ? "Choose a username" : "Username"}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={8}
              type="password"
              autoComplete={creating ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn" disabled={busy}>
            {busy
              ? "Please wait…"
              : creating
                ? "Create Interclub administrator account"
                : "Sign in"}
          </button>
        </form>
        {!creating && (
          <>
            <small className="captain-access-note">
              Captains do not register here. Your Interclub administrator
              provides your username and temporary password.
            </small>
            <a className="public-access-link" href="/public">
              View public schedule & standings →
            </a>
          </>
        )}
      </section>
    </main>
  );
}

function LineupTable({
  lineup,
  editing,
  selected,
  onSwap,
}: {
  lineup: Round[];
  editing: boolean;
  selected: { round: number; index: number } | null;
  onSwap: (round: number, index: number) => void;
}) {
  return (
    <>
      <div className="table-wrap full-lineup desktop-lineup">
        <table>
          <thead>
            <tr>
              <th>ROUND</th>
              <th>COURT 1</th>
              <th>COURT 2</th>
              <th>COURT 3</th>
              <th>REST</th>
            </tr>
          </thead>
          <tbody>
            {lineup.map((row, rowIndex) => (
              <tr key={row.round}>
                <td>
                  <span className="round-number">{row.round}</span>
                </td>
                {row.courts.map((pair, courtIndex) => (
                  <td
                    key={courtIndex}
                    className={
                      mixedRequired.has(`${row.round}-${courtIndex + 1}`)
                        ? "mixed-cell"
                        : ""
                    }
                  >
                    <div className="pair">
                      {pair.map((name, playerIndex) => {
                        const index = courtIndex * 2 + playerIndex;
                        return (
                          <button
                            key={`${name}-${index}`}
                            onClick={() => onSwap(rowIndex, index)}
                            className={
                              editing
                                ? selected?.round === rowIndex &&
                                  selected.index === index
                                  ? "chip selected-chip"
                                  : "chip editable"
                                : "chip"
                            }
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                    {mixedRequired.has(`${row.round}-${courtIndex + 1}`) && (
                      <small className="mixed-label">MIXED</small>
                    )}
                  </td>
                ))}
                <td className="rest-cell">
                  <div className="pair">
                    {row.rest.map((name, playerIndex) => {
                      const index = 6 + playerIndex;
                      return (
                        <button
                          key={`${name}-${index}`}
                          onClick={() => onSwap(rowIndex, index)}
                          className={
                            editing
                              ? selected?.round === rowIndex &&
                                selected.index === index
                                ? "chip selected-chip"
                                : "chip editable"
                              : "chip"
                          }
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-lineup">
        {lineup.map((row, rowIndex) => (
          <article key={row.round}>
            <header>
              <strong>Round {row.round}</strong>
              <span>{row.rest.join(" + ")} rest</span>
            </header>
            {row.courts.map((pair, courtIndex) => (
              <div
                className={
                  mixedRequired.has(`${row.round}-${courtIndex + 1}`)
                    ? "mobile-court mixed-mobile-court"
                    : "mobile-court"
                }
                key={courtIndex}
              >
                <small>
                  Court {courtIndex + 1}
                  {mixedRequired.has(`${row.round}-${courtIndex + 1}`)
                    ? " · MIXED"
                    : ""}
                </small>
                <div>
                  {pair.map((name, playerIndex) => {
                    const index = courtIndex * 2 + playerIndex;
                    return (
                      <button
                        key={`${name}-${index}`}
                        onClick={() => onSwap(rowIndex, index)}
                        className={
                          editing
                            ? selected?.round === rowIndex &&
                              selected.index === index
                              ? "selected"
                              : "editable"
                            : ""
                        }
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="mobile-rest">
              <small>REST</small>
              <strong>{row.rest.join(" + ")}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function PrintLineup({
  match,
  players,
  teamName,
  category,
  locale,
  onBack,
}: {
  match: Match;
  players: Player[];
  teamName: string;
  category: "Performance" | "Development";
  locale: Locale;
  onBack: () => void;
}) {
  const courts = [
    match.court1 || "1",
    match.court2 || "2",
    match.court3 || "3",
  ];
  const warmup = match.warmupMinutes ?? 10,
    duration = match.roundMinutes ?? 12,
    pause = match.breakMinutes ?? 2;
  const toMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };
  const format = (minutes: number) =>
    `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")} h ${String(minutes % 60).padStart(2, "0")}`;
  const start = toMinutes(match.matchTime);
  const date = new Date(match.matchDate + "T12:00:00").toLocaleDateString(
    localeCode(locale),
    { day: "2-digit", month: "long", year: "numeric" },
  );
  const total =
    warmup +
    match.lineup!.length * duration +
    (match.lineup!.length - 1) * pause;
  const women = new Set(
    players
      .filter((player) => player.gender === "W")
      .map((player) => player.name),
  );
  return (
    <section className="print-page">
      <div className="print-controls">
        <button className="ghost-btn" onClick={onBack}>
          ← Matchs
        </button>
        <button className="primary-btn" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
      </div>
      <div className="score-sheet">
        <div className="score-meta">
          <div className="score-date">
            <b>Date :</b>
            <strong>{date}</strong>
          </div>
          <div className="score-team">
            <span>
              <b>Local ou visiteur</b>
              <strong>{(match.homeAway || "Local").toUpperCase()}</strong>
            </span>
            <span>
              <b>Catégorie / équipe / lieu</b>
              <strong>
                {category} · {teamName} | {match.location}
              </strong>
            </span>
          </div>
          <div className="score-start">
            <span>
              <b>Heure début du match :</b>
              <strong>{match.matchTime}</strong>
            </span>
            <span>
              <b>Terrain début séq. :</b>
              <strong>{courts[0]}</strong>
            </span>
          </div>
        </div>
        <table className="score-table">
          <colgroup>
            <col className="round-col" />
            <col className="time-col" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2}>MANCHE</th>
              <th rowSpan={2}>HEURES</th>
              {courts.map((court) => (
                <th className="court-title" key={court}>
                  TERRAIN {court}
                </th>
              ))}
            </tr>
            <tr>
              {courts.map((court) => (
                <th className="side-title" key={court}>
                  {(match.homeAway || "Local").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="warmup-row">
              <td />
              <td>
                {format(start)} <i>–</i> {format(start + warmup)}
              </td>
              {courts.map((court) => (
                <td key={court}>Échauffement</td>
              ))}
            </tr>
            {match.lineup!.map((round, rowIndex) => {
              const roundStart = start + warmup + rowIndex * (duration + pause);
              return (
                <>
                  {
                    <tr
                      className="score-round-row"
                      key={`round-${round.round}`}
                    >
                      <th>{round.round}</th>
                      <td>
                        {format(roundStart)} <i>–</i>{" "}
                        {format(roundStart + duration)}
                      </td>
                      {round.courts.map((pair, courtIndex) => {
                        const mixed = mixedRequired.has(
                          `${round.round}-${courtIndex + 1}`,
                        );
                        const printed = mixed
                          ? [...pair].sort(
                              (a, b) =>
                                Number(women.has(b)) - Number(women.has(a)),
                            )
                          : pair;
                        return (
                          <td className="score-pair" key={courtIndex}>
                            <span className={mixed ? "mixed-name" : ""}>
                              {printed[0]}
                            </span>
                            <span>{printed[1]}</span>
                          </td>
                        );
                      })}
                    </tr>
                  }
                  {rowIndex < match.lineup!.length - 1 && (
                    <tr
                      className="score-break-row"
                      key={`break-${round.round}`}
                    >
                      <td />
                      <td>{pause} min.</td>
                      {courts.map((court) => (
                        <td key={court} />
                      ))}
                    </tr>
                  )}
                </>
              );
            })}
            <tr className="score-total-row">
              <td />
              <td>
                <b>Total:</b> {Math.floor(total / 60)} h{" "}
                {String(total % 60).padStart(2, "0")}
              </td>
              <td colSpan={3}>Cases roses réservées aux joueuses féminines</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
