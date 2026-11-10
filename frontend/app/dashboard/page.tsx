
import Link from "next/link";

const stats = [
    {
        title: "Tracked Movies",
        value: "0",
        description: "Movies you're watching",
        icon: "🎬",
    },
    {
        title: "Favourite Theatres",
        value: "0",
        description: "Your selected locations",
        icon: "📍",
    },
    {
        title: "Recent Alerts",
        value: "0",
        description: "Showtime notifications",
        icon: "🔔",
    },
];

export default function Dashboard() {
    return (
        <main className="min-h-screen bg-[#080b14] text-white">
            <nav className="flex items-center justify-between border-b border-white/10 px-8 py-6">
                <Link
                    href="/"
                    className="text-2xl font-bold text-violet-400"
                >
                    CinePass
                </Link>

                <Link
                    href="/"
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Back to Home
                </Link>
            </nav>

            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-12">
                    <p className="mb-3 text-sm font-medium text-violet-400">
                        YOUR MOVIE HUB
                    </p>

                    <h1 className="mb-4 text-4xl font-bold">
                        Your Dashboard
                    </h1>

                    <p className="text-gray-400">
                        Keep track of your favourite movies, theatres,
                        and showtime notifications.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="rounded-2xl border border-white/10 bg-white/5 p-7"
                        >
                            <div className="mb-5 text-3xl">
                                {stat.icon}
                            </div>

                            <p className="text-sm text-gray-400">
                                {stat.title}
                            </p>

                            <h2 className="my-3 text-4xl font-bold">
                                {stat.value}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">
                                My Watchlist
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                Movies you're currently tracking
                            </p>
                        </div>

                        <button
                            disabled
                            className="cursor-not-allowed rounded-xl bg-violet-600/50 px-5 py-3 text-sm font-semibold text-white/70"
                        >
                            + Add Movie (Coming Soon)
                        </button>
                    </div>

                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
                        <div className="mb-4 text-5xl">🎥</div>

                        <h3 className="mb-2 text-lg font-semibold">
                            Your watchlist is empty
                        </h3>

                        <p className="max-w-sm text-sm text-gray-400">
                            Soon you'll be able to add movies and receive
                            notifications when new Cineplex showtimes appear.
                        </p>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                        <div className="mb-4 text-3xl">📍</div>

                        <h2 className="mb-3 text-xl font-bold">
                            My Theatres
                        </h2>

                        <p className="text-sm text-gray-400">
                            Save your favourite Cineplex locations
                            to receive personalized showtime alerts.
                        </p>

                        <p className="mt-6 text-sm text-violet-400">
                            Theatre selection coming soon
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                        <div className="mb-4 text-3xl">🔔</div>

                        <h2 className="mb-3 text-xl font-bold">
                            Notifications
                        </h2>

                        <p className="text-sm text-gray-400">
                            Get notified when new movie showtimes
                            become available at your selected theatres.
                        </p>

                        <p className="mt-6 text-sm text-violet-400">
                            Notification settings coming soon
                        </p>
                    </div>
                </section>

                <footer className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    CinePass — Never miss a movie drop.
                </footer>
            </div>
        </main>
    );
}