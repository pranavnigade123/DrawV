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
  { value: "haven", name: "Haven" },
  { value: "ascent", name: "Ascent" },
  { value: "abyss", name: "Abyss" },
  { value: "sunset", name: "Sunset" },
  { value: "corrode", name: "Corrode" },
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
    const winner = teams[Math.floor(Math.random() * 2)];
    const loser = teams.find((team) => team !== winner) ?? "";
    setTossWinner(winner);
    setTossLoser(loser);
    setVetoStep(1);
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
    setTeamSides(`${tossLoser} chooses ${chosenSide}, ${tossWinner} starts ${otherSide}`);
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
                      src={`/maps/${map.value}.jpg`}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent"></div>
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
              {tossLoser}, choose your starting side for <span className="font-bold">{finalMapInfo?.name}</span>
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
                     <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col w-full max-w-xs">
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
                        </div>
                        <div className="p-2 md:p-3 text-center flex-grow flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs text-blue-400">DECIDER MAP</p>
                                <h3 className="text-base sm:text-lg font-bold text-white my-1">{finalMapInfo.name}</h3>
                            </div>
                            {teamSides && (
                                <p className="text-gray-300 text-xs sm:text-sm mt-2">{teamSides}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div>
              <h3 className="text-center text-lg font-semibold text-gray-400 mb-2">Banned Maps</h3>
              <p className="text-center text-gray-500">{MAPS.filter(m => bannedMaps.includes(m.value)).map(m => m.name).join(" • ")}</p>
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
