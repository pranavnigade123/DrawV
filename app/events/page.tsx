export default function TournamentsListPage() {
  return (
    <main className="max-w-6xl mx-auto pt-28 pb-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-400">Events</h1>
      <p className="mb-6 text-zinc-300">
        Browse upcoming and ongoing Events. Join events, see details and live brackets!
      </p>

      <div className="space-y-4">
        <div className="bg-zinc-900 p-4 rounded-xl shadow border border-zinc-800">
          <h2 className="text-xl font-semibold mb-1">No Events yet</h2>
          <p className="text-zinc-500">Events will appear here soon!</p>
        </div>
      </div>
    </main>
  );
}
