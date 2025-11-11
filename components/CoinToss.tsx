'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const coinFlipStyles = `
  .coin-container {
    perspective: 1000px;
    width: 100%;
    max-width: 200px;
    aspect-ratio: 1;
  }
  @media (max-width: 640px) {
    .coin-container {
      max-width: 160px;
    }
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
    to { transform: rotateY(3600deg); }
  }
  @keyframes flip-tails {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(3780deg); }
  }

  .animate-heads {
    animation: flip-heads 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  .animate-tails {
    animation: flip-tails 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;

const HEADS_IMAGE_PATH = '/heads.png';
const TAILS_IMAGE_PATH = '/tails.png';

const CoinToss = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [animationClass, setAnimationClass] = useState('');

  const handleToss = () => {
    if (isFlipping) return;
    if (!teamA.trim() || !teamB.trim()) {
      alert('Please enter both team names');
      return;
    }

    setIsFlipping(true);
    setResult(null);
    setAnimationClass('');

    const outcome: 'Heads' | 'Tails' = Math.random() < 0.5 ? 'Heads' : 'Tails';
    
    setTimeout(() => {
      setAnimationClass(outcome === 'Heads' ? 'animate-heads' : 'animate-tails');
    }, 10);

    setTimeout(() => {
      setIsFlipping(false);
      setResult(outcome);
    }, 3500);
  };

  const getWinner = () => {
    if (!result) return '';
    return result === 'Heads' ? teamA : teamB;
  };

  return (
    <>
      <style>{coinFlipStyles}</style>
      <main className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Coin Toss</h1>
            <Link href="/public-tools" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Back to Tools
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Team Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Team A - Heads */}
              <div>
                <label htmlFor="teamA" className="block text-sm text-zinc-300 mb-2">
                  Team A (Heads)
                </label>
                <input
                  type="text"
                  id="teamA"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-500"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Enter team name"
                  disabled={isFlipping}
                />
              </div>

              {/* Team B - Tails */}
              <div>
                <label htmlFor="teamB" className="block text-sm text-zinc-300 mb-2">
                  Team B (Tails)
                </label>
                <input
                  type="text"
                  id="teamB"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-500"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Enter team name"
                  disabled={isFlipping}
                />
              </div>
            </div>

            {/* Coin Display */}
            <div className="flex justify-center mb-8">
              <div className="coin-container">
                <div className={`coin ${animationClass}`}>
                  <div className="coin-face front">
                    <Image src={HEADS_IMAGE_PATH} alt="Heads" fill className="object-cover" />
                  </div>
                  <div className="coin-face back">
                    <Image src={TAILS_IMAGE_PATH} alt="Tails" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Toss Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleToss}
                disabled={isFlipping}
                className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
              >
                {isFlipping ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Flipping...
                  </span>
                ) : (
                  'Toss Coin'
                )}
              </button>
            </div>

            {/* Result Display */}
            {!isFlipping && result && (
              <div className="p-6 bg-zinc-800/70 border border-zinc-700 rounded-lg text-center">
                <p className="text-sm text-zinc-400 mb-1">Result</p>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {result}
                </h2>
                <p className="text-sm text-zinc-400 mb-1">Winner</p>
                <p className="text-xl font-semibold text-indigo-400">
                  {getWinner()}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CoinToss;