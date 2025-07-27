export default function UnauthorizedPage() {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h1>
      <p>You must be an admin to view this page.</p>
      <a href="/" className="mt-4 text-blue-600 underline">Go Home</a>
    </main>
  )
}
