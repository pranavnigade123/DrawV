"use client";

import React, { useState, useEffect } from "react";

interface Map {
  value: string;
  name: string;
}

interface PickedMap {
  mapValue: string;
  mapName: string;
  pickedBy: string;
  sideChoiceBy: string;
  startingSide: string | null;
  teamOnSide: string | null;
  otherTeamOnSide: string | null;
}

// --- CONSTANTS ---
const MAPS: Map[] = [
  { value: "haven", name: "Haven" },
  { value: "pearl", name: "Pearl" },
  { value: "abyss", name: "Abyss" },
  { value: "fracture", name: "Fracture" },
  { value: "split", name: "Split" },
  { value: "lotus", name: "Lotus" },
  { value: "bind", name: "Bind" },
];

const MapVetoBo3 = () => {
  // --- STATE MANAGEMENT ---
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossLoser, setTossLoser] = useState<string | null>(null);

  const [vetoStep, setVetoStep] = useState(0); // Tracks the current step of the veto
  const [bannedMaps, setBannedMaps] = useState<string[]>([]);
  const [pickedMaps, setPickedMaps] = useState<PickedMap[]>([]);
  const [deciderMap, setDeciderMap] = useState<Map | null>(null);
  const [deciderMapSides, setDeciderMapSides] = useState<string | null>(null);

  // --- DERIVED STATE ---
  const availableMaps = MAPS.filter(
    (map) =>
      !bannedMaps.includes(map.value) &&
      !pickedMaps.some((p) => p.mapValue === map.value)
  );

  // --- HANDLER FUNCTIONS ---
  const handleToss = () => {
    if (!teamA.trim() || !teamB.trim()) {
      alert("Please enter both team names.");
      return;
    }
    const teams = [teamA.trim(), teamB.trim()];
    const winner = teams[Math.floor(Math.random() * 2)];
    setTossWinner(winner);
    setTossLoser(teams.find((t) => t !== winner) ?? null);
    setVetoStep(1); // Start Veto: Step 1 is Winner Ban
  };

  const handleBan = (mapValue: string) => {
    setBannedMaps((prev) => [...prev, mapValue]);
    setVetoStep((prev) => prev + 1);
  };

  const handlePick = (mapValue: string) => {
    const picker = vetoStep === 3 ? tossWinner : tossLoser;
    const sideChooser = vetoStep === 3 ? tossLoser : tossWinner;
    const map = MAPS.find((m) => m.value === mapValue);
    if (map && picker && sideChooser) {
      setPickedMaps((prev) => [
        ...prev,
        {
          mapValue: map.value,
          mapName: map.name,
          pickedBy: picker,
          sideChoiceBy: sideChooser,
          startingSide: null,
          teamOnSide: null,
          otherTeamOnSide: null,
        },
      ]);
    }
    setVetoStep((prev) => prev + 1);
  };

  const handleSideSelection = (mapIndex: number, side: string) => {
    const updatedPicks = [...pickedMaps];
    const pick = updatedPicks[mapIndex];
    if (!pick) return;
    const otherSide = side === "Attack" ? "Defense" : "Attack";

    pick.startingSide = side;
    pick.teamOnSide = pick.sideChoiceBy;
    pick.otherTeamOnSide = pick.pickedBy;

    setPickedMaps(updatedPicks);
    setVetoStep((prev) => prev + 1);
  };

  const handleDeciderSideSelection = (side: string) => {
    const otherSide = side === "Attack" ? "Defense" : "Attack";
    if (tossLoser && tossWinner) {
      setDeciderMapSides(
        `${tossLoser} chooses ${side}, ${tossWinner} starts ${otherSide}`
      );
    }
    setVetoStep((prev) => prev + 1); // Finish the veto
  };

  // Effect to determine the decider map automatically after the 4th ban
  useEffect(() => {
    if (bannedMaps.length === 4 && !deciderMap) {
      setDeciderMap(availableMaps[0] ?? null);
      setVetoStep(9); // Move to decider side selection
    }
  }, [bannedMaps, availableMaps, deciderMap]);

  // --- UI RENDER FUNCTIONS ---
  const VetoStepUI = () => {
    // Prompts for each step
    const prompts: { [key: number]: string } = {
      1: `Toss Winner (${tossWinner}) to BAN`,
      2: `Toss Loser (${tossLoser}) to BAN`,
      3: `Toss Winner (${tossWinner}) to PICK`,
      4: `Toss Loser (${tossLoser}) to choose side for ${pickedMaps[0]?.mapName}`,
      5: `Toss Loser (${tossLoser}) to PICK`,
      6: `Toss Winner (${tossWinner}) to choose side for ${pickedMaps[1]?.mapName}`,
      7: `Toss Winner (${tossWinner}) to BAN`,
      8: `Toss Loser (${tossLoser}) to BAN`,
      9: `Decider map is ${deciderMap?.name}. Toss Loser (${tossLoser}) to choose side.`,
      10: "Veto Complete!",
    };

    const currentPrompt = prompts[vetoStep];
    if (!currentPrompt) return null;

    // Map selection steps
    const isMapStep = [1, 2, 3, 5, 7, 8].includes(vetoStep);
    if (isMapStep) {
      const onSelect = [1, 2, 7, 8].includes(vetoStep) ? handleBan : handlePick;
      return (
        <section className="my-8 max-w-5xl mx-auto p-6 bg-[#121212] border border-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">{currentPrompt}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
            {availableMaps.map((map) => (
              <div
                key={map.value}
                tabIndex={0}
                role="button"
                onClick={() => onSelect(map.value)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(map.value)}
                className="cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-white focus:outline-none focus:border-white transition-transform duration-200 hover:scale-105"
              >
                <div
                  className="aspect-[4/3] bg-center bg-cover rounded-t-lg"
                  style={{ backgroundImage: `url('/images/${map.value}.jpg')` }}
                  aria-label={map.name}
                />
                <p className="mt-2 text-center font-semibold text-white select-none">
                  {map.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // Side selection steps
    const isSideStep = [4, 6, 9].includes(vetoStep);
    if (isSideStep) {
      const mapIndex = vetoStep === 4 ? 0 : vetoStep === 6 ? 1 : 2;
      const onSelect =
        vetoStep === 9
          ? handleDeciderSideSelection
          : (side: string) => handleSideSelection(mapIndex, side);
      return (
        <section className="my-8 max-w-md mx-auto p-6 bg-[#121212] border border-gray-600 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-6">{currentPrompt}</h2>
          <div className="flex justify-center gap-8">
            {["Attack", "Defense"].map((side) => (
              <button
                key={side}
                onClick={() => onSelect(side)}
                className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
              >
                {side}
              </button>
            ))}
          </div>
        </section>
      );
    }

    // Veto complete step
    if (vetoStep >= 10) {
      return (
        <>
          <h2 className="text-3xl font-bold text-green-500 my-12 text-center">
            Veto Complete!
          </h2>
          <section className="max-w-4xl mx-auto p-6 bg-[#121212] border border-[#383bff] rounded-lg text-left text-gray-300">
            <h2 className="text-2xl font-semibold text-white mb-4 select-none">
              Veto Summary
            </h2>

            {bannedMaps.length > 0 && (
              <p className="mb-3">
                <strong className="text-red-500">Banned Maps:</strong> {bannedMaps.join(", ")}
              </p>
            )}

            {pickedMaps.map((pick, i) => (
              <div key={i} className="mb-3">
                <p>
                  <strong className="text-white">
                    Map {i + 1}: {pick.mapName}
                  </strong>{" "}
                  (Picked by {pick.pickedBy})
                </p>
                {pick.startingSide && (
                  <p className="pl-4 text-gray-400">
                    - {pick.teamOnSide} starts{" "}
                    <span className="font-semibold">{pick.startingSide}</span>,{" "}
                    {pick.otherTeamOnSide} starts{" "}
                    <span className="font-semibold">
                      {pick.startingSide === "Attack" ? "Defense" : "Attack"}
                    </span>
                  </p>
                )}
              </div>
            ))}

            {deciderMap && (
              <div>
                <p className="text-green-400 font-semibold select-none">
                  Decider Map: {deciderMap.name}
                </p>
                {deciderMapSides && (
                  <p className="pl-4 text-gray-400 select-text">- {deciderMapSides}</p>
                )}
              </div>
            )}
          </section>
        </>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-12 select-none">Best of 3 Map Veto</h1>

      {vetoStep === 0 ? (
        // Toss UI exactly like BO1 for consistency
        <>
          <div className="flex justify-center gap-10 mb-8 flex-wrap">
            <div className="bg-[#121212] border border-gray-500 p-5 rounded-lg w-full max-w-[300px]">
              <label htmlFor="teamA" className="text-gray-400 text-lg">
                Team A:
              </label>
              <input
                type="text"
                id="teamA"
                className="mt-2 w-full p-2 rounded bg-[#0a0a0a] text-white"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="Enter Team A Name"
                autoComplete="off"
              />
            </div>
            <div className="bg-[#121212] border border-gray-500 p-5 rounded-lg w-full max-w-[300px]">
              <label htmlFor="teamB" className="text-gray-400 text-lg">
                Team B:
              </label>
              <input
                type="text"
                id="teamB"
                className="mt-2 w-full p-2 rounded bg-[#0a0a0a] text-white"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="Enter Team B Name"
                autoComplete="off"
              />
            </div>
          </div>
          <button
            onClick={handleToss}
            className="bg-[#383bff] text-white font-semibold px-8 py-4 rounded-lg"
            disabled={!teamA.trim() || !teamB.trim()}
          >
            Toss
          </button>
        </>
      ) : (
        <VetoStepUI />
      )}
    </main>
  );
};

export default MapVetoBo3;
