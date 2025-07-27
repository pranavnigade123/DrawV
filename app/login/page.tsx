'use client'
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // Show message if redirected after registration
  useEffect(() => {
    if (params.get("registered")) {
      setSuccessMsg("Registration successful! Please sign in.")
    }
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Invalid credentials. Please try again.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-[350px] rounded-2xl shadow bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in to DRAW V</h1>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={email}
              autoComplete="off"
              onChange={e => setEmail(e.target.value)}
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {successMsg && <p className="text-green-600 text-center mt-2">{successMsg}</p>}
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        <div className="text-sm text-center text-zinc-500 pt-2">
          Don&apos;t have an account? <a className="underline hover:text-indigo-600" href="/register">Register</a>
        </div>
      </div>
    </main>
  )
}
