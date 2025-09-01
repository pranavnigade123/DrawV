'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PublicToolsPage() {
  const [showVetoOptions, setShowVetoOptions] = useState(false);

  // Reusable button styles
  const matteButtonStyles = "text-sm px-4 py-2 rounded text-center text-white bg-blue-600 border border-blue-700 hover:bg-blue-500 transition-colors duration-200";

  // Reusable blue gradient style for headings
  const headingGradientStyle = {
    background: 'linear-gradient(to right, #3b82f6, #22d3ee)', // Blue to cyan gradient
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };
  
  // Card styles with the background box restored
  const cardStyles = "block rounded-xl border border-zinc-800 p-6 bg-zinc-900 shadow hover:shadow-lg hover:border-cyan-400 transition";

  return (
    // The main page background class has been removed
    <main className="max-w-2xl mt-20 mx-auto py-16 px-4 flex flex-col items-center">
      <h1 className="text-6xl font-bold mb-10 text-center " style={headingGradientStyle}>
        Esports Tools
      </h1>
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Bracket Generator */}
        <a href="#" className={cardStyles}>
          <h2 className="font-semibold text-lg mb-2" style={headingGradientStyle}>
            Bracket Generator
          </h2>
          <p className="text-zinc-300 text-sm">
            Instantly create and share single/double elimination brackets for your tournaments.
          </p>
        </a>

        {/* Coin Toss */}
        <a href="/cointoss" className={cardStyles}>
          <h2 className="font-semibold text-lg mb-2" style={headingGradientStyle}>
            Coin Toss
          </h2>
          <p className="text-zinc-300 text-sm">
            Fair, instant coin flips to decide sides or maps.
          </p>
        </a>

        {/* Map Veto (with BO1/BO3/BO5 buttons) */}
        <div
          onClick={() => setShowVetoOptions(!showVetoOptions)}
          className={`cursor-pointer ${cardStyles}`}
        >
          <h2 className="font-semibold text-lg mb-2" style={headingGradientStyle}>
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