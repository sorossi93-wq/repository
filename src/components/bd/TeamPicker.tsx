"use client";

import { UNIQUE_TEAM } from "@/data/bd/team";

interface TeamPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function TeamPicker({ selected, onChange }: TeamPickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {UNIQUE_TEAM.map((member) => {
        const active = selected.includes(member.id);
        const shortName = member.name.split(" ")[0];
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => toggle(member.id)}
            title={`${member.name} — ${member.role}, ${member.location}`}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              active
                ? "border-bd-navy bg-bd-navy text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-bd-teal/50 hover:bg-bd-teal/5"
            }`}
          >
            {shortName}
            <span className="ml-1 opacity-60">{member.location.slice(0, 3)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AttendeeList({ attendeeIds }: { attendeeIds: string[] }) {
  if (attendeeIds.length === 0) {
    return <span className="text-sm italic text-slate-400">No attendees assigned</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {attendeeIds.map((id) => {
        const member = UNIQUE_TEAM.find((m) => m.id === id);
        if (!member) return null;
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-bd-teal" />
            {member.name.split(" ")[0]} ({member.location})
          </span>
        );
      })}
    </div>
  );
}
