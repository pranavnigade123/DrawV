export default function LandingPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)] px-4">
      <div className="
        w-full max-w-2xl rounded-2xl shadow
        bg-[color:var(--surface)]
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

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          {/* Filled primary CTA */}
          <a
            href="/register"
            className="
              px-6 py-3 rounded-[var(--border-radius)]
              bg-[color:var(--primary)] text-white font-semibold 
              hover:bg-[color:var(--primary-hover)]
              shadow transition
            "
          >
            Get Started
          </a>
          {/* Filled secondary */}
          <a
            href="/dashboard"
            className="
              px-6 py-3 rounded-[var(--border-radius)]
              bg-[color:var(--secondary)] text-white font-semibold
              hover:bg-[color:var(--secondary-hover)]
              shadow transition
            "
          >
            Dashboard
          </a>
          {/* Ghost/outline primary button */}
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
          >
            Tournaments
          </a>
          {/* Ghost/outline secondary button */}
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
          >
            Tools
          </a>
          {/* Muted outline for lesser nav */}
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
          >
            About
          </a>
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
          >
            Contact
          </a>
        </div>

        <div className="text-sm mt-6" style={{ color: "var(--muted)" }}>
          <span>
            For clubs, colleges &amp; gaming communities • Built with Next.js, MongoDB, Tailwind
          </span>
        </div>
      </div>
    </main>
  )
}
