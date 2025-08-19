// app/admin/admin-ui/ShowNavbar.tsx
'use client'

import { usePathname } from 'next/navigation'

export default function ShowNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null
  return <>{children}</>
}
