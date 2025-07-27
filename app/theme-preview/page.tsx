export default function ThemePreview() {
  return (
    <main className="max-w-xl mx-auto py-8 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold mb-6">Theme Preview</h1>
      <div className="flex flex-col gap-4 w-full">
        <div className="rounded-xl p-6 bg-[color:var(--surface)] border border-[color:var(--border)] shadow">
          <h2 className="text-2xl font-bold mb-2">Surface Card</h2>
          <p className="text-[color:var(--foreground)]">This card uses <b>surface</b>, borders, and standard font color.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-white px-4 py-2 rounded-main font-semibold transition"
          >
            Primary Button
          </button>
          <button
            className="bg-[color:var(--secondary)] hover:bg-[color:var(--secondary-hover)] text-white px-4 py-2 rounded-main font-semibold transition"
          >
            Secondary Button
          </button>
          <button
            className="bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white px-4 py-2 rounded-main font-semibold transition"
          >
            Accent Button
          </button>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1 rounded-main bg-[color:var(--success)] text-white font-semibold">Success</div>
          <div className="px-3 py-1 rounded-main bg-[color:var(--danger)] text-white font-semibold">Error</div>
        </div>
        <p className="text-[color:var(--gray)]">Muted info (gray)</p>
        <p className="text-[color:var(--muted)]">Muted text (muted)</p>
        <p className="text-[color:var(--black)]">Super-bold text (black variable)</p>
      </div>
    </main>
  )
}
