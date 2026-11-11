
"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";

import {
    collection,
    getDocs,
    query as firestoreQuery,
    where,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

type Movie = {
    id: number;
    title: string;
    overview: string;
    releaseDate: string;
    posterUrl: string | null;
};

export default function MovieSearch() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const searchTerm = query.trim();

        if (!searchTerm) {
            setMovies([]);
            setMessage("Please enter a movie title.");
            return;
        }

        setLoading(true);
        setMovies([]);
        setMessage("");

        try {
            const response = await fetch(
                `/api/movies?query=${encodeURIComponent(searchTerm)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Search failed.");
            }

            setMovies(data.movies);
            if (data.movies.length === 0) {
                setMessage("No movies found. Try another title.");
            }
        } catch (error) {
            console.error("Movie search failed:", error);
            setMessage("Unable to search movies. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddMovie(movie: Movie) {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please sign in first.");
            return;
        }

        setAddingId(movie.id);
        setMessage("");

        try {
            const watchlistRef = collection(
                db,
                "users",
                user.uid,
                "watchlist"
            );


            const existingMovieQuery = firestoreQuery(
                watchlistRef,
                where("tmdbId", "==", movie.id)
            );

            const existingMovies = await getDocs(existingMovieQuery);

            if (!existingMovies.empty) {
                setMessage(`${movie.title} is already in your watchlist!`);
                return;
            }

            await addDoc(
                collection(db, "users", user.uid, "watchlist"),
                {
                    tmdbId: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    releaseDate: movie.releaseDate,
                    posterUrl: movie.posterUrl,
                    createdAt: serverTimestamp(),
                }
            );

            setMessage(`${movie.title} added to your watchlist!`);
        } catch (error) {
            console.error("Failed to add movie:", error);
            setMessage("Unable to save movie. Please try again.");
        } finally {
            setAddingId(null);
        }
    }

    return (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-2 text-2xl font-bold text-white">
                Discover Movies
            </h2>

            <p className="mb-6 text-sm text-gray-400">
                Search for movies and add them to your CinePass watchlist.
            </p>

            <form
                onSubmit={handleSearch}
                className="mb-6 flex flex-col gap-3 sm:flex-row"
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a movie..."
                    maxLength={150}
                    className="flex-1 rounded-xl border border-violet-500/30 bg-[#10101c] px-4 py-3 text-white outline-none focus:border-violet-400"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {message && (
                <p className="mb-5 text-sm text-violet-300" role="status">
                    {message}
                </p>
            )}

            <div className="space-y-4">
                {movies.map((movie) => (
                    <div
                        key={movie.id}
                        className="flex flex-col gap-5 rounded-xl border border-violet-500/20 bg-[#181827] p-5 sm:flex-row"
                    >
                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={`${movie.title} poster`}
                                className="h-48 w-32 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="flex h-48 w-32 items-center justify-center rounded-lg bg-white/10 text-gray-400">
                                No Poster
                            </div>
                        )}

                        <div className="flex-1">
                            <h3 className="mb-2 text-xl font-bold text-white">
                                {movie.title}
                            </h3>

                            <p className="mb-3 text-sm text-violet-300">
                                {movie.releaseDate
                                    ? `Release Date: ${movie.releaseDate}`
                                    : "Release date unavailable"}
                            </p>

                            <p className="mb-5 text-sm leading-relaxed text-gray-400">
                                {movie.overview || "No description available."}
                            </p>

                            <button
                                onClick={() => handleAddMovie(movie)}
                                disabled={addingId !== null}
                                className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                            >
                                {addingId === movie.id
                                    ? "Adding..."
                                    : "+ Add to Watchlist"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-6 text-xs text-gray-500">
                Movie information provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
        </section>
    );
}