import { sql } from "drizzle-orm";
import { getDb } from "../../../db";

export async function ensureInterclubAuthSchema() {
  const db=getDb();
  const safeAlter=async(run:()=>Promise<unknown>)=>{try{await run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}};
  const userColumns=await db.all<{name:string}>(sql`PRAGMA table_info(app_users)`);
  if(!userColumns.some(column=>column.name==="preferred_language"))await safeAlter(()=>db.run(sql`ALTER TABLE app_users ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'fr'`));
  await db.run(sql`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_admin_profiles (
    user_id INTEGER PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TEXT
  )`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_teams (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id INTEGER NOT NULL, season_id INTEGER NOT NULL, level_id INTEGER NOT NULL, city TEXT NOT NULL, team_name TEXT NOT NULL, captain_user_id INTEGER, status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS captain_profiles (user_id INTEGER PRIMARY KEY, organization_id INTEGER NOT NULL, league_team_id INTEGER NOT NULL, display_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, must_change_password INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_venues (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id INTEGER NOT NULL, name TEXT NOT NULL, address TEXT, courts TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS league_matches (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id INTEGER NOT NULL, season_id INTEGER NOT NULL, level_id INTEGER NOT NULL, venue_id INTEGER NOT NULL, match_date TEXT NOT NULL, match_time TEXT NOT NULL DEFAULT '20:00', home_team_id INTEGER NOT NULL, visitor_team_id INTEGER NOT NULL, courts TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Scheduled', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  const columns=await db.all<{name:string}>(sql`PRAGMA table_info(league_matches)`);
  if(!columns.some(column=>column.name==="home_wins"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN home_wins INTEGER`));
  if(!columns.some(column=>column.name==="visitor_wins"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN visitor_wins INTEGER`));
  if(!columns.some(column=>column.name==="result_submitted_at"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN result_submitted_at TEXT`));
  if(!columns.some(column=>column.name==="result_outcome"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN result_outcome TEXT`));
  if(!columns.some(column=>column.name==="reschedule_comment"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN reschedule_comment TEXT`));
  if(!columns.some(column=>column.name==="updated_at"))await safeAlter(()=>db.run(sql`ALTER TABLE league_matches ADD COLUMN updated_at TEXT`));
  const venueColumns=await db.all<{name:string}>(sql`PRAGMA table_info(league_venues)`);
  if(!venueColumns.some(column=>column.name==="venue_type"))await safeAlter(()=>db.run(sql`ALTER TABLE league_venues ADD COLUMN venue_type TEXT NOT NULL DEFAULT 'Indoor'`));
}
