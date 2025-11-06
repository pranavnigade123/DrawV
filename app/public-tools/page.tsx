"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicToolsPage() {
  const [showVetoOptions, setShowVetoOptions] = useState(false);

  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-32 pb-20">
      <section className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight text-white">
          Esports Tools
        </h1>
        <p className="text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          Power your tournaments with easy-to-use tools for fair play, quick
          setup, and smooth management.
        </p>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {/* Bracket Generator */}
          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 shadow-sm transition-all duration-300 hover:border-zinc-700 flex flex-col justify-between p-6">
            <div className="text-left">
              <h2 className="font-semibold text-xl mb-2 text-white">
                Bracket Generator
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Instantly create and share single or double elimination brackets
                for your tournaments.
              </p>
            </div>
            <div className="mt-6">
              <button
                disabled
                className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-zinc-800 border border-zinc-700 cursor-not-allowed opacity-70"
              >
                Coming soon
              </button>
            </div>
          </div>

          {/* Coin Toss */}
          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 shadow-sm transition-all duration-300 hover:border-zinc-700 flex flex-col justify-between p-6">
            <div className="text-left">
              <h2 className="font-semibold text-xl mb-2 text-white">
                Coin Toss
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Fair, instant coin flips to decide sides, maps, or order.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/cointoss"
                className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Flip Coin
              </Link>
            </div>
          </div>

          {/* Map Veto */}
          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 shadow-sm transition-all duration-300 hover:border-zinc-700 flex flex-col justify-between p-6">
            <div className="text-left">
              <h2 className="font-semibold text-xl mb-2 text-white">
                Map Veto
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Randomly or strategically veto maps for your matchups.
              </p>
            </div>

            {/* Button and expandable section */}
            <div className="mt-6">
              <button
                onClick={() => setShowVetoOptions(!showVetoOptions)}
                className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Open Veto
              </button>

              <AnimatePresence>
                {showVetoOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 flex flex-col gap-3"
                  >
                    <Link
                      href="/veto/bo1"
                      className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    >
                      Best of 1
                    </Link>
                    <Link
                      href="/veto/bo3"
                      className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    >
                      Best of 3
                    </Link>
                    <Link
                      href="/veto/bo5"
                      className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    >
                      Best of 5
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mt-16">
          More tools and features are on the way!
        </p>
      </section>
    </main>
  );
}
