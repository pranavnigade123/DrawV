"use client";

import React, { useState, useEffect } from "react";

interface Map {
  value: string;
  name: string;
}

type VetoSelections = {
  [key: number]: string;
};

const MAPS: Map[] = [
  { value: "corrode", name: "Corrode" },
  { value: "split", name: "Split" },
  { value: "abyss", name: "Abyss" },
  { value: "pearl", name: "Pearl" },
  { value: "bind", name: "Bind" },
  { value: "haven", name: "Haven" },
  { value: "breeze", name: "Breeze" },
];

// Helper function to get the correct image extension
const getMapImagePath = (mapValue: string) => {
  return mapValue === "breeze" ? `/maps/${mapValue}.png` : `/maps/${mapValue}.jpg`;
};

const getBanTeamOrder = (tossWinner: string | null, tossLoser: string | null) => {
  if (!tossWinner || !tossLoser) return [];
  return [tossWinner, tossLoser, tossWinner, tossLoser, tossWinner, tossLoser];
};

const MapVeto = () => {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossLoser, setTossLoser] = useState<string | null>(null);
  const [vetoStep, setVetoStep] = useState(0);
  const [vetoSelections, setVetoSelections] = useState<VetoSelections>({});
  const [finalMapInfo, setFinalMapInfo] = useState<{name: string, value: string} | null>(null);
  const [teamSides, setTeamSides] = useState<string | null>(null);

  const banOrder = getBanTeamOrder(tossWinner, tossLoser);
  const bansMade = Object.values(vetoSelections).filter(Boolean).length;
  const currentBanIndex = bansMade;
  const currentBanningTeam = banOrder[currentBanIndex] || null;

  useEffect(() => {
    // When 6 bans are made, automatically determine the decider map
    if (bansMade === 6) {
      const bannedMapValues = Object.values(vetoSelections);
      const remainingMap = MAPS.find((map) => !bannedMapValues.includes(map.value));
      if (remainingMap && !finalMapInfo) { // Ensure we only set it once
        setFinalMapInfo({ name: remainingMap.name, value: remainingMap.value });
        setVetoStep(7); // Move to side selection
      }
    }
  }, [bansMade, vetoSelections, finalMapInfo]);

  const handleToss = () => {
    if (!teamA.trim() || !teamB.trim()) {
      alert("Please enter both team names to start the toss.");
      return;
    }
    const teams = [teamA.trim(), teamB.trim()];
    // Use Date.now() as additional entropy for better randomization
    const randomIndex = Math.floor((Math.random() + Date.now() % 2) * teams.length) % teams.length;
    const winner = teams[randomIndex];
    const loser = teams.find((team) => team !== winner) ?? "";
    setTossWinner(winner);
    setTossLoser(loser);
    setVetoStep(0.5); // Show toss result first
  };

  const handleStartVeto = () => {
    setVetoStep(1); // Start the veto process
  };

  const handleMapBan = (mapValue: string) => {
    if (vetoStep > 6) return;
    setVetoSelections((prev) => ({ ...prev, [currentBanIndex]: mapValue }));
    // Don't increment vetoStep here, let the useEffect handle it
  };

  const handleSideSelection = (chosenSide: "Attack" | "Defense") => {
    if (!tossLoser || !tossWinner || !finalMapInfo) {
      alert("Decider map or toss info is missing.");
      return;
    }
    const otherSide = chosenSide === "Attack" ? "Defense" : "Attack";
    setTeamSides(`${tossWinner} chooses ${chosenSide}, ${tossLoser} starts ${otherSide}`);
    setVetoStep(8); // Move to final summary
  };

  const bannedMaps = Object.values(vetoSelections);

  const renderStepContent = () => {
    switch (vetoStep) {
      case 0:
        return (
          <div className="max-w-xl w-full mx-auto">
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
              className="w-full px-6 py-3 bg-[#383bff] rounded font-semibold text-white hover:bg-[#5359ff] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!teamA.trim() || !teamB.trim()}
            >
              Toss
            </button>
          </div>
        );

      case 0.5:
        return (
          <div className="max-w-xl w-full mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">
              Toss Result
            </h2>
            <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-500 rounded-xl p-8 mb-8">
              <p className="text-xl text-gray-300 mb-4">Toss Winner</p>
              <p className="text-4xl font-bold text-green-400 mb-2">{tossWinner}</p>
              <p className="text-sm text-gray-400 mt-4">
                {tossWinner} will ban the first map
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 mb-8">
              <p className="text-lg text-gray-400">
                <span className="font-semibold text-white">{tossLoser}</span> will ban second
              </p>
            </div>
            <button
              onClick={handleStartVeto}
              className="w-full px-6 py-3 bg-[#383bff] rounded font-semibold text-white hover:bg-[#5359ff] transition"
            >
              Start Veto Process
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
          <div className="w-full flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6 text-center">
                {currentBanningTeam}'s turn to <span className="text-red-500">BAN</span> a map ({bansMade + 1}/6)
            </h2>
            <div className="flex flex-col items-center gap-6 w-full p-4 lg:flex-row lg:justify-center lg:overflow-x-auto">
              {MAPS.map((map) => {
                const isSelected = bannedMaps.includes(map.value);
                return (
                  <button
                    key={map.value}
                    disabled={isSelected}
                    onClick={() => handleMapBan(map.value)}
                    title={map.name + (isSelected ? " (Banned)" : "")}
                    className={`relative w-36 flex-shrink-0 aspect-[3/4] rounded-lg overflow-hidden shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-[#383bff]
                      ${isSelected ? "cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
                    `}
                  >
                    <img
                      src={getMapImagePath(map.value)}
                      alt={map.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src='https://placehold.co/300x400/121212/FFFFFF?text=Map+Image';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white font-bold text-center text-sm sm:text-base truncate">
                        {map.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <div className="absolute inset-0 border-2 border-gray-500/50"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="max-w-md w-full text-center mx-auto">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6">
              {tossWinner}, choose your starting side for <span className="font-bold">{finalMapInfo?.name}</span>
            </h2>
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
          <div className="max-w-5xl w-full mx-auto text-left">
            <h2 className="text-3xl text-white font-bold mb-8 text-center">
              Veto Completed
            </h2>
            <div className="flex justify-center mb-8">
                {finalMapInfo && (
                     <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden flex flex-col w-full max-w-xs hover:border-blue-500/50 transition-all duration-300">
                        <div className="relative w-full aspect-[4/3]">
                             <img
                                src={`/maps/${finalMapInfo.value}.jpg`}
                                alt={finalMapInfo.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; 
                                    target.src='https://placehold.co/400x300/121212/FFFFFF?text=Map+Image';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-xs text-blue-400 font-semibold tracking-wider mb-1">DECIDER MAP</p>
                                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{finalMapInfo.name}</h3>
                            </div>
                        </div>
                        {teamSides && (
                            <div className="p-4 bg-zinc-800/50">
                                <p className="text-gray-300 text-sm text-center">{teamSides}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
              <h3 className="text-center text-base font-semibold text-gray-400 mb-2">Banned Maps</h3>
              <p className="text-center text-gray-500 text-sm">{MAPS.filter(m => bannedMaps.includes(m.value)).map(m => m.name).join(" • ")}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-black p-4 sm:p-6 pt-24 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 text-center select-none">
        Best of 1 Map Veto
      </h1>
      <div className="w-full max-w-7xl rounded-xl border border-gray-700 bg-[#121212]/50 p-6 sm:p-8 min-h-[400px] flex items-center justify-center">
        {renderStepContent()}
      </div>
    </main>
  );
};

export default MapVeto;
