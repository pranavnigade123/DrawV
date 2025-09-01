export default function TournamentsListPage() {
  // Placeholder content — replace with real tournament cards/list when ready!
  return (
    // MODIFIED: Changed py-12 to pt-28 and pb-12 to add space at the top
    <main className="max-w-3xl mx-auto pt-28 pb-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">Events</h1>
      <p className="mb-6 text-zinc-300">
        Browse upcoming and ongoing Events. Join events, see details and live brackets!
      </p>

      {/* Example content; replace with actual tournaments map/list */}
      <div className="space-y-4">
        <div className="bg-zinc-900 p-4 rounded-xl shadow border border-zinc-800">
          <h2 className="text-xl font-semibold mb-1">No Events yet</h2>
          <p className="text-zinc-500">Events will appear here soon!</p>
        </div>
      </div>
    </main>
  );
}