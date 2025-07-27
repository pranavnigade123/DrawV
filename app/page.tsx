export default function LandingPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-2xl rounded-2xl shadow bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-6">
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-700">Welcome to DRAW V</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          The all-in-one esports tournament management platform.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <a href="/register" className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow transition">Get Started</a>
          <a href="/dashboard" className="px-6 py-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 hover:bg-indigo-100 dark:hover:bg-indigo-700 border border-indigo-600 transition">Dashboard</a>
          <a href="/tournaments" className="px-6 py-3 rounded-lg border border-indigo-300 hover:border-indigo-600 hover:text-indigo-700 transition">Tournaments</a>
          <a href="/public-tools" className="px-6 py-3 rounded-lg border border-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition">Tools</a>
          <a href="/about" className="px-6 py-3 rounded-lg border border-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition">About</a>
          <a href="/contact" className="px-6 py-3 rounded-lg border border-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition">Contact</a>
        </div>
        <div className="text-sm mt-6 text-zinc-400">
          <span>For clubs, colleges & gaming communities • Built with Next.js, MongoDB, Tailwind</span>
        </div>
      </div>
    </main>
  )
}
