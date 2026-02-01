/**
 * ==============================================================================
 * BRACKET GENERATOR - Main Entry Point
 * ==============================================================================
 * 
 * This file provides the main bracket generation functions used by the API.
 * Uses proper DSA implementations from algorithms.ts
 * 
 * ==============================================================================
 */

import { 
  generateSingleElimination, 
  generateDoubleElimination,
  type BracketMatch 
} from "./algorithms";

/**
 * Generate Single Elimination bracket skeleton
 */
export function generateSingleElimSkeleton(n: number, labels: string[] = []) {
  const teams = labels.length > 0 
    ? labels 
    : Array.from({ length: n }, (_, i) => `Team ${i + 1}`);
  
  const result = generateSingleElimination(teams, {
    shuffle: false,
    seeding: "standard",
  });

  return {
    bracketId: result.bracketId,
    format: result.format,
    participantsCount: result.participantsCount,
    matches: result.matches,
  };
}

/**
 * Generate Double Elimination bracket skeleton
 */
export function generateDoubleElimSkeleton(n: number, labels: string[] = []) {
  const teams = labels.length > 0 
    ? labels 
    : Array.from({ length: n }, (_, i) => `Team ${i + 1}`);
  
  const result = generateDoubleElimination(teams, {
    shuffle: false,
    seeding: "standard",
  });

  return {
    bracketId: result.bracketId,
    format: result.format,
    participantsCount: result.participantsCount,
    matches: result.matches,
  };
}

/**
 * Main bracket generation function
 * Used by API routes
 */
export function generateBracketSkeleton(
  format: "single_elim" | "double_elim",
  participants: string[],
  options?: {
    shuffle?: boolean;
    seeding?: "standard" | "snake";
  }
) {
  // Clean participants
  const cleanedParticipants = participants.filter(p => p && p.trim() !== "");
  
  if (cleanedParticipants.length < 2) {
    throw new Error("At least 2 participants required");
  }

  if (format === "single_elim") {
    const result = generateSingleElimination(cleanedParticipants, {
      shuffle: options?.shuffle || false,
      seeding: options?.seeding || "standard",
    });
    
    return {
      bracketId: result.bracketId,
      format: result.format,
      participantsCount: result.participantsCount,
      matches: result.matches,
    };
  } else {
    const result = generateDoubleElimination(cleanedParticipants, {
      shuffle: options?.shuffle || false,
      seeding: options?.seeding || "standard",
    });
    
    return {
      bracketId: result.bracketId,
      format: result.format,
      participantsCount: result.participantsCount,
      matches: result.matches,
    };
  }
}
