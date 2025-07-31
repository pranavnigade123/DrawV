'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const getDashboardLink = () => '/';

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav
      className="
        fixed top-6 left-1/2 transform -translate-x-1/2
        w-[95vw] max-w-6xl
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
        fontFamily: 'var(--font-geist-sans), var(--font-sans), Arial, Helvetica, sans-serif',
      }}
    >
      {/* Logo */}
      <div className="flex items-center pr-3">
        <Link href="/" className="select-none flex items-center" onClick={closeMenu}>
          {mounted && (
            <Image
              src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
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
        <Link
          href="/tournaments"
          className="px-3 py-1 rounded-lg hover:bg-[color:var(--background)]/60 transition"
        >
          Explore
        </Link>
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

      {/* Auth/profile - Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        {status === 'authenticated' && session?.user?.name && (
          <Link
            href={getDashboardLink()}
            className={`
              hidden sm:inline font-semibold mr-1 px-2
              ${resolvedTheme === 'dark' ? 'text-white' : 'text-[color:var(--primary)]'}
              cursor-pointer
            `}
            aria-label="Go to your dashboard"
          >
            {session.user.name.split(' ')[0]}
          </Link>
        )}

        {status === 'authenticated' ? (
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

        {/* Theme toggle - commented out for now */}
        {/*
        {mounted && (
          <button
            className="
              ml-1 px-2 py-1 rounded-full border
              border-[color:var(--border)] bg-[color:var(--surface)]
              hover:bg-[color:var(--primary)] hover:text-white
              transition
              dark:border-white/30
              dark:bg-transparent
              dark:text-white
              dark:hover:bg-white/10
            "
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ minWidth: 32 }}
          >
            {resolvedTheme === 'dark' ? '🌞' : '🌙'}
          </button>
        )}
        */}
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
          <Link href="/tournaments" className="py-2" onClick={closeMenu}>Explore</Link>
          <Link href="/public-tools" className="py-2" onClick={closeMenu}>Tools</Link>
          <Link href="/about" className="py-2" onClick={closeMenu}>About Us</Link>

          {status === 'authenticated' && session?.user?.name && (
            <Link href={getDashboardLink()} className="py-2" onClick={closeMenu}>
               ({session.user.name.split(' ')[0]})
            </Link>
          )}
          {status === 'authenticated' ? (
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' })
                closeMenu()
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/30"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-[color:var(--primary)] text-white"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}

          {/* Theme toggle - commented out for now */}
          {/*
          {mounted && (
            <button
              className="mt-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/30"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          )}
          */}
        </div>
      )}
    </nav>
  )
}
