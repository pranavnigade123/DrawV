export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">About DRAW V</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-300">
        <b>DRAW V</b> is a modern esports tournament management platform built for students, clubs, and gaming communities. Our mission is to make hosting and joining competitive events smooth, scalable, and fun.
      </p>
      <ul className="list-disc list-inside mb-4 text-zinc-700 dark:text-zinc-300">
        <li>Create and manage tournaments for any game or format.</li>
        <li>Real-time brackets, match scheduling, and live updates.</li>
        <li>Free tools for guests, players, and admins.</li>
        <li>Cloud-powered, mobile-friendly, and privacy-respecting.</li>
      </ul>
      <p className="text-zinc-500 text-sm mt-8">Made with <span className="text-indigo-600">Next.js & Tailwind CSS</span> by your college club.</p>
    </main>
  );
}
