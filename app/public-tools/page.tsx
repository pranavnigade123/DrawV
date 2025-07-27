export default function PublicToolsPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">Public Esports Tools</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-300 text-center">
        Open tournament tools for guests, players, and admins&mdash;useful for any event!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Bracket Generator */}
        <a
          href="#"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Bracket Generator</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
            Instantly create and share single/double elimination brackets for your tournaments.
          </p>
        </a>
        {/* Coin Toss */}
        <a
          href="#"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Coin Toss</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
            Fair, instant coin flips to decide sides or maps.
          </p>
        </a>
        {/* Map Veto */}
        <a
          href="#"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow hover:shadow-lg hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
        >
          <h2 className="font-semibold text-lg mb-2 text-indigo-600">Map Veto</h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm">
            Randomly or strategically veto maps for your matchups.
          </p>
        </a>
        {/* Add more tools as needed */}
        {/* <a ... >...</a> */}
      </div>
      <p className="text-sm text-zinc-500 mt-10">
        More tools coming soon!
      </p>
    </main>
  );
}
