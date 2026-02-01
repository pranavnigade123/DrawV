/**
 * Test script to verify bracket generation matches UI expectations
 * Run with: npx tsx lib/bracket/test-generation.ts
 */

import { generateBracketSkeleton } from "./generateSkeleton";

console.log("=== Testing Bracket Generation ===\n");

// Test 1: 8-team Double Elimination
console.log("Test 1: 8-Team Double Elimination");
console.log("-".repeat(50));

const teams = [
  "Team 1",
  "Team 2", 
  "Team 3",
  "Team 4",
  "Team 5",
  "Team 6",
  "Team 7",
  "Team 8"
];

try {
  const bracket = generateBracketSkeleton("double_elim", teams);
  
  console.log(`Bracket ID: ${bracket.bracketId}`);
  console.log(`Format: ${bracket.format}`);
  console.log(`Participants: ${bracket.participantsCount}`);
  console.log(`Total Matches: ${bracket.matches.length}\n`);
  
  // Group by bracket type
  const wbMatches = bracket.matches.filter(m => m.bracket === "W");
  const lbMatches = bracket.matches.filter(m => m.bracket === "L");
  const finalsMatches = bracket.matches.filter(m => m.bracket === "F");
  
  console.log(`Winners Bracket: ${wbMatches.length} matches`);
  console.log(`Losers Bracket: ${lbMatches.length} matches`);
  console.log(`Finals: ${finalsMatches.length} matches\n`);
  
  // Show first round of winners bracket
  console.log("Winners Bracket - Round 1:");
  const wb_r1 = wbMatches.filter(m => m.round === 1);
  wb_r1.forEach(m => {
    console.log(`  ${m.id}: ${m.opponentA.label} vs ${m.opponentB.label}`);
    console.log(`    winnerto: ${m.winnerto}, loserto: ${m.loserto}`);
  });
  
  // Show ALL losers bracket matches
  console.log("\nLosers Bracket (all rounds):");
  const lbRounds = [...new Set(lbMatches.map(m => m.round))].sort((a, b) => a - b);
  lbRounds.forEach(round => {
    console.log(`  Round ${round}:`);
    const roundMatches = lbMatches.filter(m => m.round === round);
    roundMatches.forEach(m => {
      console.log(`    ${m.id}: ${m.opponentA.label || m.opponentA.type} vs ${m.opponentB.label || m.opponentB.type}`);
      console.log(`      winnerto: ${m.winnerto}`);
    });
  });
  
  // Show finals
  console.log("\nFinals:");
  finalsMatches.forEach(m => {
    console.log(`  ${m.id}: ${m.opponentA.label || m.opponentA.type} vs ${m.opponentB.label || m.opponentB.type}`);
    console.log(`    winnerto: ${m.winnerto}`);
  });
  
  // Show all WB matches with loserto connections
  console.log("\nWinners Bracket - Loserto Connections:");
  const wbRounds = [...new Set(wbMatches.map(m => m.round))].sort((a, b) => a - b);
  wbRounds.forEach(round => {
    console.log(`  Round ${round}:`);
    const roundMatches = wbMatches.filter(m => m.round === round);
    roundMatches.forEach(m => {
      console.log(`    ${m.id} loserto: ${m.loserto} (slot: ${m.metadata?.loserSlot || "N/A"})`);
    });
  });
  
  // Check for issues
  console.log("\n=== Validation ===");
  
  // Check match IDs format
  const hasWBPrefix = bracket.matches.some(m => m.id.startsWith("WB-"));
  const hasLBPrefix = bracket.matches.some(m => m.id.startsWith("LB-"));
  
  if (hasWBPrefix || hasLBPrefix) {
    console.log("⚠️  WARNING: Match IDs have WB-/LB- prefix (UI might not expect this)");
  } else {
    console.log("✅ Match IDs format looks correct (no WB-/LB- prefix)");
  }
  
  // Check for required matches
  const hasGF = bracket.matches.some(m => m.id === "GF");
  const hasGF2 = bracket.matches.some(m => m.id === "GF2");
  
  if (hasGF && hasGF2) {
    console.log("✅ Grand Finals (GF + GF2) present");
  } else {
    console.log(`⚠️  WARNING: Missing finals - GF: ${hasGF}, GF2: ${hasGF2}`);
  }
  
  // Check loserto connections
  const wb_with_loserto = wbMatches.filter(m => m.loserto);
  console.log(`✅ ${wb_with_loserto.length} WB matches have loserto connections`);
  
  // Output sample JSON for inspection
  console.log("\n=== Sample Match JSON ===");
  console.log(JSON.stringify(bracket.matches[0], null, 2));
  
} catch (error) {
  console.error("❌ ERROR:", error);
  if (error instanceof Error) {
    console.error(error.stack);
  }
}

console.log("\n=== Test Complete ===");
