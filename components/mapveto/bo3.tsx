"use client";

import React, { useState, useEffect } from "react";

// Toss animation styles
const tossAnimationStyles = `
  @keyframes coinFlip {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(1800deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1); }
    50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2); }
  }
  
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fadeInScale {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  .coin-container {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  
  .coin-flip {
    animation: coinFlip 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards;
    transform-style: preserve-3d;
  }
  
  .shimmer-text {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0.1) 100%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    animation: shimmer 2s linear infinite;
  }
  
  .glow-box {
    animation: glow 1.5s ease-in-out infinite;
  }
  
  .float-animation {
    animation: floatUp 2s ease-in-out infinite;
  }
  
  .fade-in-scale {
    animation: fadeInScale 0.3s ease-out forwards;
  }
`;

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

const MapVetoBo3 = () => {
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

  // Toss animation state
  const [isTossing, setIsTossing] = useState(false);
  const [tossDisplayTeam, setTossDisplayTeam] = useState<string | null>(null);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  const [pendingLoser, setPendingLoser] = useState<string | null>(null);
  const [tossPhase, setTossPhase] = useState<'spinning' | 'revealing' | 'done'>('spinning');

  // Toss animation effect
  useEffect(() => {
    if (!isTossing) return;
    
    const teams = [teamA.trim(), teamB.trim()];
    let iteration = 0;
    const totalIterations = 16;
    const baseInterval = 80;
    
    setTossPhase('spinning');
    
    const animate = () => {
      if (iteration >= totalIterations) {
        // Show revealing phase
        setTossPhase('revealing');
        setTossDisplayTeam(pendingWinner);
        
        // After a brief pause, complete the animation
        setTimeout(() => {
          setTossPhase('done');
          setIsTossing(false);
          setTossWinner(pendingWinner);
          setTossLoser(pendingLoser);
          setTossDisplayTeam(null);
          setVetoStep(0.5);
        }, 1200);
        return;
      }
      
      // Alternate between teams with slowing effect
      setTossDisplayTeam(teams[iteration % 2]);
      iteration++;
      
      // Smooth easing curve for natural slowdown
      const progress = iteration / totalIterations;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const delay = baseInterval + (easeOut * 400);
      setTimeout(animate, delay);
    };
    
    animate();
  }, [isTossing, teamA, teamB, pendingWinner, pendingLoser]);

  // --- HANDLER FUNCTIONS ---
  const handleToss = () => {
    if (!teamA.trim() || !teamB.trim()) {
      alert("Please enter both team names.");
      return;
    }
    const teams = [teamA.trim(), teamB.trim()];
    // Use Date.now() as additional entropy for better randomization
    const randomIndex = Math.floor((Math.random() + Date.now() % 2) * teams.length) % teams.length;
    const winner = teams[randomIndex];
    const loser = teams.find((t) => t !== winner) ?? null;
    
    // Start animation instead of showing result immediately
    setPendingWinner(winner);
    setPendingLoser(loser);
    setIsTossing(true);
    setVetoStep(0.25); // Animation step
  };

  const handleStartVeto = () => {
    setVetoStep(1); // Start the veto process
  };

  const handleBan = (mapValue: string) => {
    setBannedMaps((prev) => [...prev, mapValue]);
    setVetoStep((prev) => prev + 1);
  };

  const handlePick = (mapValue: string) => {
    // BO3 Pick Logic
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
        `${tossWinner} chooses ${side}, ${tossLoser} starts ${otherSide}`
      );
    }
    setVetoStep((prev) => prev + 1);
  };

  // Effect to determine the decider map
  useEffect(() => {
    if (vetoStep === 9 && !deciderMap) {
        const remainingMap = MAPS.find(m => !bannedMaps.includes(m.value) && !pickedMaps.some(p => p.mapValue === m.value));
        if (remainingMap) {
            setDeciderMap(remainingMap);
        }
    }
  }, [vetoStep, bannedMaps, pickedMaps, deciderMap]);


  // --- UI RENDER FUNCTIONS ---
  const renderStepContent = () => {
    const prompts: { [key: number]: React.ReactNode } = {
        0.5: "Toss Result",
        1: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-red-500">BAN</span></>,
        2: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-red-500">BAN</span></>,
        3: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-green-500">PICK</span></>,
        4: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to choose side for <span className="font-bold">{pickedMaps[0]?.mapName}</span></>,
        5: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-green-500">PICK</span></>,
        6: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to choose side for <span className="font-bold">{pickedMaps[1]?.mapName}</span></>,
        7: <>Toss Winner (<span className="font-bold">{tossWinner}</span>) to <span className="text-red-500">BAN</span></>,
        8: <>Toss Loser (<span className="font-bold">{tossLoser}</span>) to <span className="text-red-500">BAN</span></>,
        9: <>Decider map is <span className="font-bold">{deciderMap?.name}</span>. Toss Winner (<span className="font-bold">{tossWinner}</span>) to choose side.</>,
        10: "Veto Complete!",
    };

    const currentPrompt = prompts[vetoStep];
    if (!currentPrompt) return null;

    // Toss result display
    if (vetoStep === 0.5) {
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
    }

    const isMapStep = [1, 2, 3, 5, 7, 8].includes(vetoStep);
    if (isMapStep) {
      const onSelect = [1, 2, 7, 8].includes(vetoStep) ? handleBan : handlePick;
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
                                <div className={`absolute inset-0 flex items-center justify-center
                                    ${isBanned 
                                      ? 'bg-black/60 backdrop-blur-[2px]' 
                                      : 'bg-gradient-to-t from-green-600/40 via-green-500/20 to-transparent backdrop-blur-[1px]'
                                    }`}>
                                    {isBanned && (
                                      <div className="absolute inset-0 border-2 border-gray-500/50"></div>
                                    )}
                                    {!isBanned && (
                                      <div className="absolute inset-0 border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
      );
    }

    const isSideStep = [4, 6, 9].includes(vetoStep);
    if (isSideStep) {
      const mapIndex = vetoStep === 4 ? 0 : 1;
      const onSelect = vetoStep === 9 ? handleDeciderSideSelection : (side: string) => handleSideSelection(mapIndex, side);
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

    if (vetoStep >= 10) {
      return (
        <div className="max-w-5xl w-full mx-auto text-left">
            <h2 className="text-3xl text-white font-bold mb-8 text-center">
                Veto Completed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {pickedMaps.map((pick, i) => (
                    <div key={i} className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/50 transition-all duration-300">
                        <div className="relative w-full aspect-[4/3]">
                             <img
                                src={getMapImagePath(pick.mapValue)}
                                alt={pick.mapName}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; 
                                    target.src='https://placehold.co/400x300/121212/FFFFFF?text=Map+Image';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-[10px] sm:text-xs text-blue-400 font-semibold tracking-wider mb-1">MAP {i + 1} - PICKED BY {pick.pickedBy.toUpperCase()}</p>
                                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">{pick.mapName}</h3>
                            </div>
                        </div>
                        {pick.startingSide && (
                            <div className="p-3 bg-zinc-800/50">
                                <p className="text-gray-300 text-xs sm:text-sm text-center">
                                    <span className="font-semibold">{pick.teamOnSide}</span> starts on <span className="font-semibold">{pick.startingSide}</span>
                                </p>
                            </div>
                        )}
                    </div>
                ))}
                {deciderMap && (
                     <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/50 transition-all duration-300">
                        <div className="relative w-full aspect-[4/3]">
                             <img
                                src={getMapImagePath(deciderMap.value)}
                                alt={deciderMap.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; 
                                    target.src='https://placehold.co/400x300/121212/FFFFFF?text=Map+Image';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-[10px] sm:text-xs text-blue-400 font-semibold tracking-wider mb-1">MAP 3 - DECIDER</p>
                                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">{deciderMap.name}</h3>
                            </div>
                        </div>
                        {deciderMapSides && (
                            <div className="p-3 bg-zinc-800/50">
                                <p className="text-gray-300 text-xs sm:text-sm text-center">{deciderMapSides}</p>
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
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black p-4 sm:p-6 pt-24 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 text-center select-none">Best of 3 Map Veto</h1>
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
        ) : vetoStep === 0.25 ? (
          // Toss animation step
          <>
            <style>{tossAnimationStyles}</style>
            <div className="max-w-2xl w-full mx-auto text-center">
              {/* Header */}
              <div className="mb-10">
                <h2 className="text-2xl font-medium text-zinc-400 mb-2">Deciding who goes first</h2>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
              </div>
              
              {/* Main coin/card area */}
              <div className="relative h-64 flex items-center justify-center coin-container">
                {/* Background glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 ${
                    tossPhase === 'revealing' ? 'scale-150 bg-green-500/20' : ''
                  }`} />
                </div>
                
                {/* Orbiting particles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-56 h-56 rounded-full border border-indigo-500/20 ${
                    tossPhase !== 'revealing' ? 'animate-spin' : ''
                  }`} style={{ animationDuration: '3s' }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                </div>
                
                {/* Team name card */}
                <div className={`relative z-10 ${
                  tossPhase === 'revealing' ? 'fade-in-scale' : ''
                }`}>
                  <div className={`
                    relative px-12 py-8 rounded-2xl
                    bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900
                    border-2 transition-all duration-300
                    ${tossPhase === 'revealing' 
                      ? 'border-green-500 glow-box float-animation' 
                      : 'border-indigo-500/50'}
                    ${tossPhase !== 'revealing' ? 'coin-flip' : ''}
                  `} style={{
                    boxShadow: tossPhase === 'revealing' 
                      ? '0 0 40px rgba(34, 197, 94, 0.3)' 
                      : '0 0 30px rgba(99, 102, 241, 0.2)'
                  }}>
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                    
                    {/* Team name */}
                    <p className={`relative text-4xl font-bold tracking-wide ${
                      tossPhase === 'revealing' 
                        ? 'text-green-400' 
                        : 'text-white shimmer-text'
                    }`}>
                      {tossDisplayTeam || teamA.trim()}
                    </p>
                    
                    {tossPhase === 'revealing' && (
                      <p className="text-sm text-green-400/80 mt-2 font-medium uppercase tracking-widest">
                        Winner
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Team indicators */}
              <div className="mt-10 flex justify-center items-center gap-6">
                <div className={`
                  relative px-6 py-3 rounded-xl border-2 transition-all duration-200
                  ${tossDisplayTeam === teamA.trim() 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-105' 
                    : 'border-zinc-700/50 bg-zinc-900/30'}
                `}>
                  {tossDisplayTeam === teamA.trim() && (
                    <div className="absolute inset-0 rounded-xl bg-indigo-500/5 animate-pulse" />
                  )}
                  <span className={`relative font-semibold ${
                    tossDisplayTeam === teamA.trim() ? 'text-indigo-300' : 'text-zinc-500'
                  }`}>{teamA.trim()}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                  <span className="text-zinc-600 text-sm my-1">vs</span>
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                </div>
                
                <div className={`
                  relative px-6 py-3 rounded-xl border-2 transition-all duration-200
                  ${tossDisplayTeam === teamB.trim() 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-105' 
                    : 'border-zinc-700/50 bg-zinc-900/30'}
                `}>
                  {tossDisplayTeam === teamB.trim() && (
                    <div className="absolute inset-0 rounded-xl bg-indigo-500/5 animate-pulse" />
                  )}
                  <span className={`relative font-semibold ${
                    tossDisplayTeam === teamB.trim() ? 'text-indigo-300' : 'text-zinc-500'
                  }`}>{teamB.trim()}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          renderStepContent()
        )}
      </div>
    </main>
  );
};

export default MapVetoBo3;
