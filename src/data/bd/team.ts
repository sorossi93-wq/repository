import type { TeamMember } from "@/lib/bd/types";

export const TEAM: TeamMember[] = [
  { id: "ch", name: "Christopher Handscomb", role: "Partner", location: "London", group: "lead" },
  { id: "ovm", name: "Otto van der Molen", role: "Partner", location: "Amsterdam", group: "lead" },
  { id: "pg", name: "Paul Gargett", role: "Partner", location: "London", group: "north_sea" },
  { id: "ovm-ns", name: "Otto van der Molen", role: "Partner", location: "Amsterdam", group: "north_sea" },
  { id: "sa", name: "Sverre Akersveen", role: "AP", location: "Oslo", group: "north_sea" },
  { id: "nh", name: "Neil Hamzaoui", role: "Expert AP", location: "London", group: "north_sea" },
  { id: "sr", name: "Sofia Rossi", role: "Expert EM", location: "Amsterdam", group: "north_sea" },
  { id: "ct", name: "Christian Therkelsen", role: "Partner", location: "Oslo", group: "north_sea" },
  { id: "al", name: "Aisha Lemsom", role: "Partner", location: "Amsterdam", group: "north_sea" },
  { id: "ad", name: "Adam Davey", role: "AP", location: "London", group: "north_sea" },
  { id: "on", name: "Ola Nestvold", role: "AP", location: "Oslo", group: "north_sea" },
  { id: "fn", name: "Fredrik Njåstein", role: "EM", location: "Oslo", group: "north_sea" },
];

export const UNIQUE_TEAM = TEAM.filter(
  (member, index, arr) => arr.findIndex((m) => m.name === member.name) === index
);

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM.find((m) => m.id === id);
}
