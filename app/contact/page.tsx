export default function ContactPage() {
  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">Contact Us</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-300">
        Have questions, suggestions, or need support? Reach out below!
      </p>
      <ul className="mb-4 text-zinc-600 dark:text-zinc-300">
        <li>Email: <a className="text-indigo-600 underline" href="mailto:club@example.com">club@example.com</a></li>
        <li>Discord: <a className="text-indigo-600 underline" href="https://discord.gg/your-server" target="_blank">Join our server</a></li>
      </ul>
      {/* Optionally add a contact form here in the future */}
    </main>
  );
}
