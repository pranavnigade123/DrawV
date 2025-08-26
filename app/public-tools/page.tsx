'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PublicToolsPage() {
  const [showVetoOptions, setShowVetoOptions] = useState(false);

  // Define the new button style in a variable for reusability and clarity
  const matteButtonStyles = "text-sm px-4 py-2 rounded text-center text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-500 transition-colors duration-200";

  return (
    <main className="max-w-2xl mt-20 mx-auto py-16 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">Public Esports Tools</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-300 text-center">
        Open tournament tools for guests, players, and admins&mdash;useful for any event!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Bracket Generator */}
        <a
          href="#"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400  transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Bracket Generator</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
            Instantly create and share single/double elimination brackets for your tournaments.
          </p>
        </a>

        {/* Coin Toss */}
        <a
          href="/cointoss"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6  dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400  transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Coin Toss</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
            Fair, instant coin flips to decide sides or maps.
          </p>
        </a>

        {/* Map Veto (with BO1/BO3/BO5 buttons) */}
        <div
          onClick={() => setShowVetoOptions(!showVetoOptions)}
          className="cursor-pointer block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400   transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Map Veto</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
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

      <p className="text-sm text-zinc-500 mt-10">More tools coming soon!</p>
    </main>
  );
}