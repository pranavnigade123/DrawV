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

const MapVetoBo5 = () => {
  // --- STATE MANAGEMENT ---
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossLoser, setTossLoser] = useState<string | null>(null);

  const [vetoStep, setVetoStep] = useState(0);
  const [bannedMaps, setBannedMaps] = useState<string[]>([]);
  const [pickedMaps, setPickedMaps] = useState<PickedMap[]>([]);
  const [deciderMap, setDeciderMap] = useState<Map | null>(null);
  const [deciderMapSides, setDeciderMapSides] = useState<string | null>(null);

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
    setVetoStep(1);
  };

  const handleBan = (mapValue: string) => {
    setBannedMaps((prev) => [...prev, mapValue]);
    setVetoStep((prev) => prev + 1);
  };

  const handlePick = (mapValue: string) => {
    const isWinnerPicking = [1, 7].includes(vetoStep);
    const picker = isWinnerPicking ? tossWinner : tossLoser;
    const sideChooser = isWinnerPicking ? tossLoser : tossWinner;
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

    pick.startingSide = side;
    pick.teamOnSide = pick.sideChoiceBy;
    pick.otherTeamOnSide = pick.pickedBy;

    setPickedMaps(updatedPicks);
    setVetoStep((prev) => prev + 1);
  };

  const handleDeciderSideSelection = (side: string) => {
    if (tossLoser && tossWinner) {
      const otherSide = side === "Attack" ? "Defense" : "Attack";
      setDeciderMapSides(
        `${tossLoser} chooses ${side}, ${tossWinner} starts ${otherSide}`
      );
    }
    setVetoStep((prev) => prev + 1);
  };

  // Effect to determine the decider map
  useEffect(() => {
    if (vetoStep === 11 && !deciderMap) {
        const remainingMap = MAPS.find(m => !bannedMaps.includes(m.value) && !pickedMaps.some(p => p.mapValue === m.value));
        if (remainingMap) {
            setDeciderMap(remainingMap);
        }
    }
  }, [vetoStep, bannedMaps, pickedMaps, deciderMap]);


  // --- UI RENDER FUNCTIONS ---
  const renderStepContent = () => {
    const prompts: { [key: number]: React.ReactNode } = {
        1: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-green-500">PICK</span> Map 1</>,
        2: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to choose side for <span className="font-bold">{pickedMaps[0]?.mapName}</span></>,
        3: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-green-500">PICK</span> Map 2</>,
        4: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to choose side for <span className="font-bold">{pickedMaps[1]?.mapName}</span></>,
        5: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-red-500">BAN</span></>,
        6: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-red-500">BAN</span></>,
        7: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-green-500">PICK</span> Map 3</>,
        8: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to choose side for <span className="font-bold">{pickedMaps[2]?.mapName}</span></>,
        9: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-green-500">PICK</span> Map 4</>,
        10: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to choose side for <span className="font-bold">{pickedMaps[3]?.mapName}</span></>,
        11: <>Decider map is <span className="font-bold">{deciderMap?.name}</span>. Toss Loser (<span className="font-bold">{tossLoser}</span>) to choose side.</>,
        12: "Veto Complete!",
    };

    const currentPrompt = prompts[vetoStep];
    if (!currentPrompt) return null;

    const isMapStep = [1, 3, 5, 6, 7, 9].includes(vetoStep);
    if (isMapStep) {
      const onSelect = [5, 6].includes(vetoStep) ? handleBan : handlePick;
      return (
        <div className="w-full flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6 text-center">{currentPrompt}</h2>
            <div className="flex flex-col items-center gap-6 w-full p-4 lg:flex-row lg:justify-center lg:overflow-x-auto">
                {MAPS.map((map) => {
                    const isBanned = bannedMaps.includes(map.value);
                    const isPicked = pickedMaps.some(p => p.mapValue === map.value);
                    const isSelected = isBanned || isPicked;
                    
                    return (
                        <button
                            key={map.value}
                            onClick={() => onSelect(map.value)}
                            disabled={isSelected}
                            title={map.name + (isSelected ? " (Taken)" : "")}
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
                                <div className={`absolute inset-0 
                                    ${isBanned ? 'bg-gradient-to-t from-red-900/80' : 'bg-gradient-to-t from-green-900/80'} to-transparent`}>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
      );
    }

    const isSideStep = [2, 4, 8, 10, 11].includes(vetoStep);
    if (isSideStep) {
      const mapIndex = vetoStep === 2 ? 0 : vetoStep === 4 ? 1 : vetoStep === 8 ? 2 : 3;
      const onSelect = vetoStep === 11 ? handleDeciderSideSelection : (side: string) => handleSideSelection(mapIndex, side);
      return (
        <div className="max-w-md w-full text-center mx-auto">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6">{currentPrompt}</h2>
            <div className="flex justify-center gap-12">
                {["Attack", "Defense"].map((side) => (
                    <button
                        key={side}
                        onClick={() => onSelect(side)}
                        className="bg-[#383bff] px-8 py-3 rounded-lg font-semibold text-white hover:bg-[#5363ff] shadow-md focus:outline-none focus:ring-4 focus:ring-[#7fc3ff] transition"
                    >
                        {side}
                    </button>
                ))}
            </div>
        </div>
      );
    }

    if (vetoStep >= 12) {
      return (
        <div className="max-w-5xl w-full mx-auto text-left">
            <h2 className="text-3xl text-white font-bold mb-8 text-center">
                Veto Completed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-8">
                {pickedMaps.map((pick, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
                        <div className="relative w-full aspect-[4/3]">
                             <img
                                src={`/maps/${pick.mapValue}.jpg`}
                                alt={pick.mapName}
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
                                <p className="text-[10px] sm:text-xs text-blue-400">MAP {i + 1} - PICKED BY {pick.pickedBy.toUpperCase()}</p>
                                <h3 className="text-base sm:text-lg font-bold text-white my-1">{pick.mapName}</h3>
                            </div>
                            {pick.startingSide && (
                                <p className="text-gray-300 text-xs sm:text-sm mt-2">
                                    <span className="font-semibold">{pick.teamOnSide}</span> starts on <span className="font-semibold">{pick.startingSide}</span>
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {deciderMap && (
                     <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
                        <div className="relative w-full aspect-[4/3]">
                             <img
                                src={`/maps/${deciderMap.value}.jpg`}
                                alt={deciderMap.name}
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
                                <p className="text-[10px] sm:text-xs text-blue-400">MAP 5 - DECIDER</p>
                                <h3 className="text-base sm:text-lg font-bold text-white my-1">{deciderMap.name}</h3>
                            </div>
                            {deciderMapSides && (
                                <p className="text-gray-300 text-xs sm:text-sm mt-2">{deciderMapSides}</p>
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
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black p-4 sm:p-6 pt-24 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 text-center select-none">Best of 5 Map Veto</h1>
      <div className="w-full max-w-7xl rounded-xl border border-gray-700 bg-[#121212]/50 p-6 sm:p-8 min-h-[400px] flex items-center justify-center">
        {vetoStep === 0 ? (
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
        ) : (
          renderStepContent()
        )}
      </div>
    </main>
  );
};

export default MapVetoBo5;
