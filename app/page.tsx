export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* HERO SECTION */}
      <section className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="
          w-full max-w-2xl rounded-2xl shadow
          bg-[color:var(--surface)] bg-opacity-90
          border border-[color:var(--border)]
          p-8 text-center space-y-6
          transition-colors
        ">
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: "var(--primary)" }}>
            Welcome to DRAW V
          </h1>
          <p className="text-lg" style={{ color: "var(--gray)" }}>
            The all-in-one esports tournament management platform.
          </p>
          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <a
              href="/register"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                bg-[color:var(--primary)] text-white font-semibold 
                hover:bg-[color:var(--primary-hover)]
                shadow transition
              "
            >Get Started</a>
            <a
              href="/dashboard"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                bg-[color:var(--secondary)] text-white font-semibold
                hover:bg-[color:var(--secondary-hover)]
                shadow transition
              "
            >Dashboard</a>
            <a
              href="/tournaments"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                border-2 border-[color:var(--primary)]
                text-[color:var(--primary)] font-semibold
                bg-transparent
                hover:bg-[color:var(--primary)] hover:text-white
                transition
              "
            >Tournaments</a>
            <a
              href="/tools"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                border-2 border-[color:var(--secondary)]
                text-[color:var(--secondary)] font-semibold
                bg-transparent
                hover:bg-[color:var(--secondary)] hover:text-white
                transition
              "
            >Tools</a>
            <a
              href="/about"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                border border-[color:var(--border)]
                text-[color:var(--gray)] font-semibold
                bg-transparent
                hover:border-[color:var(--secondary)] hover:text-[color:var(--secondary)]
                transition
              "
            >About</a>
            <a
              href="/contact"
              className="
                px-6 py-3 rounded-[var(--border-radius)]
                border border-[color:var(--border)]
                text-[color:var(--gray)] font-semibold
                bg-transparent
                hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]
                transition
              "
            >Contact</a>
          </div>
          <div className="text-sm mt-6" style={{ color: "var(--muted)" }}>
            For clubs, colleges & gaming communities • Built with Next.js, MongoDB, Tailwind
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="rounded-xl bg-[color:var(--surface)]/90 shadow-md border border-[color:var(--border)] p-6 text-center space-y-2">
            <div className="text-[color:var(--primary)] text-3xl font-bold">🏆</div>
            <h3 className="font-semibold text-lg">Easy Bracket Management</h3>
            <p className="text-[color:var(--gray)] text-sm">Create, schedule, and visualize tournaments with a single click—no spreadsheets needed.</p>
          </div>
          <div className="rounded-xl bg-[color:var(--surface)]/90 shadow-md border border-[color:var(--border)] p-6 text-center space-y-2">
            <div className="text-[color:var(--secondary)] text-3xl font-bold">⚡</div>
            <h3 className="font-semibold text-lg">Lightning-fast Registration</h3>
            <p className="text-[color:var(--gray)] text-sm">Players join tournaments with one tap—no messy forms, full mobile support.</p>
          </div>
          <div className="rounded-xl bg-[color:var(--surface)]/90 shadow-md border border-[color:var(--border)] p-6 text-center space-y-2">
            <div className="text-[color:var(--primary)] text-3xl font-bold">📈</div>
            <h3 className="font-semibold text-lg">Live Standings</h3>
            <p className="text-[color:var(--gray)] text-sm">Automatic scoring, instant rankings, and transparent match records for all players and admins.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / STEPS SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--primary)" }}>
              How It Works
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl select-none">🎮</span>
                <span>
                  <span className="font-bold text-[color:var(--secondary)]">Sign Up:</span> Anyone can create a club, team, or join as a player!
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl select-none">🖥️</span>
                <span>
                  <span className="font-bold text-[color:var(--secondary)]">Host or Join:</span> Run your own event, or browse and join open tournaments.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl select-none">🚀</span>
                <span>
                  <span className="font-bold text-[color:var(--secondary)]">Compete & Win:</span> Play in exciting brackets, get auto-updated results, and climb the leaderboard!
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            {/* Optional: Replace below with an image, animation, or badge */}
            <div className="rounded-2xl bg-[color:var(--primary)]/10 border border-[color:var(--primary)] p-10 flex items-center justify-center">
              <span className="text-6xl select-none">🎯</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY CTA SECTION */}
      <section className="py-20 bg-[color:var(--primary)]/5 px-4">
        <div className="max-w-2xl mx-auto rounded-2xl bg-[color:var(--surface)] shadow border border-[color:var(--primary)] p-10 text-center space-y-4">
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: "var(--primary)" }}>
            For Clubs, Colleges, and Gaming Communities
          </h2>
          <p className="text-md text-[color:var(--gray)]">
            Unlock tournament tools crafted for real-world campus and gaming org needs.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 rounded-[var(--border-radius)] bg-[color:var(--secondary)] text-white font-semibold hover:bg-[color:var(--secondary-hover)] shadow transition mt-4"
          >
            Contact the Team &rarr;
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-12 pb-8 text-center text-xs text-[color:var(--muted)]">
        &copy; {new Date().getFullYear()} DRAW V — All rights reserved.
      </footer>
    </main>
  )
}
