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
  
  // Toss animation state
  const [isTossing, setIsTossing] = useState(false);
  const [tossDisplayTeam, setTossDisplayTeam] = useState<string | null>(null);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  const [pendingLoser, setPendingLoser] = useState<string | null>(null);
  const [tossPhase, setTossPhase] = useState<'spinning' | 'revealing' | 'done'>('spinning');

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
    
    // Start animation instead of showing result immediately
    setPendingWinner(winner);
    setPendingLoser(loser);
    setIsTossing(true);
    setVetoStep(0.25); // Animation step
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

      case 0.25:
        // Toss animation step
        return (
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
                                src={getMapImagePath(finalMapInfo.value)}
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
