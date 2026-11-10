
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <h1 className="text-2xl font-bold text-violet-400">
          CinePass
        </h1>

        <Link
          href="/dashboard"
          className="rounded-lg bg-violet-600 px-5 py-2 hover:bg-violet-500"
        >
          Dashboard
        </Link>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-32 text-center">
        <p className="mb-6 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          Your personal movie alert system
        </p>

        <h2 className="mb-6 text-5xl font-bold md:text-7xl">
          Never miss a
          <span className="text-violet-400"> movie drop.</span>
        </h2>

        <p className="mb-10 max-w-xl text-lg text-gray-400">
          Track your favourite movies and theatres.
          Get notified when new showtimes become available.
          No more constantly checking for tickets.
        </p>

        <Link
          href="/dashboard"
          className="rounded-xl bg-violet-600 px-8 py-4 font-semibold hover:bg-violet-500"
        >
          Get Started
        </Link>

        <p className="mt-6 text-sm text-gray-500">
          Movie tracking and alerts coming soon.
        </p>
      </section>

      <footer className="border-t border-white/10 px-8 py-6 text-center text-sm text-gray-500">
        CinePass — Your movie tracking companion.
      </footer>
    </main>
  );
}