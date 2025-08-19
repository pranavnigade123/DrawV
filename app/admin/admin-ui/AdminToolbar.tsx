// app/admin/admin-ui/AdminToolbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type Item = { label: string; href: string }

const links: Item[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Create', href: '/admin/tournaments/create' },
  { label: 'Manage', href: '/admin/tournaments' },
  { label: 'Archived', href: '/admin/tournaments/archived' },
  { label: 'Users', href: '/admin/users' },
]

export default function AdminToolbar({
  title,
  extraRight,
}: {
  title?: string
  extraRight?: React.ReactNode
}) {
  const pathname = usePathname()

  const crumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    const out: { label: string; href: string }[] = []
    let acc = ''
    for (const p of parts) {
      acc += '/' + p
      out.push({
        label:
          p.charAt(0).toUpperCase() +
          p.slice(1).replace(/-/g, ' ').replace(/_/g, ' '),
        href: acc,
      })
    }
    return out
  }, [pathname])

  return (
    <div className="mb-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-zinc-900/40">
      <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
        {/* Left: Logo + breadcrumb + title */}
        <div className="min-w-0 flex items-center gap-3">
          {/* Clickable logo to go back to public site */}
          <Link href="/" aria-label="Go to site">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition flex items-center justify-center text-white text-sm font-bold">
              D
            </div>
          </Link>

          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 truncate">
              {crumbs.map((c, i) => (
                <span key={c.href}>
                  {i > 0 && <span className="mx-1.5 text-zinc-400">›</span>}
                  <Link
                    href={c.href}
                    className={i === crumbs.length - 1 ? 'text-zinc-300 cursor-default pointer-events-none' : 'hover:underline'}
                  >
                    {c.label}
                  </Link>
                </span>
              ))}
            </div>
            {title && (
              <div className="mt-0.5 text-lg font-semibold truncate">
                {title}
              </div>
            )}
          </div>
        </div>

        {/* Right: Site/Admin switches + section links */}
        <div className="flex items-center gap-2">
          {/* Back to public site button */}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Go to site"
          >
            Site
          </Link>

          {/* Back to Admin Dashboard button */}
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Admin dashboard"
          >
            Dashboard
          </Link>

          {/* Section quick links (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            {links.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  'px-3 py-1.5 rounded-lg border text-sm transition',
                  pathname === l.href
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800',
                ].join(' ')}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {extraRight}
        </div>
      </div>
    </div>
  )
}
