'use client'
import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    setError('Server returned an invalid response.')
    return
  }
  if (res.ok) setSuccess(true)
  else setError(data.error || 'Registration failed')
}


  return (
    <main style={{maxWidth: 400, margin: '0 auto', padding: 24}}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        /><br/>
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        /><br/>
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        /><br/>
        <button type="submit">Sign Up</button>
      </form>
      {success && <p style={{color: 'green'}}>Registered! Please log in.</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </main>
  )
}
