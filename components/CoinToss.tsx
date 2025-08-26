'use client';

import { useState } from 'react';
import Image from 'next/image';

// --- CSS for the animation ---
const coinFlipStyles = `
  .coin-container {
    perspective: 1000px;
    width: 200px;
    height: 200px;
  }
  .coin {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
  }
  .coin-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
  }
  .front {
    transform: rotateY(0deg);
  }
  .back {
    transform: rotateY(180deg);
  }

  @keyframes flip-heads {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(3600deg); } /* 10 full spins */
  }
  @keyframes flip-tails {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(3780deg); } /* 10.5 spins */
  }

  .animate-heads {
    animation: flip-heads 5s ease-out forwards;
  }
  .animate-tails {
    animation: flip-tails 5s ease-out forwards;
  }
`;

// --- IMAGE PATHS ---
const HEADS_IMAGE_PATH = '/heads.png';
const TAILS_IMAGE_PATH = '/tails.png';


// --- MAIN COMPONENT ---
const CoinToss = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [animationClass, setAnimationClass] = useState('');

  const handleToss = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    setAnimationClass('');

    const outcome: 'Heads' | 'Tails' = Math.random() < 0.5 ? 'Heads' : 'Tails';
    
    setTimeout(() => {
      if (outcome === 'Heads') {
        setAnimationClass('animate-heads');
      } else {
        setAnimationClass('animate-tails');
      }
    }, 10);

    setTimeout(() => {
      setIsFlipping(false);
      setResult(outcome);
    }, 5000);
  };

  const getWinner = () => {
    if (!result) return '';
    return result === 'Heads' ? teamA : teamB;
  };

  return (
    <>
      <style>{coinFlipStyles}</style>
      <main className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center text-center mt-20">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">Fair Coin Toss</h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-300">
          Enter team names and click the button for a random toss.
        </p>

        {/* --- TEAM INPUTS --- */}
        <div className="flex justify-center gap-10 mb-8 flex-wrap w-full">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-lg w-full max-w-[300px]">
            <label htmlFor="teamA" className="text-indigo-600 font-semibold text-lg">Heads</label>
            <input
              type="text"
              id="teamA"
              className="mt-2 w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="Enter Team A Name"
            />
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-lg w-full max-w-[300px]">
            <label htmlFor="teamB" className="text-indigo-600 font-semibold text-lg">Tails</label>
            <input
              type="text"
              id="teamB"
              className="mt-2 w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="Enter Team B Name"
            />
          </div>
        </div>

        {/* --- COIN DISPLAY --- */}
        <div className="my-8">
          <div className="coin-container">
            <div className={`coin ${animationClass}`}>
              <div className="coin-face front">
                <Image src={HEADS_IMAGE_PATH} alt="Heads" layout="fill" objectFit="cover" />
              </div>
              <div className="coin-face back">
                <Image src={TAILS_IMAGE_PATH} alt="Tails" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>
        </div>

        {/* --- TOSS BUTTON & RESULT --- */}
        <button
          onClick={handleToss}
          disabled={isFlipping}
          className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-indigo-700 transition disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          {isFlipping ? 'Flipping...' : 'Toss Coin'}
        </button>

        {!isFlipping && result && (
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-500 rounded-lg">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              The result is {result}!
            </h2>
            <p className="text-xl mt-2 text-zinc-800 dark:text-zinc-200">
              <span className="font-bold">{getWinner()}</span> wins the toss.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default CoinToss;