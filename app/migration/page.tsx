"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { LanguageSelector, Locale, useDomLocalization } from "../i18n";

export default function MigrationPage() {
  const [locale,setLocale]=useState<Locale>("en");
  useDomLocalization(locale);
  useEffect(()=>{const saved=window.localStorage.getItem("picklepilot-captain-language");if(saved==="fr"||saved==="en")setLocale(saved)},[]);
  function changeLocale(next:Locale){setLocale(next);window.localStorage.setItem("picklepilot-captain-language",next)}
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setMessage("");
    setFile(event.target.files?.[0] ?? null);
  }

  async function restore() {
    if (!file) {
      setMessage("Choose the Captain backup file first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const backup = JSON.parse(await file.text());
      const response = await fetch("/api/migration-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The backup could not be restored.");
      setMessage("Restore complete. Sign in again with your existing Captain account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The backup could not be restored.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "72px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <LanguageSelector locale={locale} onChange={changeLocale}/>
      <p style={{ color: "#176b58", fontWeight: 700, letterSpacing: 1.2 }}>PICKLEPILOT CAPTAIN</p>
      <h1>Restore your Captain backup</h1>
      <p>This replaces only the empty new workspace with the data from your existing Captain account.</p>
      <input type="file" accept="application/json,.json" onChange={selectFile} />
      <div style={{ marginTop: 20 }}>
        <button onClick={restore} disabled={busy || !file} style={{ padding: "12px 18px", border: 0, borderRadius: 8, background: "#176b58", color: "white", fontWeight: 700 }}>
          {busy ? "Restoring…" : "Restore backup"}
        </button>
      </div>
      {message && <p role="status" style={{ marginTop: 20, fontWeight: 600 }}>{message}</p>}
    </main>
  );
}
