
"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function AddMovie() {
    const [movieTitle, setMovieTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleAddMovie(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const user = auth.currentUser;
        const title = movieTitle.trim();

        if (!user) {
            setMessage("Please sign in first.");
            return;
        }

        if (!title) {
            setMessage("Please enter a movie title.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await addDoc(
                collection(db, "users", user.uid, "watchlist"),
                {
                    title: title,
                    createdAt: serverTimestamp(),
                }
            );

            setMovieTitle("");
            setMessage("Movie added successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-purple-500/20 bg-[#181827] p-6">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Add a Movie
            </h2>

            <p className="mb-4 text-sm text-gray-400">
                Enter a movie you want to track.
            </p>

            <form onSubmit={handleAddMovie} className="flex flex-col gap-3">
                <input
                    type="text"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    placeholder="Enter movie title..."
                    maxLength={150}
                    className="rounded-lg border border-purple-500/30 bg-[#10101c] px-4 py-3 text-white outline-none focus:border-purple-400"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-500 disabled:opacity-50"
                >
                    {loading ? "Adding..." : "+ Add Movie"}
                </button>
            </form>

            {message && (
                <p className="mt-3 text-sm text-purple-300">
                    {message}
                </p>
            )}
        </div>
    );
}