// lib/services/bracketService.ts
import { connectDB } from "@/lib/db";
import Registration from "@/lib/models/Registration";
import Tournament from "@/lib/models/Tournament";
import Bracket from "@/lib/models/Brackets";
import mongoose from "mongoose";
import { generateBracketSkeleton } from "@/lib/bracket/generateSkeleton";

export interface Participant {
  id: string;
  name: string;
  type: "team" | "player";
}

/**
 * Fetch approved registrations for a tournament
 */
export async function fetchApprovedRegistrations(tournamentId: string): Promise<Participant[]> {
  await connectDB();

  const registrations = await Registration.find({
    tournamentId: new mongoose.Types.ObjectId(tournamentId),
    status: "approved",
  })
    .sort({ createdAt: 1 })
    .lean();

  return registrations.map((reg) => {
    if (reg.entryType === "team") {
      return {
        id: reg._id.toString(),
        name: reg.team?.name || "Unknown Team",
        type: "team" as const,
      };
    } else {
      return {
        id: reg._id.toString(),
        name: reg.solo?.ign || reg.solo?.name || "Unknown Player",
        type: "player" as const,
      };
    }
  });
}

/**
 * Seed participants based on method
 */
export function seedParticipants(
  participants: Participant[],
  method: "random" | "registration_order" = "registration_order"
): Participant[] {
  if (method === "random") {
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  return participants; // registration_order (already sorted by createdAt)
}

// Removed - using generateBracketSkeleton from lib/bracket/generateSkeleton.ts instead

/**
 * Main function: Generate bracket from tournament
 */
export async function generateBracketFromTournament(
  tournamentId: string,
  seedingMethod: "random" | "registration_order" = "registration_order",
  manualParticipants?: { id: string; name: string }[],
  bracketFormat?: "single_elim" | "double_elim"
) {
  await connectDB();

  // Fetch tournament
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  // Check if bracket already exists
  if (tournament.bracketGenerated && tournament.bracketId) {
    throw new Error("Bracket already generated for this tournament");
  }

  // Fetch approved registrations
  let participants = await fetchApprovedRegistrations(tournamentId);

  // Add manual participants if provided
  if (manualParticipants && manualParticipants.length > 0) {
    const manualParts: Participant[] = manualParticipants.map((p) => ({
      id: p.id,
      name: p.name,
      type: tournament.entryType === "team" ? "team" : "player",
    }));
    participants = [...participants, ...manualParts];
  }

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate bracket");
  }

  // Use provided format or fall back to tournament format
  const format = bracketFormat || tournament.format;

  // Validate format
  if (format !== "single_elim" && format !== "double_elim") {
    throw new Error(`Bracket generation not yet supported for ${format} format`);
  }

  // Seed participants
  const seededParticipants = seedParticipants(participants, seedingMethod);
  const participantCount = seededParticipants.length;

  // Helper function
  function isPowerOfTwo(n: number) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  // Calculate bracket requirements
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const byesNeeded = nextPowerOf2 - participantCount;

  // Build participant list for bracket generation
  let participantNames: string[] = [];

  if (format === "double_elim" || isPowerOfTwo(participantCount)) {
    // For double elim or perfect power of 2, use all participants
    participantNames = seededParticipants.map((p) => p.name);
    
    // For double elim with non-power-of-2, pad with nulls
    if (format === "double_elim" && byesNeeded > 0) {
      for (let i = 0; i < byesNeeded; i++) {
        participantNames.push(`_BYE_${i + 1}`);
      }
    }
  } else {
    // For single elim with byes: generate for next power of 2
    // Top seeds get byes, bottom seeds play Round 1
    const teamsWithByes = seededParticipants.slice(0, byesNeeded);
    const teamsInRound1 = seededParticipants.slice(byesNeeded);
    
    // Create participant list: bye teams first, then Round 1 teams
    participantNames = [
      ...teamsWithByes.map((p) => p.name),
      ...teamsInRound1.map((p) => p.name),
    ];
  }

  // Generate bracket skeleton
  const skeleton = generateBracketSkeleton(format, participantNames);

  // For single elim with byes, adjust the bracket structure
  if (format === "single_elim" && !isPowerOfTwo(participantCount)) {
    const teamsWithByes = seededParticipants.slice(0, byesNeeded);
    const teamsInRound1 = seededParticipants.slice(byesNeeded);
    const round1MatchesNeeded = teamsInRound1.length / 2;
    
    // Get all matches by round
    const matchesByRound: Record<number, any[]> = {};
    skeleton.matches.forEach((m: any) => {
      if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
      matchesByRound[m.round].push(m);
    });
    
    const round1 = matchesByRound[1] || [];
    const round2 = matchesByRound[2] || [];
    
    console.log("🔍 Debug - Round 1 matches:", round1.length);
    console.log("🔍 Debug - Round 2 matches:", round2.length);
    console.log("🔍 Debug - Round 1 matches needed:", round1MatchesNeeded);
    console.log("🔍 Debug - Byes needed:", byesNeeded);
    
    // Rebuild Round 1 with only necessary matches
    const newRound1: any[] = [];
    for (let i = 0; i < round1MatchesNeeded; i++) {
      const originalMatch = round1[i];
      const targetRound2Match = round2[i]; // Match index correspondence
      
      console.log(`🔍 R1M${i + 1} should feed into ${targetRound2Match?.id}`);
      
      newRound1.push({
        ...originalMatch,
        opponentA: {
          type: "team",
          label: teamsInRound1[i * 2]?.name || null,
          propagatedFrom: null,
        },
        opponentB: {
          type: "team",
          label: teamsInRound1[i * 2 + 1]?.name || null,
          propagatedFrom: null,
        },
        winnerto: targetRound2Match?.id || null,
      });
    }
    
    // Place bye teams in Round 2
    let byeIndex = 0;
    
    // First, place bye teams in Round 2 matches that receive Round 1 winners
    for (let i = 0; i < round1MatchesNeeded && byeIndex < teamsWithByes.length; i++) {
      const r2Match = round2[i];
      if (r2Match) {
        console.log(`🔍 Placing ${teamsWithByes[byeIndex].name} in ${r2Match.id} slot A`);
        // Place one bye team in slot A (Round 1 winner will go to slot B)
        r2Match.opponentA = {
          type: "team",
          label: teamsWithByes[byeIndex].name,
          propagatedFrom: "BYE",
        };
        byeIndex++;
      }
    }
    
    // Then, place remaining bye teams in pairs in the rest of Round 2 matches
    for (let i = round1MatchesNeeded; i < round2.length && byeIndex < teamsWithByes.length; i++) {
      const r2Match = round2[i];
      if (r2Match) {
        // Place two bye teams
        if (byeIndex < teamsWithByes.length) {
          console.log(`🔍 Placing ${teamsWithByes[byeIndex].name} in ${r2Match.id} slot A`);
          r2Match.opponentA = {
            type: "team",
            label: teamsWithByes[byeIndex].name,
            propagatedFrom: "BYE",
          };
          byeIndex++;
        }
        if (byeIndex < teamsWithByes.length) {
          console.log(`🔍 Placing ${teamsWithByes[byeIndex].name} in ${r2Match.id} slot B`);
          r2Match.opponentB = {
            type: "team",
            label: teamsWithByes[byeIndex].name,
            propagatedFrom: "BYE",
          };
          byeIndex++;
        }
      }
    }
    
    // Rebuild matches array with new Round 1
    skeleton.matches = [
      ...newRound1,
      ...Object.entries(matchesByRound)
        .filter(([round]) => Number(round) > 1)
        .flatMap(([, matches]) => matches),
    ];
    
    console.log("🔍 Final bracket structure:");
    skeleton.matches.forEach((m: any) => {
      if (m.round <= 2) {
        console.log(`  ${m.id}: ${m.opponentA?.label || "TBD"} vs ${m.opponentB?.label || "TBD"} → ${m.winnerto || "END"}`);
      }
    });
  }

  // Create bracket document
  const bracketId = `bracket-${tournamentId}-${Date.now()}`;
  // Calculate byes for params (already calculated above)
  const byesGiven = byesNeeded;

  const bracket = await Bracket.create({
    bracketId,
    tournamentId,
    ownerId: tournament.createdBy,
    format: format,
    participantsCount: participants.length,
    params: {
      seedingMethod,
      bracketFormat: format,
      generatedAt: new Date(),
      byesGiven,
    },
    matches: skeleton.matches,
  });

  // Update tournament with bracket info
  tournament.bracketId = bracketId;
  tournament.bracketGenerated = true;
  tournament.bracketPublished = false;
  await tournament.save();

  return {
    bracket,
    tournament,
    participantsCount: participants.length,
  };
}

/**
 * Publish/unpublish bracket
 */
export async function toggleBracketPublish(tournamentId: string, publish: boolean) {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  if (!tournament.bracketGenerated) {
    throw new Error("No bracket to publish");
  }

  tournament.bracketPublished = publish;
  await tournament.save();

  return tournament;
}
