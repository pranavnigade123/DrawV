'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const { resolvedTheme } = useTheme()

  const [mounted, setMounted] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isExploreOpen, setIsExploreOpen] = useState<boolean>(false)

  const exploreRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const isAuthed = status === 'authenticated'
  const isAdmin = isAuthed && (session as any)?.user?.role === 'admin'

  return (
    <nav
      className="
        fixed top-6 left-1/2 -translate-x-1/2
        w-[95vw] max-w-4xl
        flex items-center justify-between
        px-6 py-3
        backdrop-blur-2xl
        shadow-xl
        border border-white/15 dark:border-white/10
        rounded-2xl
        font-sans
        z-50
        transition-all
      "
      style={{
        fontFamily:
          'var(--font-geist-sans), var(--font-sans), Arial, Helvetica, sans-serif',
      }}
    >
      {/* Logo links to site */}
      <div className="flex items-center pr-3">
        <Link href="/" className="select-none flex items-center" onClick={closeMenu}>
          {mounted && (
            <Image
              src={resolvedTheme === 'dark' ? '/DVDark_bg.png' : '/logo-light.png'}
              alt="Draw V Logo"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          )}
        </Link>
      </div>

      {/* Main nav links - Desktop */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4 text-base font-medium">
        <div className="relative" ref={exploreRef}>
          <button
            onClick={() => setIsExploreOpen(!isExploreOpen)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-[color:var(--background)]/60 transition"
          >
            Explore
            {!isExploreOpen && <ChevronDown size={16} />}
          </button>

{isExploreOpen && (
  <div
    className="
      absolute top-full mt-2 w-48
      bg-neutral-900
      border border-white/20
      shadow-lg rounded-lg
      flex flex-col
      animate-slide-down
    "
  >
    <Link
      href="/tournaments"
      className="px-4 py-2 text-left hover:bg-neutral-800 rounded-t-lg"
      onClick={() => setIsExploreOpen(false)}
    >
      Tournaments
    </Link>
    <Link
      href="/gamedev"
      className="px-4 py-2 text-left hover:bg-neutral-800"
      onClick={() => setIsExploreOpen(false)}
    >
      Game Dev
    </Link>
    <Link
      href="/events"
      className="px-4 py-2 text-left hover:bg-neutral-800 rounded-b-lg"
      onClick={() => setIsExploreOpen(false)}
    >
      Events
    </Link>
  </div>
)}

        </div>
        <Link
          href="/public-tools"
          className="px-3 py-1 rounded-lg hover:bg-[color:var(--background)]/60 transition"
        >
          Tools
        </Link>
        <Link
          href="/about"
          className="px-3 py-1 rounded-lg hover:bg-[color:var(--background)]/60 transition"
        >
          About Us
        </Link>
      </div>

      {/* Auth/profile - Desktop (no name) */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Admin switch for admins */}
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="
              hidden sm:inline px-3 py-1 rounded-lg
              border border-[color:var(--primary)]/60
              text-sm
              hover:bg-[color:var(--background)]/60
              transition
            "
            aria-label="Open admin"
          >
            Admin
          </Link>
        )}

        {/* User dashboard for authenticated non-admins */}
        {isAuthed && !isAdmin && (
          <Link
            href="/dashboard"
            className="
              hidden sm:inline px-3 py-1 rounded-lg
              border border-[color:var(--primary)]/40
              text-sm
              hover:bg-[color:var(--background)]/60
              transition
            "
            aria-label="Open dashboard"
          >
            Dashboard
          </Link>
        )}

        {isAuthed ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="
              px-4 py-1 rounded-lg
              border border-[color:var(--primary)]
              bg-transparent
              text-black
              font-semibold
              transition
              hover:bg-[color:var(--primary)]/10
              hover:text-[color:var(--primary-hover)]
              dark:text-white dark:border-white/30
              dark:hover:bg-white/10 dark:hover:text-white
              shadow-sm
            "
            style={{ minWidth: 90 }}
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="
              px-4 py-1 rounded-lg
              bg-[color:var(--primary)]
              text-white font-semibold
              shadow-sm
              hover:bg-[color:var(--primary-hover)]
              transition
            "
          >
            Login
          </Link>
        )}
      </div>

      {/* Hamburger - Mobile only */}
      <button
        className="sm:hidden flex items-center justify-center p-2 rounded-lg border border-gray-300 dark:border-white/30"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div
          className="
            absolute top-full left-0 w-full mt-3
            bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/20
            shadow-lg rounded-lg
            flex flex-col gap-3 px-6 py-4
            sm:hidden
            animate-slide-down
          "
        >
          <Link href="/tournaments" className="py-2" onClick={closeMenu}>
            Tournaments
          </Link>
          <Link href="/gamedev" className="py-2" onClick={closeMenu}>
            Game Dev
          </Link>
          <Link href="/events" className="py-2" onClick={closeMenu}>
            Events
          </Link>

          <Link href="/public-tools" className="py-2" onClick={closeMenu}>
            Tools
          </Link>
          <Link href="/about" className="py-2" onClick={closeMenu}>
            About Us
          </Link>

          {/* Mobile: show the right dashboard link */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="py-2 font-semibold"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          )}
          {isAuthed && !isAdmin && (
            <Link
              href="/dashboard"
              className="py-2 font-semibold"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          )}

          {isAuthed ? (
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' })
                closeMenu()
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/30 text-left"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-[color:var(--primary)] text-white text-center"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}