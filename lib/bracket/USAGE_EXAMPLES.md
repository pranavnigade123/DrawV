# Bracket Generator - Usage Examples

## Quick Start

### 1. Generate Single Elimination Bracket

```typescript
import { generateBracket } from "@/lib/bracket/engine";

const teams = [
  "Team Alpha",
  "Team Beta", 
  "Team Gamma",
  "Team Delta",
  "Team Epsilon",
  "Team Zeta"
];

const bracket = generateBracket({
  format: "single_elim",
  participants: teams,
  shuffle: false,
  seeding: "standard"
});

console.log(`Bracket ID: ${bracket.bracketId}`);
console.log(`Total Matches: ${bracket.matches.length}`);
console.log(`Total Rounds: ${bracket.metadata.totalRounds}`);
```

**Output**:
```
Bracket ID: a1b2c3d4e5
Total Matches: 7
Total Rounds: 3
```

---

### 2. Generate with Shuffle & Snake Seeding

```typescript
const bracket = generateBracket({
  format: "single_elim",
  participants: teams,
  shuffle: true,        // Fisher-Yares shuffle
  seeding: "snake"      // 1v16, 8v9, 4v13...
});

// Teams are now randomly shuffled and snake-seeded
```

---

### 3. Generate Double Elimination

```typescript
const bracket = generateBracket({
  format: "double_elim",
  participants: teams,
  shuffle: false,
  seeding: "standard"
});

console.log(`Format: ${bracket.format}`);
console.log(`Winners Bracket: ${bracket.matches.filter(m => m.bracket === "W").length} matches`);
console.log(`Losers Bracket: ${bracket.matches.filter(m => m.bracket === "L").length} matches`);
console.log(`Finals: ${bracket.matches.filter(m => m.bracket === "F").length} matches`);
```

**Output**:
```
Format: double_elim
Winners Bracket: 7 matches
Losers Bracket: 6 matches
Finals: 2 matches (GF + GF2)
```

---

## Match Management

### 4. Update Match Result

```typescript
import { updateMatchResult } from "@/lib/bracket/engine";

// Team A beats Team B 5-3 in R1M1
const result = updateMatchResult(
  bracket.matches,
  "R1M1",        // Match ID
  5,             // Score A
  3              // Score B
);

if (result.success) {
  console.log(`Updated matches: ${result.updatedMatches.join(", ")}`);
  // Output: "R1M1, R2M1" (winner propagated to next round)
} else {
  console.error(`Errors: ${result.errors}`);
}
```

---

### 5. Handle BYE Matches

```typescript
// BYEs are automatically handled
const teams = ["Team A", "Team B", "Team C"];  // 3 teams

const bracket = generateBracket({
  format: "single_elim",
  participants: teams,
  shuffle: false,
  seeding: "standard"
});

// Bracket auto-sized to 4 (next power of 2)
// "BYE" inserted as 4th participant
// BYE matches automatically won by opponent

const byeMatches = bracket.matches.filter(m => 
  m.opponentA.type === "bye" || m.opponentB.type === "bye"
);

console.log(`BYE matches: ${byeMatches.length}`);
```

---

## Validation & Statistics

### 6. Validate Bracket Structure

```typescript
import { validateBracket } from "@/lib/bracket/engine";

const validation = validateBracket(bracket);

if (!validation.valid) {
  console.error("Bracket has errors:");
  validation.errors.forEach(err => console.error(`  - ${err}`));
}

if (validation.warnings.length > 0) {
  console.warn("Bracket has warnings:");
  validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
}
```

**Example Error**:
```
Bracket has errors:
  - Cycle detected involving match R2M1
  - Match R3M1 references non-existent winnerto: R4M1
```

---

### 7. Get Bracket Statistics

```typescript
import { getBracketStatistics } from "@/lib/bracket/engine";

const stats = getBracketStatistics(bracket);

console.log(`Progress: ${stats.completionPercentage}%`);
console.log(`Finished: ${stats.finishedMatches}/${stats.totalMatches}`);
console.log(`Current Round: ${stats.currentRound}/${stats.totalRounds}`);
console.log(`Remaining Teams: ${stats.remainingCount}/${stats.participantsCount}`);
```

**Output**:
```
Progress: 43%
Finished: 3/7
Current Round: 2/3
Remaining Teams: 4/8
```

---

## Advanced Usage

### 8. Custom Team Objects

```typescript
interface Team {
  id: string;
  name: string;
  seed: number;
}

const teams: Team[] = [
  { id: "t1", name: "Warriors", seed: 1 },
  { id: "t2", name: "Lakers", seed: 2 },
  { id: "t3", name: "Celtics", seed: 3 },
  { id: "t4", name: "Heat", seed: 4 }
];

// Extract names for bracket generation
const teamNames = teams.map(t => t.name);

const bracket = generateBracket({
  format: "single_elim",
  participants: teamNames,
  shuffle: false,
  seeding: "standard"
});

// Map back to team objects after generation
const matchesWithTeams = bracket.matches.map(match => ({
  ...match,
  teamA: teams.find(t => t.name === match.opponentA.label),
  teamB: teams.find(t => t.name === match.opponentB.label)
}));
```

---

### 9. Simulate Tournament

```typescript
// Simulate entire tournament with random results
function simulateTournament(bracket: BracketTree) {
  const matches = [...bracket.matches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.matchNumber - b.matchNumber;
  });

  for (const match of matches) {
    // Skip if already finished or has placeholders
    if (match.finished) continue;
    if (match.opponentA.type === "placeholder") continue;
    if (match.opponentB.type === "placeholder") continue;

    // Generate random scores (0-10)
    const scoreA = Math.floor(Math.random() * 11);
    const scoreB = Math.floor(Math.random() * 11);
    
    // Ensure no ties
    if (scoreA === scoreB) {
      scoreB += 1;
    }

    // Apply result
    updateMatchResult(
      bracket.matches,
      match.id,
      scoreA,
      scoreB
    );

    console.log(`${match.id}: ${match.opponentA.label} ${scoreA}-${scoreB} ${match.opponentB.label}`);
  }

  // Find champion
  const finalMatch = bracket.matches.find(m => !m.winnerto);
  const champion = finalMatch?.winner === "A" 
    ? finalMatch.opponentA.label 
    : finalMatch?.opponentB.label;

  console.log(`\n🏆 Champion: ${champion}`);
}

simulateTournament(bracket);
```

**Output**:
```
R1M1: Team Alpha 7-3 Team Beta
R1M2: Team Gamma 5-8 Team Delta
R1M3: Team Epsilon 6-2 Team Zeta
R1M4: Team Theta 4-9 Team Sigma
R2M1: Team Alpha 8-5 Team Delta
R2M2: Team Epsilon 3-7 Team Sigma
R3M1: Team Alpha 6-4 Team Sigma

🏆 Champion: Team Alpha
```

---

### 10. Grand Final Bracket Reset (Double Elimination)

```typescript
import { applyMatchResult } from "@/lib/bracket/propagate";

// Generate double elimination bracket
const bracket = generateBracket({
  format: "double_elim",
  participants: ["Team A", "Team B", "Team C", "Team D"],
  shuffle: false,
  seeding: "standard"
});

// Simulate tournament until Grand Final...
// Let's say:
// - Team A wins Winners Bracket (never lost)
// - Team B wins Losers Bracket (lost once)

// Grand Final: Team B (LB) beats Team A (WB)
await applyMatchResult(
  bracket.bracketId,
  "GF",
  3,  // Team A score
  5   // Team B score
);

// Check if GF2 was created
const gf2 = bracket.matches.find(m => m.id === "GF2");

if (gf2 && !gf2.metadata.reserved) {
  console.log("🔄 Bracket Reset! GF2 activated.");
  console.log(`Participants: ${gf2.opponentA.label} vs ${gf2.opponentB.label}`);
  
  // Play GF2 to determine true champion
  await applyMatchResult(
    bracket.bracketId,
    "GF2",
    4,  // Team A score
    2   // Team B score
  );
  
  console.log("🏆 Champion: Team A (won GF2)");
} else {
  console.log("🏆 Champion: Team A (won GF)");
}
```

---

### 11. Export Bracket to JSON

```typescript
function exportBracket(bracket: BracketTree): string {
  return JSON.stringify({
    id: bracket.bracketId,
    format: bracket.format,
    participants: bracket.participantsCount,
    matches: bracket.matches.map(m => ({
      id: m.id,
      round: m.round,
      bracket: m.bracket,
      teamA: m.opponentA.label,
      teamB: m.opponentB.label,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      winner: m.winner,
      winnerto: m.winnerto,
      loserto: m.loserto
    })),
    metadata: bracket.metadata
  }, null, 2);
}

const json = exportBracket(bracket);
console.log(json);

// Save to file
import fs from "fs";
fs.writeFileSync("bracket.json", json);
```

---

### 12. Import Bracket from JSON

```typescript
function importBracket(json: string): BracketTree {
  const data = JSON.parse(json);
  
  return {
    bracketId: data.id,
    format: data.format,
    participantsCount: data.participants,
    matches: data.matches.map((m: any) => ({
      id: m.id,
      bracket: m.bracket,
      round: m.round,
      matchNumber: parseInt(m.id.match(/M(\d+)/)?.[1] || "0"),
      opponentA: { type: "team", label: m.teamA, propagatedFrom: null },
      opponentB: { type: "team", label: m.teamB, propagatedFrom: null },
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      winner: m.winner,
      finished: m.winner !== null,
      winnerto: m.winnerto,
      loserto: m.loserto,
      metadata: {}
    }))
  };
}

const json = fs.readFileSync("bracket.json", "utf-8");
const importedBracket = importBracket(json);
```

---

### 13. Real-World Integration (API Route)

```typescript
// app/api/brackets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateBracket } from "@/lib/bracket/engine";
import Bracket from "@/lib/models/Brackets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournamentId, format, participants, shuffle, seeding } = body;

    // Validate input
    if (!format || !["single_elim", "double_elim"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format" },
        { status: 400 }
      );
    }

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { error: "At least 2 participants required" },
        { status: 400 }
      );
    }

    // Generate bracket using new engine
    const bracket = generateBracket({
      format,
      participants,
      shuffle: shuffle || false,
      seeding: seeding || "standard"
    });

    // Save to database
    const bracketDoc = await Bracket.create({
      bracketId: bracket.bracketId,
      tournamentId: tournamentId || null,
      format: bracket.format,
      participantsCount: bracket.participantsCount,
      matches: bracket.matches,
      metadata: bracket.metadata
    });

    return NextResponse.json({
      success: true,
      bracket: bracketDoc
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
```

---

### 14. React Component Integration

```typescript
// components/BracketGenerator.tsx
"use client";

import { useState } from "react";
import { generateBracket, type BracketTree } from "@/lib/bracket/engine";

export function BracketGenerator() {
  const [teams, setTeams] = useState<string[]>([]);
  const [format, setFormat] = useState<"single_elim" | "double_elim">("single_elim");
  const [bracket, setBracket] = useState<BracketTree | null>(null);

  const handleGenerate = () => {
    const generatedBracket = generateBracket({
      format,
      participants: teams,
      shuffle: true,
      seeding: "snake"
    });

    setBracket(generatedBracket);
  };

  return (
    <div>
      <h2>Bracket Generator</h2>
      
      <select value={format} onChange={e => setFormat(e.target.value as any)}>
        <option value="single_elim">Single Elimination</option>
        <option value="double_elim">Double Elimination</option>
      </select>

      <button onClick={handleGenerate}>Generate Bracket</button>

      {bracket && (
        <div>
          <h3>Bracket Generated!</h3>
          <p>ID: {bracket.bracketId}</p>
          <p>Matches: {bracket.matches.length}</p>
          <p>Rounds: {bracket.metadata.totalRounds}</p>
          <p>Algorithm: {bracket.metadata.algorithm}</p>
        </div>
      )}
    </div>
  );
}
```

---

### 15. Testing Example

```typescript
// __tests__/bracket.test.ts
import { generateBracket, validateBracket } from "@/lib/bracket/engine";

describe("Bracket Generator", () => {
  test("generates correct number of matches for single elimination", () => {
    const bracket = generateBracket({
      format: "single_elim",
      participants: ["A", "B", "C", "D", "E", "F", "G", "H"],
      shuffle: false,
      seeding: "standard"
    });

    // n teams = n-1 matches
    expect(bracket.matches.length).toBe(7);
  });

  test("double elimination has correct structure", () => {
    const bracket = generateBracket({
      format: "double_elim",
      participants: ["A", "B", "C", "D"],
      shuffle: false,
      seeding: "standard"
    });

    const wbMatches = bracket.matches.filter(m => m.bracket === "W");
    const lbMatches = bracket.matches.filter(m => m.bracket === "L");
    const finals = bracket.matches.filter(m => m.bracket === "F");

    expect(wbMatches.length).toBeGreaterThan(0);
    expect(lbMatches.length).toBeGreaterThan(0);
    expect(finals.length).toBe(2); // GF + GF2
  });

  test("bracket validation catches cycles", () => {
    const bracket = generateBracket({
      format: "single_elim",
      participants: ["A", "B", "C", "D"],
      shuffle: false,
      seeding: "standard"
    });

    // Introduce cycle
    bracket.matches[0].winnerto = bracket.matches[0].id;

    const validation = validateBracket(bracket);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      expect.stringContaining("Cycle detected")
    );
  });
});
```

---

## Common Patterns

### Pattern 1: Tournament with Seeding
```typescript
const seededTeams = [
  "Team 1 (Rank 1)",
  "Team 2 (Rank 2)",
  // ... already ranked
];

const bracket = generateBracket({
  format: "single_elim",
  participants: seededTeams,
  shuffle: false,
  seeding: "snake"  // 1v16, 8v9...
});
```

### Pattern 2: Random Draw
```typescript
const teams = loadTeamsFromDatabase();

const bracket = generateBracket({
  format: "single_elim",
  participants: teams,
  shuffle: true,      // Fisher-Yates randomize
  seeding: "standard" // Then pair sequentially
});
```

### Pattern 3: Progressive Tournament
```typescript
// Update matches as they complete
async function progressTournament(bracketId: string, matchId: string, scoreA: number, scoreB: number) {
  await applyMatchResult(bracketId, matchId, scoreA, scoreB);
  
  const bracket = await Bracket.findOne({ bracketId });
  const stats = getBracketStatistics(bracket);
  
  if (stats.completionPercentage === 100) {
    const champion = findChampion(bracket);
    await notifyChampion(champion);
  }
}
```

---

## Best Practices

1. **Always validate input**
   ```typescript
   if (participants.length < 2) throw new Error("Need at least 2 participants");
   ```

2. **Handle BYEs gracefully**
   ```typescript
   // BYEs are auto-inserted and auto-advanced
   // No manual handling needed
   ```

3. **Use transactions for match updates**
   ```typescript
   // propagate.ts already handles this
   await applyMatchResult(bracketId, matchId, scoreA, scoreB);
   ```

4. **Validate after generation**
   ```typescript
   const bracket = generateBracket({...});
   const validation = validateBracket(bracket);
   if (!validation.valid) handleErrors(validation.errors);
   ```

5. **Check statistics for progress**
   ```typescript
   const stats = getBracketStatistics(bracket);
   console.log(`${stats.completionPercentage}% complete`);
   ```

---

**Last Updated**: February 2, 2026  
**Version**: 2.0.0  
**Status**: Production Ready
