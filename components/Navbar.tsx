'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <nav
      className="
        flex items-center justify-between px-4 py-2 border-b border-[color:var(--border)]
        bg-[color:var(--background)] text-[color:var(--foreground)]
        font-sans
        sticky top-0 z-30
      "
      style={{ fontFamily: "var(--font-geist-sans), var(--font-sans), Arial, Helvetica, sans-serif" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "var(--primary)" }}>
          MyApp
        </Link>

        {/* Role-based dashboards */}
        {session?.user?.role === "player" && (
          <Link href="/dashboard" className="hover:text-[color:var(--primary)] transition">
            Player Dashboard
          </Link>
        )}
        {session?.user?.role === "admin" && (
          <Link href="/admin/dashboard" className="hover:text-[color:var(--primary)] transition">
            Admin Dashboard
          </Link>
        )}

        {/* Admin-only links */}
        {session?.user?.role === "admin" && (
          <>
            <Link href="/admin/tournaments" className="hover:text-[color:var(--primary)] transition">
              Manage Tournaments
            </Link>
            
          </>
        )}

        {/* Player-only links */}
        {session?.user?.role === "player" && (
          <Link href="/tournaments" className="hover:text-[color:var(--primary)] transition">
            Browse Tournaments
          </Link>
        )}

        {/* Public informational pages */}
        <Link href="/public-tools" className="hover:text-[color:var(--primary)] transition">
          Tools
        </Link>
        <Link href="/about" className="hover:text-[color:var(--primary)] transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-[color:var(--primary)] transition">
          Contact
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {status === "authenticated" ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="
              ml-4 px-3 py-1 rounded
              bg-[color:var(--surface)] text-[color:var(--foreground)]
              hover:bg-[color:var(--primary)] hover:text-white
              border border-[color:var(--border)]
              text-sm transition
            "
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="
              ml-4 px-3 py-1 rounded
              bg-[color:var(--primary)] text-white
              hover:bg-[color:var(--primary-hover)]
              text-sm font-semibold transition
            "
          >
            Login
          </Link>
        )}
        {/* ==== Theme Toggle Button ==== */}
        {mounted && (
          <button
            className="ml-2 px-2 py-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--accent)] transition"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === 'dark'
              ? <span role="img" aria-label="Light mode">🌞</span>
              : <span role="img" aria-label="Dark mode">🌙</span>
            }
          </button>
        )}
      </div>
    </nav>
  )
}
