"use client";

import { useState } from "react";
import { ClientBadge } from "@/components/bd/ClientBadge";
import { AttendeeList, TeamPicker } from "@/components/bd/TeamPicker";
import { CLIENTS, getClient } from "@/data/bd/clients";
import type { Meeting, PrepStatus } from "@/lib/bd/types";
import { PREP_STATUS_COLORS, PREP_STATUS_LABELS } from "@/lib/bd/types";

interface MeetingCardProps {
  meeting: Meeting;
  onUpdate: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const diff = Math.ceil(
    (new Date(iso + "T12:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d`;
}

export function MeetingCard({
  meeting,
  onUpdate,
  onDelete,
  editing,
  onEdit,
  onCancel,
}: MeetingCardProps) {
  const client = getClient(meeting.clientId);
  const urgency =
    daysUntil(meeting.date) === "Today" || daysUntil(meeting.date) === "Tomorrow"
      ? "ring-2 ring-bd-teal/30"
      : "";

  if (editing) {
    return (
      <MeetingEditor
        meeting={meeting}
        onSave={onUpdate}
        onCancel={onCancel}
        onDelete={() => onDelete(meeting.id)}
      />
    );
  }

  return (
    <article
      className={`group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md ${urgency}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClientBadge clientId={meeting.clientId} size="lg" />
          {client?.region && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {client.region.replace("_", " ")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PREP_STATUS_COLORS[meeting.prepStatus]}`}
          >
            {PREP_STATUS_LABELS[meeting.prepStatus]}
          </span>
          <span className="rounded-full bg-bd-navy/5 px-2.5 py-0.5 text-xs font-semibold text-bd-navy">
            {daysUntil(meeting.date)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-bd-navy">{formatDate(meeting.date)}</p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendees</p>
          <AttendeeList attendeeIds={meeting.attendeeIds} />
        </div>

        {meeting.partnerTravel && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Partner travel
            </p>
            <p className="text-sm text-slate-600">{meeting.partnerTravel}</p>
          </div>
        )}

        {meeting.topics.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Agenda</p>
            <ul className="space-y-1">
              {meeting.topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bd-teal" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {meeting.notes && (
          <p className="rounded-lg bg-amber-50/50 px-3 py-2 text-xs italic text-amber-900/70">
            {meeting.notes}
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-bd-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-bd-navy-light"
        >
          Edit
        </button>
        <PrepStatusQuick
          status={meeting.prepStatus}
          onChange={(prepStatus) => onUpdate({ ...meeting, prepStatus })}
        />
      </div>
    </article>
  );
}

function PrepStatusQuick({
  status,
  onChange,
}: {
  status: PrepStatus;
  onChange: (s: PrepStatus) => void;
}) {
  const next: Record<PrepStatus, PrepStatus> = {
    not_started: "in_progress",
    in_progress: "ready",
    ready: "not_started",
  };
  return (
    <button
      type="button"
      onClick={() => onChange(next[status])}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
      title="Cycle prep status"
    >
      → {PREP_STATUS_LABELS[next[status]]}
    </button>
  );
}

function MeetingEditor({
  meeting,
  onSave,
  onCancel,
  onDelete,
}: {
  meeting: Meeting;
  onSave: (m: Meeting) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(meeting);
  const [topicInput, setTopicInput] = useState("");

  function addTopic() {
    const t = topicInput.trim();
    if (!t) return;
    setDraft({ ...draft, topics: [...draft.topics, t] });
    setTopicInput("");
  }

  return (
    <article className="rounded-2xl border-2 border-bd-teal/30 bg-white p-5 shadow-md">
      <h4 className="mb-4 text-sm font-semibold text-bd-navy">Edit meeting</h4>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium text-slate-500">
          Date
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-xs font-medium text-slate-500">
          Client
          <select
            value={draft.clientId}
            onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
          Prep status
          <select
            value={draft.prepStatus}
            onChange={(e) =>
              setDraft({ ...draft, prepStatus: e.target.value as PrepStatus })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="ready">Ready</option>
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
          Partner travel
          <input
            type="text"
            value={draft.partnerTravel}
            onChange={(e) => setDraft({ ...draft, partnerTravel: e.target.value })}
            placeholder="e.g. Paul — Aberdeen; Neil — London"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-slate-500">Attendees</p>
          <div className="mt-2">
            <TeamPicker
              selected={draft.attendeeIds}
              onChange={(attendeeIds) => setDraft({ ...draft, attendeeIds })}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-slate-500">Topics / agenda</p>
          <ul className="mb-2 mt-1 space-y-1">
            {draft.topics.map((topic, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{topic}</span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      topics: draft.topics.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              placeholder="Add topic…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addTopic}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
            >
              Add
            </button>
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
          Notes
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded-lg bg-bd-teal px-4 py-2 text-sm font-medium text-white hover:bg-bd-teal-dark"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export { MeetingEditor };
