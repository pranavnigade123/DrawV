'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if ("success" in data) {
      setSuccess(true)
      setTimeout(() => router.push('/login?registered=1'), 1200)
    } else if ("error" in data) {
      setError(data.error)
    } else {
      setError("Registration failed, please try again.")
    }
  }

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-[350px] rounded-2xl shadow bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Create your account</h1>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.name}
              autoFocus
              autoComplete="off"
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.email}
              autoComplete="off"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
              <button type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-2 px-1 text-xs text-zinc-400 hover:text-indigo-600 transition"
                onClick={() => setShowPassword(v => !v)}
              >{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          <button
            className="w-full py-2 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div>
          {success && <p className="text-green-600 text-center mt-2">Registered! Redirecting…</p>}
          {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        </div>
        <div className="text-sm text-center text-zinc-500">
          Already have an account? <Link href="/login" className="underline hover:text-indigo-600">
  Sign in
</Link>
        </div>
      </div>
    </main>
  )
}
