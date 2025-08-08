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
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossLoser, setTossLoser] = useState<string | null>(null);

  const [vetoStep, setVetoStep] = useState(0);
  const [bannedMaps, setBannedMaps] = useState<string[]>([]);
  const [pickedMaps, setPickedMaps] = useState<PickedMap[]>([]);
  const [deciderMap, setDeciderMap] = useState<Map | null>(null);
  const [deciderMapSides, setDeciderMapSides] = useState<string | null>(null);

  const availableMaps = MAPS.filter(
    (map) =>
      !bannedMaps.includes(map.value) &&
      !pickedMaps.some((p) => p.mapValue === map.value)
  );

  const handleToss = () => {
    if (!teamA || !teamB) {
      alert("Please enter both team names.");
      return;
    }
    const teams = [teamA, teamB];
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
    setVetoStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (pickedMaps.length === 4 && bannedMaps.length === 2 && !deciderMap) {
      setDeciderMap(availableMaps[0] ?? null);
    }
  }, [pickedMaps, bannedMaps, availableMaps, deciderMap]);

  const VetoStepUI = () => {
    const prompts: { [key: number]: string } = {
      1: `Toss Winner (${tossWinner}) to PICK Map 1`,
      2: `Toss Loser (${tossLoser}) to choose side for ${pickedMaps[0]?.mapName}`,
      3: `Toss Loser (${tossLoser}) to PICK Map 2`,
      4: `Toss Winner (${tossWinner}) to choose side for ${pickedMaps[1]?.mapName}`,
      5: `Toss Winner (${tossWinner}) to BAN`,
      6: `Toss Loser (${tossLoser}) to BAN`,
      7: `Toss Winner (${tossWinner}) to PICK Map 3`,
      8: `Toss Loser (${tossLoser}) to choose side for ${pickedMaps[2]?.mapName}`,
      9: `Toss Loser (${tossLoser}) to PICK Map 4`,
      10: `Toss Winner (${tossWinner}) to choose side for ${pickedMaps[3]?.mapName}`,
      11: `Decider map is ${deciderMap?.name}. Toss Loser (${tossLoser}) to choose side.`,
      12: "Veto Complete!",
    };

    const currentPrompt = prompts[vetoStep];
    if (!currentPrompt) return null;

    const isMapSelectionStep = [1, 3, 5, 6, 7, 9].includes(vetoStep);
    if (isMapSelectionStep) {
      const onSelect = [5, 6].includes(vetoStep) ? handleBan : handlePick;

      return (
        <div className="my-6 p-4 bg-[#121212] border border-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold text-[#383bff] animate-pulse">
            {currentPrompt}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-4">
            {availableMaps.map((map) => (
              <div
                key={map.value}
                onClick={() => onSelect(map.value)}
                className="cursor-pointer group"
              >
                <div
                  className="w-full h-[120px] bg-cover bg-center rounded border-2 border-transparent group-hover:border-[#383bff] group-hover:scale-105 transition-all"
                  style={{ backgroundImage: `url('/images/${map.value}.jpg')` }}
                ></div>
                <p className="mt-2 font-semibold">{map.name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const isSideSelectionStep = [2, 4, 8, 10, 11].includes(vetoStep);
    if (isSideSelectionStep) {
      const mapIndex =
        vetoStep === 2
          ? 0
          : vetoStep === 4
          ? 1
          : vetoStep === 8
          ? 2
          : vetoStep === 10
          ? 3
          : -1;
      const onSelect =
        vetoStep === 11
          ? handleDeciderSideSelection
          : (side: string) => handleSideSelection(mapIndex, side);

      return (
        <div className="my-6 p-4 bg-[#121212] border border-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold text-[#383bff] animate-pulse">
            {currentPrompt}
          </h2>
          <div className="flex justify-center gap-6 mt-4">
            <button
              onClick={() => onSelect("Attack")}
              className="bg-[#383bff] text-white font-semibold px-6 py-3 rounded-lg"
            >
              Attack
            </button>
            <button
              onClick={() => onSelect("Defense")}
              className="bg-[#383bff] text-white font-semibold px-6 py-3 rounded-lg"
            >
              Defense
            </button>
          </div>
        </div>
      );
    }

    if (vetoStep >= 12) {
      return (
        <h2 className="text-3xl font-bold text-green-500 my-8">Veto Complete!</h2>
      );
    }

    return null;
  };

  return (
    <div className="text-center bg-black text-gray-100 p-5 min-h-screen font-[Poppins]">
      <div className="w-[95%] max-w-[1400px] mx-auto pt-24">
        <h1 className="text-3xl md:text-4xl font-bold text-[#383bff] drop-shadow-[0_0_10px_rgba(59,62,255,0.5)] mb-8">
          Best of 5 Map Veto
        </h1>

        {vetoStep === 0 && (
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
                />
              </div>
            </div>
            <button
              onClick={handleToss}
              className="bg-[#383bff] text-white font-semibold px-8 py-4 rounded-lg"
            >
              Toss
            </button>
          </>
        )}

        {vetoStep > 0 && <VetoStepUI />}

        {vetoStep > 0 && (
          <div className="mt-10 p-6 bg-[#121212] border-2 border-[#383bff] rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Veto Summary</h2>
            <div className="text-left space-y-3">
              {bannedMaps.length > 0 && (
                <div>
                  <p>
                    <strong className="text-red-500">Banned Maps:</strong>{" "}
                    {bannedMaps.join(", ")}
                  </p>
                </div>
              )}
              {pickedMaps.map((pick, index) => (
                <div key={index}>
                  <p>
                    <strong className="text-[#383bff]">
                      Map {index + 1}: {pick.mapName}
                    </strong>{" "}
                    (Picked by {pick.pickedBy})
                  </p>
                  {pick.startingSide && (
                    <p className="pl-4">
                      - {pick.teamOnSide} starts{" "}
                      <span className="font-bold">{pick.startingSide}</span>,{" "}
                      {pick.otherTeamOnSide} starts{" "}
                      <span className="font-bold">
                        {pick.startingSide === "Attack" ? "Defense" : "Attack"}
                      </span>
                    </p>
                  )}
                </div>
              ))}
              {deciderMap && (
                <div>
                  <p className="text-green-400">
                    <strong>Map 5 (Decider): {deciderMap.name}</strong>
                  </p>
                  {deciderMapSides && (
                    <p className="pl-4">- {deciderMapSides}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapVetoBo5;
