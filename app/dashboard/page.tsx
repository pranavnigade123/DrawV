'use client'
import { useSession, signIn } from 'next-auth/react'

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session)
    return (
      <div>
        <p>You must be signed in to view this page.</p>
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    )
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.email}!</p>
      {/* You can now show protected content here */}
    </div>
  )
}
