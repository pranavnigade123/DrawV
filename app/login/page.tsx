'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FaGithub } from "react-icons/fa"
import { Suspense } from "react"
import SearchParamsMessage from "./SearchParamsMessage"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("Invalid credentials. Please try again.")
    } else {
      router.push("/")
    }
  }

 function handleSocialSignIn(provider: "google" | "github") {
  signIn(provider, { callbackUrl: "/" })
}

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 mt-20">
      <div className="w-full max-w-[350px] rounded-2xl shadow bg-black/80 border border-zinc-800 p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in to DRAW V</h1>

        <form className="space-y-4 mb-3" onSubmit={handleSubmit} autoComplete="off">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-2 px-1 text-xs text-zinc-400 hover:text-indigo-600 transition"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="w-full py-2 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-3">
          <div className="flex-grow border-t border-zinc-700" />
          <span className="text-xs px-3 text-zinc-400">OR</span>
          <div className="flex-grow border-t border-zinc-700" />
        </div>

        {/* Social login */}
        <div className="mb-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleSocialSignIn("google")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-zinc-700 bg-zinc-950 hover:bg-indigo-950 font-semibold shadow text-zinc-100 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.4H272.1v95.3h146.9c-6.4 34.6-25.2 63.9-53.8 83.5v69.3h86.8c50.9-46.9 81.5-116 81.5-197.7z"/>
              <path fill="#34A853" d="M272.1 544.3c72.8 0 133.7-24.1 178.2-65.5l-86.8-69.3c-24.1 16.2-55 25.7-91.4 25.7-70.3 0-129.9-47.5-151.2-111.3H30.4v69.9c44.6 88 136.3 150.5 241.7 150.5z"/>
              <path fill="#FBBC04" d="M120.9 324c-10.2-30.2-10.2-62.6 0-92.8v-69.9H30.4c-44.6 88-44.6 194.6 0 282.6l90.5-69.9z"/>
              <path fill="#EA4335" d="M272.1 107.6c39.6-.6 77.8 13.6 107.1 39.9l80.1-80.1C399.4 24.6 339.3.4 272.1 0 166.7 0 75 62.5 30.4 150.5l90.5 69.9c21.2-63.8 80.9-111.3 151.2-112.8z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn("github")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 font-semibold shadow text-zinc-100 transition"
          >
            <FaGithub className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        {/* Suspense-wrapped success message */}
        <Suspense fallback={<p className="text-center text-zinc-500">Loading...</p>}>
          <SearchParamsMessage />
        </Suspense>

        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        <div className="text-sm text-center text-zinc-500 pt-2">
          Don&apos;t have an account? <a className="underline hover:text-indigo-600" href="/register">Register</a>
        </div>
      </div>
    </main>
  )
}
