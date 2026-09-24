import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  gender: text("gender", { enum: ["W", "M"] }).notNull(),
  status: text("status", { enum: ["Active", "Inactive"] }).notNull().default("Active"),
  team: text("team").notNull().default("Chambly A"),
  teamId: integer("team_id").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  opponent: text("opponent").notNull(),
  matchDate: text("match_date").notNull(),
  matchTime: text("match_time").notNull(),
  location: text("location").notNull(),
  opponentStrength: text("opponent_strength", { enum: ["Weaker", "Equal", "Stronger"] }).notNull().default("Equal"),
  homeAway: text("home_away", { enum: ["Local", "Visitor"] }).notNull().default("Local"),
  court1: text("court_1").notNull().default("1"),
  court2: text("court_2").notNull().default("2"),
  court3: text("court_3").notNull().default("3"),
  warmupMinutes: integer("warmup_minutes").notNull().default(10),
  roundMinutes: integer("round_minutes").notNull().default(12),
  breakMinutes: integer("break_minutes").notNull().default(2),
  playerIds: text("player_ids").notNull().default("[]"),
  lineup: text("lineup"),
  results: text("results"),
  status: text("status", { enum: ["Upcoming", "Completed"] }).notNull().default("Upcoming"),
  teamId: integer("team_id").notNull().default(1),
  seasonId: integer("season_id").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const seasons = sqliteTable("seasons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["Active", "Closed"] }).notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  closedAt: text("closed_at"),
});

export const venues = sqliteTable("venues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["Active", "Inactive"] }).notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const opponents = sqliteTable("opponents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  city: text("city").notNull(),
  teamName: text("team_name").notNull(),
  defaultStrength: text("default_strength", { enum: ["Weaker", "Equal", "Stronger"] }).notNull().default("Equal"),
  status: text("status", { enum: ["Active", "Inactive"] }).notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const teamSettings = sqliteTable("team_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamName: text("team_name").notNull().default("Chambly A"),
  captainName: text("captain_name").notNull().default("Captain"),
  category: text("category", { enum: ["Performance", "Development"] }).notNull().default("Performance"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const playerRules = sqliteTable("player_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerAId: integer("player_a_id").notNull(),
  playerBId: integer("player_b_id").notNull(),
  ruleType: text("rule_type", { enum: ["Avoid", "Required"] }).notNull(),
  minimumGames: integer("minimum_games").notNull().default(1),
  teamId: integer("team_id").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appUsers = sqliteTable("app_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role", { enum: ["Admin", "User"] }).notNull().default("User"),
  teamId: integer("team_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appSessions = sqliteTable("app_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
