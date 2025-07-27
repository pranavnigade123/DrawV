'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthStatus() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  if (!session) return <button onClick={() => signIn()}>Sign In</button>
  return (
    <span>
      {session.user?.email}{' '}
      <button onClick={() => signOut()}>Sign Out</button>
    </span>
  )
}
