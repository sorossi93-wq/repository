"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClientMarquee } from "@/components/bd/ClientBadge";
import { MeetingCard, MeetingEditor } from "@/components/bd/MeetingCard";
import { WavePlaceholder } from "@/components/bd/WavePlaceholder";
import { CLIENTS } from "@/data/bd/clients";
import { SEED_MEETINGS } from "@/data/bd/seed-meetings";
import { UNIQUE_TEAM } from "@/data/bd/team";
import type { BDDashboardState, Meeting } from "@/lib/bd/types";
import { PREP_STATUS_LABELS } from "@/lib/bd/types";

const STORAGE_KEY = "bd-dashboard-local";
const POLL_MS = 4000;

function newMeeting(): Meeting {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    clientId: CLIENTS[0]?.id ?? "equinor",
    prepStatus: "not_started",
    attendeeIds: [],
    partnerTravel: "",
    topics: [],
    notes: "",
  };
}

export function BDDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>(SEED_MEETINGS);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [editorName, setEditorName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "error">("idle");
  const [filter, setFilter] = useState<"all" | "upcoming" | "needs_prep">("upcoming");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");

  const applyState = useCallback((state: BDDashboardState) => {
    if (state.lastUpdated !== lastSaved.current) {
      setMeetings(state.meetings);
      setLastUpdated(state.lastUpdated);
      lastSaved.current = state.lastUpdated;
    }
  }, []);

  // Initial load: API → localStorage → seed
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bd");
        if (res.ok) {
          applyState(await res.json());
          return;
        }
      } catch {
        /* offline */
      }
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          applyState(JSON.parse(local) as BDDashboardState);
        } catch {
          /* ignore */
        }
      }
    }
    load();
  }, [applyState]);

  // Poll for multi-user sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bd");
        if (res.ok) applyState(await res.json());
      } catch {
        /* ignore */
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [applyState]);

  const persist = useCallback(
    (next: Meeting[]) => {
      setMeetings(next);
      setSyncStatus("syncing");

      const state: BDDashboardState = {
        meetings: next,
        lastUpdated: new Date().toISOString(),
        updatedBy: editorName || "anonymous",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/bd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meetings: next,
              updatedBy: editorName || "anonymous",
            }),
          });
          if (res.ok) {
            const saved = await res.json();
            lastSaved.current = saved.lastUpdated;
            setLastUpdated(saved.lastUpdated);
            setSyncStatus("saved");
          } else {
            setSyncStatus("error");
          }
        } catch {
          setSyncStatus("error");
        }
      }, 600);
    },
    [editorName]
  );

  function updateMeeting(updated: Meeting) {
    persist(meetings.map((m) => (m.id === updated.id ? updated : m)));
    setEditingId(null);
  }

  function deleteMeeting(id: string) {
    persist(meetings.filter((m) => m.id !== id));
    setEditingId(null);
  }

  function addMeeting(meeting: Meeting) {
    persist([...meetings, meeting].sort((a, b) => a.date.localeCompare(b.date)));
    setAddingNew(false);
  }

  async function exportJson() {
    const blob = new Blob([JSON.stringify({ meetings, lastUpdated }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bd-meetings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BDDashboardState;
        if (Array.isArray(data.meetings)) persist(data.meetings);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  async function resetSeed() {
    if (!confirm("Reset all meetings to seed data?")) return;
    const res = await fetch("/api/bd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (res.ok) applyState(await res.json());
  }

  const today = new Date().toISOString().slice(0, 10);
  const filtered = meetings
    .filter((m) => {
      if (filter === "upcoming") return m.date >= today;
      if (filter === "needs_prep") return m.prepStatus !== "ready" && m.date >= today;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const stats = {
    total: meetings.filter((m) => m.date >= today).length,
    ready: meetings.filter((m) => m.date >= today && m.prepStatus === "ready").length,
    inProgress: meetings.filter((m) => m.date >= today && m.prepStatus === "in_progress").length,
    notStarted: meetings.filter((m) => m.date >= today && m.prepStatus === "not_started").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-bd-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-bd-teal-light">
                Upstream · North Sea · Europe
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                BD Meeting Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Pipeline · Actions · Meetings · Deep Dives — 2–3 month horizon
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                placeholder="Your name (for sync)"
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm placeholder:text-white/50 focus:border-bd-teal focus:outline-none"
              />
              <SyncIndicator status={syncStatus} lastUpdated={lastUpdated} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* Client marquee — cute touch */}
        <ClientMarquee />

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Upcoming", value: stats.total, color: "text-bd-navy" },
            { label: "Ready", value: stats.ready, color: "text-emerald-600" },
            { label: "In progress", value: stats.inProgress, color: "text-amber-600" },
            { label: "Not started", value: stats.notStarted, color: "text-slate-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-center shadow-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Section 1: Pipeline */}
        <SectionAnchor id="pipeline" number={1} title="Pipeline" subtitle="Wave opportunities — 2–3 months ahead" />
        <WavePlaceholder
          title="Opportunity Pipeline"
          description="Active pursuits, whitespace, and prioritized BD targets synced from Wave."
          icon="📊"
          items={[
            "Aker BP — Maintenance spend benchmark (Norway)",
            "Harbour — NOV proposal & trading optimisation (UK)",
            "Ithaca — AI immersion programme (UK)",
            "Tenaz — End of August workshop (NL)",
            "Shell — Digital/AI & non-op portfolio (Norway)",
          ]}
        />

        {/* Section 2: Open Actions */}
        <SectionAnchor id="actions" number={2} title="Open Actions" subtitle="Owner-tracked follow-ups from Wave" />
        <WavePlaceholder
          title="Open Actions"
          description="Action items with owners and due dates — live from Wave task tracker."
          icon="✅"
          items={[
            "Christopher → Conoco follow-up & connect",
            "Otto → Repsol/NEO Next — engage with Neil & Paul",
            "Otto → Eni — reach out to Sven/Died",
            "Christopher → BP — schedule post-summer meeting",
            "Otto → Dana confirmation & Perenco continuation",
          ]}
        />

        {/* Section 3: Upcoming Meetings — FULLY FUNCTIONAL */}
        <SectionAnchor
          id="meetings"
          number={3}
          title="Upcoming Meetings"
          subtitle="Live-editable — changes sync every few seconds"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["upcoming", "needs_prep", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filter === f
                    ? "bg-bd-navy text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-bd-teal/40"
                }`}
              >
                {f === "upcoming" ? "Upcoming" : f === "needs_prep" ? "Needs prep" : "All"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="rounded-lg bg-bd-teal px-4 py-2 text-sm font-medium text-white hover:bg-bd-teal-dark"
            >
              + Add meeting
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
            >
              Export JSON
            </button>
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
              Import JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
              />
            </label>
            <button
              type="button"
              onClick={resetSeed}
              className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-red-600"
            >
              Reset seed
            </button>
          </div>
        </div>

        {addingNew && (
          <MeetingEditor
            meeting={newMeeting()}
            onSave={addMeeting}
            onCancel={() => setAddingNew(false)}
            onDelete={() => setAddingNew(false)}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onUpdate={updateMeeting}
              onDelete={deleteMeeting}
              editing={editingId === meeting.id}
              onEdit={() => setEditingId(meeting.id)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            No meetings match this filter. Add one or adjust filters.
          </p>
        )}

        {/* Section 4: Deep Dives */}
        <SectionAnchor id="deep-dives" number={4} title="Deep Dives" subtitle="Initiative deep-dives from Wave" />
        <WavePlaceholder
          title="Deep-Dives on Initiatives"
          description="Strategic initiative reviews, benchmark deep-dives, and workshop outcomes."
          icon="🔍"
          items={[
            "Aker BP — Rosnxt pilot & maintenance inflation deep-dive",
            "Petoro — Benchmark trends presentation (Aug/Sept)",
            "Ithaca — 3-day AI immersion design session",
            "NAM — Groningen decline & decom workshop",
            "Harbour — Trading optimisation & data sharing framework",
          ]}
        />

        {/* Team roster sidebar info */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-bd-navy">North Sea Squad</h3>
          <p className="mt-1 text-sm text-slate-500">
            {UNIQUE_TEAM.length} team members · Leads: Christopher Handscomb (London), Otto van der Molen (Amsterdam)
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {UNIQUE_TEAM.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bd-navy/10 text-xs font-bold text-bd-navy">
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">
                    {m.role}, {m.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        BD Meeting Dashboard · Wave integration placeholder · Prep statuses:{" "}
        {Object.values(PREP_STATUS_LABELS).join(" · ")}
      </footer>
    </div>
  );
}

function SectionAnchor({
  id,
  number,
  title,
  subtitle,
}: {
  id: string;
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 border-b border-slate-200 pb-2">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bd-navy text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-bold text-bd-navy">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function SyncIndicator({
  status,
  lastUpdated,
}: {
  status: "idle" | "syncing" | "saved" | "error";
  lastUpdated: string;
}) {
  const labels = {
    idle: "Ready",
    syncing: "Saving…",
    saved: "Saved",
    error: "Offline — local only",
  };
  const colors = {
    idle: "bg-white/10",
    syncing: "bg-amber-500/20 text-amber-200",
    saved: "bg-emerald-500/20 text-emerald-200",
    error: "bg-red-500/20 text-red-200",
  };

  return (
    <div className={`rounded-lg px-3 py-1.5 text-xs ${colors[status]}`}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {labels[status]}
      {lastUpdated && (
        <span className="ml-2 opacity-60">
          {new Date(lastUpdated).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
