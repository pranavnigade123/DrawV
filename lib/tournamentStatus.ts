// lib/tournamentStatus.ts

export type TournamentStatus = "draft" | "open" | "ongoing" | "completed";

export type StatusInputs = {
  registrationOpenAt?: Date | null;
  registrationCloseAt?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  now?: Date; // optional injection for testing
};

/**
 * Computes a tournament's derived status from date windows.
 *
 * Rules (from lowest to highest priority window):
 * - completed: now > endDate
 * - ongoing: startDate <= now <= endDate
 * - open: registrationOpenAt <= now <= registrationCloseAt
 * - draft: otherwise (missing windows or not yet open)
 *
 * Notes:
 * - If only some dates are provided, we fall back gracefully to the best-known state.
 * - If both reg window and event window are present and "now" overlaps both,
 *   event window takes precedence (ongoing/completed) over registration.
 */
export function computeStatus(input: StatusInputs): TournamentStatus {
  const now = input.now ?? new Date();

  const regOpen = toDateOrNull(input.registrationOpenAt);
  const regClose = toDateOrNull(input.registrationCloseAt);
  const start = toDateOrNull(input.startDate);
  const end = toDateOrNull(input.endDate);

  // 1) Completed
  if (end && now > end) {
    return "completed";
  }

  // 2) Ongoing
  if (start && end && now >= start && now <= end) {
    return "ongoing";
  }

  // 3) Open for registration
  if (regOpen && regClose && now >= regOpen && now <= regClose) {
    return "open";
  }

  // 4) Draft (default/fallback)
  return "draft";
}

/**
 * Convenience helpers for list sorting or quick checks.
 */
export const isDraft = (s: TournamentStatus) => s === "draft";
export const isOpen = (s: TournamentStatus) => s === "open";
export const isOngoing = (s: TournamentStatus) => s === "ongoing";
export const isCompleted = (s: TournamentStatus) => s === "completed";

/**
 * Validates date relationships (optional utility).
 * Returns an array of human-readable problems; empty if OK.
 */
export function validateDateWindows(input: StatusInputs): string[] {
  const problems: string[] = [];

  const regOpen = toDateOrNull(input.registrationOpenAt);
  const regClose = toDateOrNull(input.registrationCloseAt);
  const start = toDateOrNull(input.startDate);
  const end = toDateOrNull(input.endDate);

  if (regOpen && regClose && regClose < regOpen) {
    problems.push("Registration close must be after registration open.");
  }

  if (start && end && end < start) {
    problems.push("End date must be after start date.");
  }

  // Optional: ensure reg window occurs before event window when both present.
  if (regClose && start && regClose > start) {
    problems.push("Registration close should be on or before event start.");
  }

  return problems;
}

/**
 * Internal: coerces input into a valid Date or null.
 */
function toDateOrNull(d?: Date | string | number | null): Date | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date.getTime()) ? null : date;
}
