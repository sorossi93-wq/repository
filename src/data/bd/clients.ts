import type { Client } from "@/lib/bd/types";

/** Clients extracted from 2026 Europe Meeting — Upstream slides (Rystad 2025). */
export const CLIENTS: Client[] = [
  // Norway
  { id: "equinor", name: "Equinor", region: "norway", logo: "/clients/image16.png", accent: "#E60000", notes: "Active outside Norway" },
  { id: "aker-bp", name: "Aker BP", region: "norway", logo: "/clients/image17.png", accent: "#003DA5", notes: "Maintenance spend inflation — benchmark outcomes Aug" },
  { id: "conoco", name: "ConocoPhillips", region: "norway", logo: "/clients/image18.png", accent: "#E31837", notes: "Christopher to follow up and find connect" },
  { id: "shell-no", name: "Shell", region: "norway", logo: "/clients/image19.png", accent: "#FBCE07", notes: "Digital/AI & non-op — Otto connecting" },
  { id: "var", name: "Vår Energi", region: "norway", logo: "/clients/image20.jpeg", accent: "#00A651", notes: "Confirmed next phase" },
  { id: "okea", name: "Okea", region: "norway", logo: "/clients/image21.png", accent: "#1B365D" },
  { id: "petoro", name: "Petoro", region: "norway", logo: "/clients/image22.png", accent: "#2E5090", notes: "Late Aug/Sept — present benchmark trends" },
  { id: "wintershall", name: "Wintershall Dea", region: "norway", accent: "#009639" },
  { id: "dno", name: "DNO", region: "norway", accent: "#004B87" },

  // UK
  { id: "bp", name: "BP", region: "uk", logo: "/clients/image23.png", accent: "#009900", notes: "Set time up after summer — Christopher" },
  { id: "harbour", name: "Harbour Energy", region: "uk", logo: "/clients/image24.png", accent: "#003087", notes: "Harbour Norway proposal; trading discussions" },
  { id: "ithaca", name: "Ithaca Energy", region: "uk", logo: "/clients/image25.png", accent: "#C41230", notes: "3-day AI immersion Sept/Oct; Capex meetings w/ Tom" },
  { id: "apache", name: "Apache", region: "uk", logo: "/clients/image26.png", accent: "#D71920", notes: "Christopher to follow up with Greg" },
  { id: "repsol", name: "Repsol / NEO Next", region: "uk", logo: "/clients/image27.png", accent: "#FF8200", notes: "Otto to follow up — Neil, Paul, Otto to engage" },
  { id: "perenco", name: "Perenco", region: "uk", accent: "#0054A4", notes: "Otto to continue" },
  { id: "enquest", name: "Enquest", region: "uk", accent: "#E35205", notes: "Connect via internal or cold call" },
  { id: "taqa", name: "TAQA", region: "uk", accent: "#006747", notes: "Big decom portfolio" },
  { id: "dana", name: "Dana Petroleum", region: "uk", accent: "#003B5C", notes: "Otto will confirm" },
  { id: "shell-uk", name: "Shell (UK NS)", region: "uk", logo: "/clients/image19.png", accent: "#FBCE07" },
  { id: "adura", name: "Adura (Shell + Equinor)", region: "uk", accent: "#333333" },

  // Western & Southern Europe
  { id: "eni", name: "Eni", region: "western_europe", logo: "/clients/image28.png", accent: "#FFD700", notes: "Workover AI; Otto to reach out to Sven/Died" },
  { id: "total", name: "TotalEnergies", region: "western_europe", logo: "/clients/image29.png", accent: "#ED1C24", notes: "Otto to inform Julie and Sandra" },
  { id: "ineos", name: "INEOS", region: "western_europe", logo: "/clients/image30.png", accent: "#DA291C", notes: "Give another push" },
  { id: "tenaz", name: "Tenaz Energy", region: "western_europe", accent: "#005EB8", notes: "End of August meeting" },
  { id: "vermillion", name: "Vermilion", region: "western_europe", accent: "#C8102E" },
  { id: "petrogas", name: "Petrogas", region: "western_europe", accent: "#0072CE" },
  { id: "onedyas", name: "OneDyas", region: "western_europe", accent: "#00A3E0" },
  { id: "nam", name: "NAM", region: "western_europe", accent: "#004B87", notes: "Workshop end of August" },

  // CEE
  { id: "omv", name: "OMV", region: "cee", accent: "#009639" },
  { id: "mnd", name: "MOL / MND", region: "cee", accent: "#E4002B" },

  // East Med
  { id: "egpc", name: "EGPC", region: "east_med", accent: "#CE1126" },
  { id: "chevron-em", name: "Chevron (East Med)", region: "east_med", accent: "#0066B2" },
];

export const REGION_LABELS: Record<Client["region"], string> = {
  norway: "Norway",
  uk: "United Kingdom",
  western_europe: "Western & Southern Europe",
  cee: "Central & Eastern Europe",
  east_med: "East Med / Egypt",
};

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

export function clientInitials(name: string): string {
  const parts = name.replace(/\(.*\)/, "").trim().split(/[\s/]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
