/**
 * ==============================================================================
 * BRACKET GENERATION ALGORITHMS - FIXED IMPLEMENTATION
 * ==============================================================================
 * 
 * Properly implements Double Elimination with correct:
 * - Match connections (winnerto)
 * - Loser bracket wiring (loserto)
 * - Standard tournament structure matching Challonge/FACEIT
 * 
 * ==============================================================================
 */

import { randomBytes } from "crypto";

// ==============================================================================
// TYPE DEFINITIONS
// ==============================================================================

export type MatchParticipant = {
  type: "team" | "placeholder" | "bye";
  label: string | null;
  seed?: number;
  propagatedFrom?: string | null;
};

export type BracketMatch = {
  id: string;
  bracket: "W" | "L" | "F";
  round: number;
  matchNumber: number;
  opponentA: MatchParticipant;
  opponentB: MatchParticipant;
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
  winnerto: string | null;
  loserto: string | null;
  metadata: Record<string, any>;
};

export type BracketTree = {
  bracketId: string;
  format: "single_elim" | "double_elim";
  participantsCount: number;
  matches: BracketMatch[];
  teamMap?: Map<string, string>;
};

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function generateId(): string {
  return randomBytes(6).toString("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

function createTeam(label: string | null, seed?: number): MatchParticipant {
  return { type: "team", label, seed, propagatedFrom: null };
}

function createBye(): MatchParticipant {
  return { type: "bye", label: "BYE", propagatedFrom: null };
}

function createPlaceholder(): MatchParticipant {
  return { type: "placeholder", label: null, propagatedFrom: null };
}

// ==============================================================================
// TEAM PLACEMENT ALGORITHMS
// ==============================================================================

export function shuffleTeams(teams: string[]): string[] {
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function snakeSeed(teams: string[]): string[] {
  const n = teams.length;
  const bracketSize = nextPowerOfTwo(n);
  const seeds: Array<{ seed: number; team: string | null }> = [];
  
  for (let i = 0; i < bracketSize; i++) {
    seeds.push({ seed: i + 1, team: teams[i] || null });
  }
  
  const paired: string[] = [];
  for (let round = 0; round < Math.log2(bracketSize); round++) {
    const groupSize = Math.pow(2, round + 1);
    for (let group = 0; group < bracketSize / groupSize; group++) {
      const start = group * groupSize;
      const end = start + groupSize;
      const groupSeeds = seeds.slice(start, end);
      
      while (groupSeeds.length > 0) {
        const top = groupSeeds.shift()!;
        const bottom = groupSeeds.pop()!;
        if (round === 0) {
          paired.push(top.team || "BYE");
          paired.push(bottom.team || "BYE");
        }
      }
    }
    if (round === 0) break;
  }
  
  return paired.slice(0, bracketSize);
}

export function insertByes(teams: string[]): string[] {
  const bracketSize = nextPowerOfTwo(teams.length);
  const byeCount = bracketSize - teams.length;
  const result = [...teams];
  
  for (let i = 0; i < byeCount; i++) {
    result.push("BYE");
  }
  
  return result;
}

// ==============================================================================
// SINGLE ELIMINATION
// ==============================================================================

export function generateSingleElimination(
  teams: string[],
  options: { shuffle?: boolean; seeding?: "standard" | "snake" } = {}
): BracketTree {
  let preparedTeams = [...teams];
  
  if (options.shuffle) {
    preparedTeams = shuffleTeams(preparedTeams);
  }
  
  if (options.seeding === "snake") {
    preparedTeams = snakeSeed(preparedTeams);
  }
  
  preparedTeams = insertByes(preparedTeams);
  
  const bracketSize = preparedTeams.length;
  const rounds = Math.log2(bracketSize);
  const matches: BracketMatch[] = [];
  
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      const matchId = `R${round}M${matchNum}`;
      
      let oppA: MatchParticipant;
      let oppB: MatchParticipant;
      
      if (round === 1) {
        const indexA = (matchNum - 1) * 2;
        const indexB = indexA + 1;
        const teamA = preparedTeams[indexA];
        const teamB = preparedTeams[indexB];
        
        oppA = teamA === "BYE" ? createBye() : createTeam(teamA, indexA + 1);
        oppB = teamB === "BYE" ? createBye() : createTeam(teamB, indexB + 1);
      } else {
        oppA = createPlaceholder();
        oppB = createPlaceholder();
      }
      
      const winnerto = round < rounds ? `R${round + 1}M${Math.ceil(matchNum / 2)}` : null;
      
      matches.push({
        id: matchId,
        bracket: "W",
        round,
        matchNumber: matchNum,
        opponentA: oppA,
        opponentB: oppB,
        scoreA: null,
        scoreB: null,
        winner: null,
        finished: false,
        winnerto,
        loserto: null,
        metadata: {},
      });
    }
  }
  
  return {
    bracketId: generateId(),
    format: "single_elim",
    participantsCount: teams.length,
    matches,
  };
}

// ==============================================================================
// DOUBLE ELIMINATION - FIXED IMPLEMENTATION
// ==============================================================================

/**
 * Generate Double Elimination Bracket with PROPER wiring
 * 
 * For 8 teams:
 * Winners Bracket:
 *   R1: 4 matches (R1M1, R1M2, R1M3, R1M4)
 *   R2: 2 matches (R2M1, R2M2)
 *   R3: 1 match (R3M1 - WB Final)
 * 
 * Losers Bracket:
 *   L1: 2 matches - R1 losers play each other
 *   L2: 2 matches - L1 winners vs R2 losers
 *   L3: 1 match - L2 winners play
 *   L4: 1 match - L3 winner vs R3 (WB Final) loser
 * 
 * Grand Final:
 *   GF: WB Champion vs LB Champion
 *   GF2: (if necessary) - bracket reset
 */
export function generateDoubleElimination(
  teams: string[],
  options: { shuffle?: boolean; seeding?: "standard" | "snake" } = {}
): BracketTree {
  let preparedTeams = [...teams];
  
  if (options.shuffle) {
    preparedTeams = shuffleTeams(preparedTeams);
  }
  
  if (options.seeding === "snake") {
    preparedTeams = snakeSeed(preparedTeams);
  }
  
  preparedTeams = insertByes(preparedTeams);
  
  const n = preparedTeams.length;
  if (!isPowerOfTwo(n)) {
    throw new Error("Team count must be power of 2 after BYE insertion");
  }
  
  const wbRounds = Math.log2(n); // 3 for 8 teams
  const matches: BracketMatch[] = [];
  
  // Helper to find match
  const findMatch = (id: string) => matches.find(m => m.id === id);
  
  // ==================================================================
  // WINNERS BRACKET
  // ==================================================================
  
  for (let round = 1; round <= wbRounds; round++) {
    const matchesInRound = n / Math.pow(2, round);
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      const matchId = `R${round}M${matchNum}`;
      
      let oppA: MatchParticipant;
      let oppB: MatchParticipant;
      
      if (round === 1) {
        const indexA = (matchNum - 1) * 2;
        const indexB = indexA + 1;
        const teamA = preparedTeams[indexA];
        const teamB = preparedTeams[indexB];
        
        oppA = teamA === "BYE" ? createBye() : createTeam(teamA, indexA + 1);
        oppB = teamB === "BYE" ? createBye() : createTeam(teamB, indexB + 1);
      } else {
        oppA = createPlaceholder();
        oppB = createPlaceholder();
      }
      
      // Winner goes to next WB round, or to GF if WB final
      const winnerto = round < wbRounds 
        ? `R${round + 1}M${Math.ceil(matchNum / 2)}` 
        : "GF";
      
      matches.push({
        id: matchId,
        bracket: "W",
        round,
        matchNumber: matchNum,
        opponentA: oppA,
        opponentB: oppB,
        scoreA: null,
        scoreB: null,
        winner: null,
        finished: false,
        winnerto,
        loserto: null, // Will be set below
        metadata: {},
      });
    }
  }
  
  // ==================================================================
  // LOSERS BRACKET
  // 
  // Structure for 8 teams (wbRounds = 3):
  // L1: wbRounds=3 → L1 has n/4 = 2 matches (R1 losers paired)
  // L2: 2 matches (L1 winners vs R2 losers)
  // L3: 1 match (L2 winners play)
  // L4: 1 match (L3 winner vs R3/WB Final loser)
  // 
  // Total LB rounds = 2 * wbRounds - 2 = 4 for 8 teams
  // ==================================================================
  
  const lbRounds = 2 * wbRounds - 2;
  
  // Create LB matches with proper structure
  let lbMatchCounter = 0;
  const lbStructure: { round: number; count: number }[] = [];
  
  // Calculate LB structure
  // Odd LB rounds: internal LB advancement (halving)
  // Even LB rounds: same count as previous (WB drop-ins)
  let currentCount = n / 4; // Start with half of WB R1 matches
  
  for (let lbRound = 1; lbRound <= lbRounds; lbRound++) {
    if (lbRound === 1) {
      // L1: Losers from R1 paired
      lbStructure.push({ round: lbRound, count: n / 4 });
    } else if (lbRound % 2 === 0) {
      // Even LB rounds: WB losers drop in, same count as previous
      lbStructure.push({ round: lbRound, count: lbStructure[lbRound - 2].count });
    } else {
      // Odd LB rounds (except L1): Halve the previous count
      lbStructure.push({ round: lbRound, count: Math.max(1, lbStructure[lbRound - 2].count / 2) });
    }
  }
  
  // Create LB matches
  for (const { round: lbRound, count } of lbStructure) {
    for (let matchNum = 1; matchNum <= count; matchNum++) {
      const matchId = `L${lbRound}M${matchNum}`;
      
      // Determine where winner goes
      let winnerto: string;
      if (lbRound === lbRounds) {
        // LB Final winner goes to GF
        winnerto = "GF";
      } else if (lbRound % 2 === 0) {
        // Even round winners go to next odd round (halving)
        winnerto = `L${lbRound + 1}M${Math.ceil(matchNum / 2)}`;
      } else {
        // Odd round winners go to next even round (same slot)
        winnerto = `L${lbRound + 1}M${matchNum}`;
      }
      
      matches.push({
        id: matchId,
        bracket: "L",
        round: lbRound,
        matchNumber: matchNum,
        opponentA: createPlaceholder(),
        opponentB: createPlaceholder(),
        scoreA: null,
        scoreB: null,
        winner: null,
        finished: false,
        winnerto,
        loserto: null,
        metadata: { lbRound },
      });
    }
  }
  
  // ==================================================================
  // WIRE LOSERS FROM WB TO LB
  // ==================================================================
  
  // WB R1 losers → L1
  // R1M1 loser → L1M1 slot A
  // R1M2 loser → L1M1 slot B
  // R1M3 loser → L1M2 slot A
  // R1M4 loser → L1M2 slot B
  const wbR1Count = n / 2;
  for (let m = 1; m <= wbR1Count; m++) {
    const wbMatch = findMatch(`R1M${m}`);
    const lbMatchNum = Math.ceil(m / 2);
    const lbMatch = findMatch(`L1M${lbMatchNum}`);
    
    if (wbMatch && lbMatch) {
      wbMatch.loserto = lbMatch.id;
      wbMatch.metadata.loserSlot = m % 2 === 1 ? "A" : "B";
    }
  }
  
  // WB R2 losers → L2
  // R2M1 loser → L2M1 slot B (slot A is L1 winner)
  // R2M2 loser → L2M2 slot B
  const wbR2Count = n / 4;
  for (let m = 1; m <= wbR2Count; m++) {
    const wbMatch = findMatch(`R2M${m}`);
    const lbMatch = findMatch(`L2M${m}`);
    
    if (wbMatch && lbMatch) {
      wbMatch.loserto = lbMatch.id;
      wbMatch.metadata.loserSlot = "B";
    }
  }
  
  // WB R3+ losers → appropriate LB round
  // R3 loser → L4 slot B (for 8 teams)
  // General: WB round R (R >= 3) loser → L(2R-2) slot B
  for (let wbRound = 3; wbRound <= wbRounds; wbRound++) {
    const matchesInWbRound = n / Math.pow(2, wbRound);
    const targetLbRound = 2 * wbRound - 2;
    
    for (let m = 1; m <= matchesInWbRound; m++) {
      const wbMatch = findMatch(`R${wbRound}M${m}`);
      const lbMatch = findMatch(`L${targetLbRound}M${m}`);
      
      if (wbMatch && lbMatch) {
        wbMatch.loserto = lbMatch.id;
        wbMatch.metadata.loserSlot = "B";
      }
    }
  }
  
  // ==================================================================
  // GRAND FINALS
  // ==================================================================
  
  matches.push({
    id: "GF",
    bracket: "F",
    round: wbRounds + 1,
    matchNumber: 1,
    opponentA: createPlaceholder(), // WB Champion
    opponentB: createPlaceholder(), // LB Champion
    scoreA: null,
    scoreB: null,
    winner: null,
    finished: false,
    winnerto: null,
    loserto: null,
    metadata: {
      grandFinal: true,
      description: "Grand Final",
    },
  });
  
  // GF2 (bracket reset)
  matches.push({
    id: "GF2",
    bracket: "F",
    round: wbRounds + 2,
    matchNumber: 2,
    opponentA: createPlaceholder(),
    opponentB: createPlaceholder(),
    scoreA: null,
    scoreB: null,
    winner: null,
    finished: false,
    winnerto: null,
    loserto: null,
    metadata: {
      grandFinal: true,
      bracketReset: true,
      conditional: true,
      description: "Grand Final Reset (if necessary)",
    },
  });
  
  return {
    bracketId: generateId(),
    format: "double_elim",
    participantsCount: teams.length,
    matches,
  };
}

// ==============================================================================
// PROPAGATION FUNCTIONS
// ==============================================================================

export function propagateWinner(
  matches: BracketMatch[],
  sourceMatchId: string,
  winner: "A" | "B"
): void {
  const sourceMatch = matches.find(m => m.id === sourceMatchId);
  if (!sourceMatch || !sourceMatch.winnerto) return;
  
  const targetMatch = matches.find(m => m.id === sourceMatch.winnerto);
  if (!targetMatch) return;
  
  const winnerParticipant = winner === "A" 
    ? sourceMatch.opponentA 
    : sourceMatch.opponentB;
  
  const propagatedWinner = {
    ...winnerParticipant,
    propagatedFrom: sourceMatchId,
  };
  
  // Place winner in first available slot
  if (targetMatch.opponentA.type === "placeholder") {
    targetMatch.opponentA = propagatedWinner;
  } else if (targetMatch.opponentB.type === "placeholder") {
    targetMatch.opponentB = propagatedWinner;
  }
}

export function propagateLoser(
  matches: BracketMatch[],
  sourceMatchId: string,
  loser: "A" | "B"
): void {
  const sourceMatch = matches.find(m => m.id === sourceMatchId);
  if (!sourceMatch || !sourceMatch.loserto) return;
  
  const targetMatch = matches.find(m => m.id === sourceMatch.loserto);
  if (!targetMatch) return;
  
  const loserParticipant = loser === "A" 
    ? sourceMatch.opponentA 
    : sourceMatch.opponentB;
  
  const propagatedLoser = {
    ...loserParticipant,
    propagatedFrom: sourceMatchId,
  };
  
  // Use preferred slot if specified
  const preferredSlot = sourceMatch.metadata.loserSlot;
  
  if (preferredSlot === "A" && targetMatch.opponentA.type === "placeholder") {
    targetMatch.opponentA = propagatedLoser;
  } else if (preferredSlot === "B" && targetMatch.opponentB.type === "placeholder") {
    targetMatch.opponentB = propagatedLoser;
  } else {
    // Fallback: first available
    if (targetMatch.opponentA.type === "placeholder") {
      targetMatch.opponentA = propagatedLoser;
    } else if (targetMatch.opponentB.type === "placeholder") {
      targetMatch.opponentB = propagatedLoser;
    }
  }
}

// ==============================================================================
// EXPORTS
// ==============================================================================

export {
  generateId,
  createTeam,
  createBye,
  createPlaceholder,
};
