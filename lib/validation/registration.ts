// lib/validation/registration.ts
import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Member name is required"),
  email: z.string().email("Valid member email is required"),
  ign: z.string().min(2, "Member IGN is required"),
});

export const teamRegistrationSchema = z.object({
  teamName: z.string().min(2, "Team name is required"),
  leaderIGN: z.string().min(2, "Leader IGN is required"),
  contactPhone: z.string().min(7).max(20).optional(),
  members: z.array(teamMemberSchema),
});

export function validateTeamSizeStrict(membersCount: number, teamSize: number) {
  if (!Number.isInteger(teamSize) || teamSize < 2) {
    return "Tournament team size must be at least 2";
  }
  if (membersCount !== teamSize - 1) {
    return `Team must have exactly ${teamSize} players (you provided ${membersCount + 1} including leader)`;
  }
  return null;
}

export const soloRegistrationSchema = z.object({
  ign: z.string().min(2, "IGN is required"),
  contactPhone: z.string().min(7).max(20).optional(),
});
