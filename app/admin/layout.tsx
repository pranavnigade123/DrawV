// app/admin/layout.tsx
'use client'

import type { ReactNode } from 'react'

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  )
}
