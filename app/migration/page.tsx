"use client";

import { ChangeEvent, useState } from "react";

export default function MigrationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function importBackup() {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      const payload = JSON.parse(await file.text());
      const response = await fetch("/api/league/migration-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json() as { error?: string; ok?: boolean };
      if (!response.ok || !body.ok) throw new Error(body.error || "Import failed");
      setMessage("Import complete. Sign in again with your existing Interclub account.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed"); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 640, margin: "56px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
    <p style={{ color: "#48665d", fontWeight: 700, letterSpacing: ".08em", fontSize: 12 }}>PICKLEPILOT MIGRATION</p>
    <h1>Restore your Interclub backup</h1>
    <p>This one-time step replaces the newly created destination database with your saved PicklePilot data.</p>
    <p>Only use this on the new Cloudflare deployment, immediately after creating its temporary Interclub administrator account.</p>
    <input type="file" accept="application/json" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} />
    <button disabled={!file || busy} onClick={importBackup} style={{ display: "block", marginTop: 20, padding: "12px 18px", fontWeight: 700 }}>{busy ? "Importing…" : "Import backup"}</button>
    {message && <p role="status" style={{ marginTop: 20, fontWeight: 600 }}>{message}</p>}
  </main>;
}