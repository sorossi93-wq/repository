export type PrepStatus = "not_started" | "in_progress" | "ready";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  group: "lead" | "north_sea";
}

export interface Client {
  id: string;
  name: string;
  region: "norway" | "uk" | "western_europe" | "cee" | "east_med";
  logo?: string;
  accent: string;
  notes?: string;
}

export interface Meeting {
  id: string;
  date: string;
  clientId: string;
  prepStatus: PrepStatus;
  attendeeIds: string[];
  partnerTravel: string;
  topics: string[];
  notes: string;
}

export interface BDDashboardState {
  meetings: Meeting[];
  lastUpdated: string;
  updatedBy?: string;
}

export const PREP_STATUS_LABELS: Record<PrepStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  ready: "Ready",
};

export const PREP_STATUS_COLORS: Record<PrepStatus, string> = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  ready: "bg-emerald-50 text-emerald-800 border-emerald-200",
};
