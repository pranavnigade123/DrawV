// lib/bracket/generateSkeleton.ts
import { randomBytes } from "crypto";

// ---------------------
// Helpers
// ---------------------
function generateId() {
  return randomBytes(6).toString("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
}
function placeholder(label: string | null = null) {
  return { type: "placeholder", label, propagatedFrom: null };
}
function team(label: string | null = null) {
  return { type: "team", label, propagatedFrom: null };
}
function isPowerOfTwo(n: number) {
  return n > 0 && (n & (n - 1)) === 0;
}
function nextPowerOfTwo(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// -----------------------------------------------------
// SINGLE ELIMINATION GENERATOR
// -----------------------------------------------------
export function generateSingleElimSkeleton(n: number, labels: string[] = []) {
  const actualN = nextPowerOfTwo(n);
  const rounds = Math.log2(actualN);
  const matches: any[] = [];

  for (let r = 1; r <= rounds; r++) {
    const matchesInRound = actualN / Math.pow(2, r);
    for (let m = 1; m <= matchesInRound; m++) {
      const id = `R${r}M${m}`;
      let oppA = placeholder();
      let oppB = placeholder();

      if (r === 1) {
        const idxA = (m - 1) * 2;
        const idxB = idxA + 1;
        oppA = team(labels[idxA] ?? null);
        oppB = team(labels[idxB] ?? null);
      }

      const winnerto = r < rounds ? `R${r + 1}M${Math.ceil(m / 2)}` : null;
      matches.push({
        id,
        bracket: "W",
        round: r,
        matchNumber: m,
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
    participantsCount: n,
    matches,
  };
}

// -----------------------------------------------------
// DOUBLE ELIMINATION GENERATOR (UBGF + LBGF pattern)
// -----------------------------------------------------
export function generateDoubleElimSkeleton(n: number, labels: string[] = []) {
  if (!isPowerOfTwo(n)) throw new Error("n must be a power of two");
  const W = Math.log2(n);
  const matches: any[] = [];

  // Winner Bracket
  for (let r = 1; r <= W; r++) {
    const matchesInR = n / Math.pow(2, r);
    for (let m = 1; m <= matchesInR; m++) {
      const id = `R${r}M${m}`;
      let oppA = placeholder();
      let oppB = placeholder();
      if (r === 1) {
        const idxA = (m - 1) * 2;
        const idxB = idxA + 1;
        oppA = team(labels[idxA] ?? null);
        oppB = team(labels[idxB] ?? null);
      }
      const winnerto = r < W ? `R${r + 1}M${Math.ceil(m / 2)}` : "UBGF";
      matches.push({
        id,
        bracket: "W",
        round: r,
        matchNumber: m,
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

  // Loser Bracket
  const r1Count = n / 2;
  const l1Count = r1Count / 2;
  for (let m = 1; m <= l1Count; m++) {
    matches.push({
      id: `L1M${m}`,
      bracket: "L",
      round: 1,
      matchNumber: m,
      opponentA: placeholder(),
      opponentB: placeholder(),
      scoreA: null,
      scoreB: null,
      winner: null,
      finished: false,
      winnerto: `L2M${m}`,
      loserto: null,
      metadata: {},
    });
  }

  for (let r = 2; r <= W; r++) {
    const count = Math.max(1, n / Math.pow(2, r));
    for (let m = 1; m <= count; m++) {
      matches.push({
        id: `L${r}M${m}`,
        bracket: "L",
        round: r,
        matchNumber: m,
        opponentA: placeholder(),
        opponentB: placeholder(),
        scoreA: null,
        scoreB: null,
        winner: null,
        finished: false,
        winnerto: r < W ? `L${r + 1}M${Math.ceil(m / 2)}` : "LBGF",
        loserto: null,
        metadata: {},
      });
    }
  }

  // Link winners’ losers into LB
  function find(id: string) {
    return matches.find((x) => x.id === id);
  }

  // R1 → L1
  for (let m = 1; m <= r1Count; m++) {
    const src = find(`R1M${m}`);
    const tgt = find(`L1M${Math.ceil(m / 2)}`);
    if (src && tgt) {
      src.loserto = tgt.id;
      src.metadata.loserExpectedSlot = m % 2 === 1 ? "A" : "B";
    }
  }

  // R2 → L2
  const r2Count = n / 4;
  for (let m = 1; m <= r2Count; m++) {
    const src = find(`R2M${m}`);
    const tgt = find(`L2M${m}`);
    if (src && tgt) {
      src.loserto = tgt.id;
      src.metadata.loserExpectedSlot = "B";
    }
  }

  // R3 → LBGF, L3 → LBGF
  const rFinal = find(`R${W}M1`);
  const lFinal = find(`L${W}M1`);
  if (rFinal) {
    rFinal.loserto = "LBGF";
    rFinal.metadata.loserExpectedSlot = "B";
  }
  if (lFinal) lFinal.winnerto = "LBGF";

  // Finals
  matches.push({
    id: "LBGF",
    bracket: "L",
    round: W + 1,
    matchNumber: 1,
    opponentA: placeholder(),
    opponentB: placeholder(),
    scoreA: null,
    scoreB: null,
    winner: null,
    finished: false,
    winnerto: "UBGF",
    loserto: null,
    metadata: {},
  });

  matches.push({
    id: "UBGF",
    bracket: "F",
    round: W + 2,
    matchNumber: 1,
    opponentA: placeholder(),
    opponentB: placeholder(),
    scoreA: null,
    scoreB: null,
    winner: null,
    finished: false,
    winnerto: null,
    loserto: null,
    metadata: { final: true },
  });

  return {
    bracketId: generateId(),
    format: "double_elim",
    participantsCount: n,
    matches,
  };
}

// -----------------------------------------------------
// WRAPPER FOR ROUTE USAGE
// -----------------------------------------------------
export function generateBracketSkeleton(
  format: "single_elim" | "double_elim",
  participants: string[]
) {
  const n = participants.length;
  if (format === "single_elim") return generateSingleElimSkeleton(n, participants);
  return generateDoubleElimSkeleton(n, participants);
}
