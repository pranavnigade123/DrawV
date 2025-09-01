'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PublicToolsPage() {
  const [showVetoOptions, setShowVetoOptions] = useState(false);

  // Reusable button styles
  const matteButtonStyles =
    "text-sm px-4 py-2 rounded text-center text-white bg-blue-600 border border-blue-700 hover:bg-blue-500 transition-colors duration-200";

  // Card styles
  const cardStyles =
    "block rounded-xl border border-zinc-800 p-6 bg-zinc-900 shadow hover:shadow-lg hover:border-cyan-400 transition";

  return (
    <main className="max-w-6xl mx-auto py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl sm:text-5xl mt-10 md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        Gaming Tools
      </h1>
      <br />

      <p className="mb-8 text-zinc-300 text-center">
        Open tournament tools for guests, players, and admins—useful for any event!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Bracket Generator */}
        <a href="#" className={cardStyles}>
          <h2 className="font-semibold text-lg mb-2 text-indigo-400">
            Bracket Generator
          </h2>
          <p className="text-zinc-300 text-sm">
            Instantly create and share single/double elimination brackets for your tournaments.
          </p>
        </a>

        {/* Coin Toss */}
        <a href="/cointoss" className={cardStyles}>
          <h2 className="font-semibold text-lg mb-2 text-indigo-400">
            Coin Toss
          </h2>
          <p className="text-zinc-300 text-sm">
            Fair, instant coin flips to decide sides or maps.
          </p>
        </a>

        {/* Map Veto */}
        <div
          onClick={() => setShowVetoOptions(!showVetoOptions)}
          className={`cursor-pointer ${cardStyles}`}
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-400">
            Map Veto
          </h2>
          <p className="text-zinc-300 text-sm">
            Randomly or strategically veto maps for your matchups.
          </p>

          {showVetoOptions && (
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/veto/bo1" className={matteButtonStyles}>
                BO1
              </Link>
              <Link href="/veto/bo3" className={matteButtonStyles}>
                BO3
              </Link>
              <Link href="/veto/bo5" className={matteButtonStyles}>
                BO5
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-zinc-400 mt-10">More tools coming soon!</p>
    </main>
  );
}
