
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    onAuthStateChanged,
    signOut,
    type User,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

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
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                setUser(null);
                router.replace("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    async function handleLogout() {
        setSigningOut(true);

        try {
            await signOut(auth);
            router.replace("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            setSigningOut(false);
            alert("Unable to sign out. Please try again.");
        }
    }

    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080b14] text-white">
                <p className="text-lg text-violet-400">
                    Loading your CinePass dashboard...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#080b14] text-white">
            <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
                <Link
                    href="/"
                    className="text-2xl font-bold text-violet-400"
                >
                    CinePass
                </Link>

                <div className="flex flex-wrap items-center gap-5">
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <button
                        onClick={handleLogout}
                        disabled={signingOut}
                        className="rounded-xl border border-violet-500/40 px-5 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-600 hover:text-white disabled:opacity-50"
                    >
                        {signingOut ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <p className="mb-3 text-sm font-medium text-violet-400">
                            YOUR MOVIE HUB
                        </p>

                        <h1 className="mb-4 text-4xl font-bold">
                            Welcome, {user.displayName?.split(" ")[0] || "Movie Lover"}!
                        </h1>

                        <p className="text-gray-400">
                            Keep track of your favourite movies, theatres,
                            and showtime notifications.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Google profile"
                                referrerPolicy="no-referrer"
                                className="h-12 w-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-bold">
                                {user.displayName?.charAt(0) || "U"}
                            </div>
                        )}

                        <div>
                            <p className="font-semibold">
                                {user.displayName || "CinePass User"}
                            </p>

                            <p className="text-sm text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
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