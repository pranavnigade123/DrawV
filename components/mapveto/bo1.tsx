"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Map {
  value: string;
  name: string;
}

type VetoSelections = {
  [key: number]: string;
};

const MAPS: Map[] = [
  { value: "haven", name: "Haven" },
  { value: "pearl", name: "Pearl" },
  { value: "abyss", name: "Abyss" },
  { value: "fracture", name: "Fracture" },
  { value: "split", name: "Split" },
  { value: "lotus", name: "Lotus" },
  { value: "bind", name: "Bind" },
];

const getBanTeamOrder = (tossWinner: string | null, tossLoser: string | null) => {
  if (!tossWinner || !tossLoser) return [];
  return [tossWinner, tossLoser, tossWinner, tossLoser, tossWinner, tossLoser];
};

const MapVeto = () => {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossResult, setTossResult] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossLoser, setTossLoser] = useState<string | null>(null);
  const [vetoStep, setVetoStep] = useState(0);
  const [vetoSelections, setVetoSelections] = useState<VetoSelections>({});
  const [finalMap, setFinalMap] = useState<string | null>(null);
  const [teamSides, setTeamSides] = useState<string | null>(null);

  const banOrder = getBanTeamOrder(tossWinner, tossLoser);
  const bansMade = Object.values(vetoSelections).slice(0, 6).filter(Boolean).length;
  const currentBanIndex = bansMade;
  const currentBanningTeam = banOrder[currentBanIndex] || null;

  useEffect(() => {
    if (bansMade === 6 && vetoSelections[6] === undefined) {
      const bannedMaps = Object.values(vetoSelections).slice(0, 6);
      const remainingMap = MAPS.find((map) => !bannedMaps.includes(map.value));
      if (remainingMap) {
        setVetoSelections((prev) => ({ ...prev, 6: remainingMap.value }));
      }
    }
  }, [bansMade, vetoSelections]);

  const handleToss = () => {
    if (!teamA.trim() || !teamB.trim()) {
      alert("Please enter both team names to start the toss.");
      return;
    }
    const teams = [teamA.trim(), teamB.trim()];
    const winner = teams[Math.floor(Math.random() * 2)];
    const loser = teams.find((team) => team !== winner) ?? "";
    setTossWinner(winner);
    setTossLoser(loser);
    setTossResult(`${winner} wins the toss!`);
    setVetoStep(1);
  };

  const handleMapBan = (mapValue: string) => {
    if (vetoStep < 1 || vetoStep > 6) return;
    if (currentBanIndex !== vetoStep - 1) {
      alert("Not the current ban step.");
      return;
    }
    if (!banOrder[currentBanIndex]) {
      alert("Ban order not defined.");
      return;
    }
    if (Object.values(vetoSelections).includes(mapValue)) {
      alert("Map is already banned or selected.");
      return;
    }
    setVetoSelections((prev) => ({ ...prev, [currentBanIndex]: mapValue }));
    if (vetoStep === 6) {
      setVetoStep(7);
    } else {
      setVetoStep(vetoStep + 1);
    }
  };

  const handleSideSelection = (chosenSide: "Attack" | "Defense") => {
    if (!tossLoser || !tossWinner || !vetoSelections[6]) {
      alert("Decider map or toss info is missing.");
      return;
    }
    const otherSide = chosenSide === "Attack" ? "Defense" : "Attack";
    const mapName =
      MAPS.find((map) => map.value === vetoSelections[6])?.name ?? vetoSelections[6];

    setFinalMap(`Final Map: ${mapName}`);
    setTeamSides(`${tossLoser} chooses ${chosenSide}, ${tossWinner} starts ${otherSide}`);
    setVetoStep(8);
  };

  const bannedMaps = Object.values(vetoSelections).slice(0, 6);
  const deciderMap = vetoSelections[6] ?? null;

  const renderStepContent = () => {
    switch (vetoStep) {
      case 0:
        return (
          <div className="max-w-xl w-full bg-[#121212] rounded-lg p-8 border border-gray-700 shadow-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">
              Enter Team Names & Toss
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Team A"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="flex-1 p-3 rounded bg-[#0a0a0a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#383bff]"
              />
              <input
                type="text"
                placeholder="Team B"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="flex-1 p-3 rounded bg-[#0a0a0a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#383bff]"
              />
            </div>
            <button
              onClick={handleToss}
              className={`w-full px-6 py-3 bg-[#383bff] rounded font-semibold text-white hover:bg-[#5359ff] transition disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={!teamA.trim() || !teamB.trim()}
            >
              Toss
            </button>
          </div>
        );

      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return (
          <div className="max-w-4xl w-full flex flex-col items-center mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              {currentBanningTeam}&apos;s turn to ban a map ({bansMade + 1}/6)
            </h2>
            <p className="mb-6 text-gray-400 text-center">
              Click on a map below to ban it.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 w-full px-4">
              {MAPS.map((map) => {
                const isSelected = Object.values(vetoSelections).includes(map.value);
                return (
                  <button
                    key={map.value}
                    disabled={isSelected}
                    onClick={() => handleMapBan(map.value)}
                    title={map.name + (isSelected ? " (Taken)" : "")}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-[#383bff]
                      ${isSelected ? "grayscale opacity-60 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
                    `}
                    aria-disabled={isSelected}
                  >
                    <Image
                      src={`/maps/${map.value}.jpg`}
                      alt={map.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                      unoptimized
                      priority={true}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white font-bold text-center text-sm sm:text-base truncate">
                        {map.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#383bff] rounded-full w-7 h-7 flex items-center justify-center shadow-md text-white font-bold select-none">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 7:
        if (!deciderMap) {
          return (
            <p className="text-red-500 font-semibold text-center">Decider map not selected yet.</p>
          );
        }
        return (
          <div className="max-w-md w-full bg-[#121212] p-8 rounded-lg border border-[#383bff] shadow-md text-center mx-auto">
            <h2 className="text-2xl mb-4 text-white font-semibold">
              {tossLoser}, choose your starting side for decider map:
            </h2>
            <p className="mb-6 font-semibold text-gray-300">{`Decider Map: ${
              MAPS.find((m) => m.value === deciderMap)?.name ?? deciderMap
            }`}</p>
            <div className="flex justify-center gap-12">
              {["Attack", "Defense"].map((side) => (
                <button
                  key={side}
                  onClick={() => handleSideSelection(side as "Attack" | "Defense")}
                  className="bg-[#383bff] px-8 py-3 rounded-lg font-semibold text-white hover:bg-[#5363ff] shadow-md focus:outline-none focus:ring-4 focus:ring-[#7fc3ff] transition"
                >
                  {side}
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="max-w-4xl w-full bg-[#121212] rounded-lg p-8 border border-[#969696] shadow-lg mx-auto">
            <h2 className="text-3xl text-white font-bold mb-6 text-center">
              Veto Completed
            </h2>
            <div className="mb-6">
              <p className="text-lg font-semibold text-center mb-4">{finalMap}</p>
              <p className="text-lg text-center text-gray-300">{teamSides}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 border-b border-[#686868] pb-2 text-gray-400">
                Banned Maps
              </h3>
              <ul className="flex flex-wrap gap-4 justify-center">
                {bannedMaps.map((val) => {
                  const mapName = MAPS.find((m) => m.value === val)?.name || val;
                  return (
                    <li
                      key={val}
                      className="bg-red-500 rounded-lg p-2 px-4 text-white font-semibold shadow"
                      title="Banned Map"
                    >
                      {mapName}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4 border-b border-[#b8b8b8] pb-2 text-gray-400">
                Decider Map
              </h3>
              <p className="text-center text-lg font-semibold text-green-500">
                {MAPS.find((m) => m.value === deciderMap)?.name || deciderMap}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl text-white font-bold mb-10 text-center">
        Best of 1 Map Veto
      </h1>
      <div className="w-full max-w-7xl">{renderStepContent()}</div>
    </main>
  );
};

export default MapVeto;
