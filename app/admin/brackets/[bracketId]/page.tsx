// app/admin/brackets/[bracketId]/page.tsx
import BracketViewer from "@/components/brackets/BracketViewer";

export default async function BracketPage({ params }: { params: Promise<{ bracketId: string }> }) {
  const { bracketId } = await params;
  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-semibold text-white mb-4">Bracket {bracketId}</h1>
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-6">
          {/* client component handles fetch */}
          <BracketViewer bracketId={bracketId} />
        </div>
      </div>
    </main>
  );
}
