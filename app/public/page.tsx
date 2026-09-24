"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LanguageSelector,
  Locale,
  localeCode,
  localizeDivision,
  useDomLocalization,
} from "../i18n";

type Season = { id: number; name: string; status: "Active" | "Closed" };
type Level = { id: number; seasonId: number; name: string };
type Team = {
  id: number;
  seasonId: number;
  levelId: number;
  city: string;
  teamName: string;
};
type Venue = {
  id: number;
  name: string;
  address: string | null;
  venueType: string;
  courts: string[];
};
type Match = {
  id: number;
  seasonId: number;
  levelId: number;
  venueId: number;
  matchDate: string;
  matchTime: string;
  homeTeamId: number;
  visitorTeamId: number;
  courts: string[];
  status: string;
  homeWins: number | null;
  visitorWins: number | null;
};
type Standing = {
  levelId: number;
  seasonId: number;
  rows: {
    teamId: number;
    played: number;
    wins16: number;
    wins15: number;
    losses8: number;
    losses7: number;
    ties: number;
    difference: number;
    points: number;
  }[];
};

export default function PublicLeague() {
  const [locale, setLocale] = useState<Locale>("fr");
  useDomLocalization(locale);
  const [data, setData] = useState<{
      organization: { name: string };
      seasons: Season[];
      levels: Level[];
      teams: Team[];
      venues: Venue[];
      matches: Match[];
      standings: Standing[];
    } | null>(null),
    [seasonId, setSeasonId] = useState<number | "">(""),
    [levelId, setLevelId] = useState<number | "">(""),
    [teamId, setTeamId] = useState<number | "">(""),
    [view, setView] = useState<"schedule" | "standings">("schedule");
  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem("picklepilot-language");
      if (stored === "fr" || stored === "en") setLocale(stored);
    });
    fetch("/api/public/league")
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        const active =
          result.seasons?.find(
            (season: Season) => season.status === "Active",
          ) ?? result.seasons?.[0];
        if (active) setSeasonId(active.id);
      });
  }, []);
  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("picklepilot-language", nextLocale);
  }
  const season = data?.seasons.find((item) => item.id === seasonId),
    levels = useMemo(
      () => data?.levels.filter((item) => item.seasonId === seasonId) ?? [],
      [data, seasonId],
    );
  useEffect(() => {
    if (levels.length && !levels.some((item) => item.id === levelId))
      setLevelId(levels[0].id);
    setTeamId("");
  }, [seasonId, levels.length]);
  const currentTeams =
      data?.teams.filter((item) => item.levelId === levelId) ?? [],
    matches =
      data?.matches
        .filter(
          (item) =>
            item.seasonId === seasonId &&
            item.levelId === levelId &&
            (teamId === "" ||
              item.homeTeamId === teamId ||
              item.visitorTeamId === teamId),
        )
        .sort((a, b) =>
          `${a.matchDate}${a.matchTime}`.localeCompare(
            `${b.matchDate}${b.matchTime}`,
          ),
        ) ?? [],
    standing = data?.standings.find((item) => item.levelId === levelId);
  if (!data)
    return <main className="public-loading">Loading competition…</main>;
  return (
    <main className="public-league">
      <LanguageSelector locale={locale} onChange={changeLocale} />
      <header>
        <a className="public-brand" href="/">
          PicklePilot
        </a>
        <div>
          <p>{data.organization?.name ?? "Interclub"}</p>
          <h1>Competition schedule & standings</h1>
        </div>
      </header>
      <nav className="public-view-tabs" aria-label="Public competition pages">
        {season?.status === "Active" && (
          <button
            className={view === "schedule" ? "active" : ""}
            onClick={() => setView("schedule")}
          >
            Schedule
          </button>
        )}
        <button
          className={view === "standings" ? "active" : ""}
          onClick={() => setView("standings")}
        >
          Standings
        </button>
      </nav>
      <section className="public-controls">
        <label>
          Season
          <select
            value={seasonId}
            onChange={(event) => {
              const nextId = Number(event.target.value);
              setSeasonId(nextId);
              if (
                data.seasons.find((item) => item.id === nextId)?.status !==
                "Active"
              )
                setView("standings");
            }}
          >
            {data.seasons.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.status === "Active" ? " · Current" : ""}
              </option>
            ))}
          </select>
        </label>
        {season?.status === "Active" && view === "schedule" && (
          <label>
            Team
            <select
              value={teamId}
              onChange={(event) =>
                setTeamId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            >
              <option value="">All teams</option>
              {currentTeams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.city} · {item.teamName}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>
      <nav className="public-division-tabs" aria-label="Competition divisions">
        {levels.map((item) => (
          <button
            key={item.id}
            className={levelId === item.id ? "active" : ""}
            onClick={() => {
              setLevelId(item.id);
              setTeamId("");
            }}
          >
            {localizeDivision(item.name, locale)}
          </button>
        ))}
      </nav>
      {season?.status === "Active" && view === "schedule" && (
        <section className="public-schedule">
          <div className="public-section-heading">
            <div>
              <p>SEASON SCHEDULE</p>
              <h2>
                {season.name} ·{" "}
                {localizeDivision(
                  levels.find((item) => item.id === levelId)?.name ?? "",
                  locale,
                )}
              </h2>
            </div>
            <span>
              {matches.length} match{matches.length === 1 ? "" : "es"}
            </span>
          </div>
          {matches.length ? (
            matches.map((match) => {
              const home = data.teams.find(
                  (item) => item.id === match.homeTeamId,
                ),
                visitor = data.teams.find(
                  (item) => item.id === match.visitorTeamId,
                ),
                venue = data.venues.find((item) => item.id === match.venueId);
              return (
                <article key={match.id}>
                  <time>
                    <b>
                      {new Date(
                        `${match.matchDate}T12:00:00`,
                      ).toLocaleDateString(localeCode(locale), {
                        day: "2-digit",
                        month: "short",
                      })}
                    </b>
                    <span>{match.matchTime}</span>
                  </time>
                  <div className="public-fixture">
                    <div>
                      <small>HOME</small>
                      <strong>
                        {home?.city} · {home?.teamName}
                      </strong>
                    </div>
                    <b>VS</b>
                    <div>
                      <small>VISITOR</small>
                      <strong>
                        {visitor?.city} · {visitor?.teamName}
                      </strong>
                    </div>
                  </div>
                  <div className="public-venue">
                    <strong>{venue?.name}</strong>
                    <small>
                      {venue?.address || venue?.venueType} · Courts{" "}
                      {match.courts.join(", ")}
                    </small>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="public-empty">No matches found for this selection.</p>
          )}
        </section>
      )}
      {view === "standings" && (
        <section className="public-standings">
          <div className="public-section-heading">
            <div>
              <p>
                {season?.status === "Active"
                  ? "LIVE STANDINGS"
                  : "FINAL STANDINGS"}
              </p>
              <h2>
                {season?.name} ·{" "}
                {localizeDivision(
                  levels.find((item) => item.id === levelId)?.name ?? "",
                  locale,
                )}
              </h2>
            </div>
            <span>Official results only</span>
          </div>
          <div className="public-table-wrap">
            <div className="public-table public-head">
              <span>RANK</span>
              <span>TEAM</span>
              <span>CLUB</span>
              <span>MJ</span>
              <span>16+</span>
              <span>13–15</span>
              <span>8+ L</span>
              <span>0–7 L</span>
              <span>TIE</span>
              <span>POINTS</span>
              <span>DIFF.</span>
            </div>
            {standing?.rows.map((row, index) => {
              const team = data.teams.find((item) => item.id === row.teamId);
              return (
                <div className="public-table" key={row.teamId}>
                  <b>{index + 1}</b>
                  <strong>{team?.teamName}</strong>
                  <span>{team?.city}</span>
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
              );
            })}
          </div>
          <p className="public-rule">
            3 pts: victory with 16+ wins · 2 pts: victory 13–15 · 1 pt: loss
            with 8+ wins or tie.
          </p>
        </section>
      )}
    </main>
  );
}
