
"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Theatre = {
    id: string;
    name: string;
    city: string;
};

type SavedTheatre = Theatre & {
    firestoreId: string;
};

const theatres: Theatre[] = [
    { id: "yonge-dundas", name: "Cineplex Cinemas Yonge-Dundas", city: "Toronto" },
    { id: "scotiabank-toronto", name: "Scotiabank Theatre Toronto", city: "Toronto" },
    { id: "varsity", name: "Cineplex Cinemas Varsity and VIP", city: "Toronto" },
    { id: "queensway", name: "Cineplex Cinemas Queensway and VIP", city: "Etobicoke" },
    { id: "eglinton", name: "Cineplex Cinemas Eglinton Town Centre", city: "Scarborough" },
    { id: "fairview", name: "Cineplex Cinemas Fairview Mall", city: "Toronto" },
    { id: "yorkdale", name: "Cineplex Cinemas Yorkdale", city: "Toronto" },
    { id: "square-one", name: "Cineplex Cinemas Square One", city: "Mississauga" },
    { id: "winston-churchill", name: "Cineplex Cinemas Winston Churchill and VIP", city: "Oakville" },
    { id: "courtneypark", name: "Cineplex Cinemas Courtney Park", city: "Mississauga" },
    { id: "brampton", name: "Cineplex Cinemas Orion Gate", city: "Brampton" },
    { id: "vaughan", name: "Cineplex Cinemas Vaughan", city: "Vaughan" },
    { id: "richmond-hill", name: "SilverCity Richmond Hill Cinemas", city: "Richmond Hill" },
    { id: "markham", name: "Cineplex Cinemas Markham and VIP", city: "Markham" },
];

export default function FavouriteTheatres({ user }: { user: User }) {
    const [search, setSearch] = useState("");
    const [savedTheatres, setSavedTheatres] = useState<SavedTheatre[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        const theatresRef = collection(db, "users", user.uid, "theatres");

        const unsubscribe = onSnapshot(
            theatresRef,
            (snapshot) => {
                const saved = snapshot.docs.map((item) => ({
                    ...(item.data() as Theatre),
                    firestoreId: item.id,
                }));

                setSavedTheatres(saved);
                setLoading(false);
            },
            (error) => {
                console.error(error);
                setMessage("Could not load your theatres.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user.uid]);

    async function addTheatre(theatre: Theatre) {
        if (busyId) return;

        setBusyId(theatre.id);
        setMessage("");

        try {
            const theatresRef = collection(db, "users", user.uid, "theatres");

            const existing = await getDocs(
                query(theatresRef, where("id", "==", theatre.id))
            );

            if (!existing.empty) {
                setMessage("This theatre is already in your favourites.");
                return;
            }

            await addDoc(theatresRef, theatre);
            setMessage(`${theatre.name} added!`);
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setBusyId(null);
        }
    }

    async function removeTheatre(theatre: SavedTheatre) {
        if (busyId) return;

        setBusyId(theatre.id);
        setMessage("");

        try {
            await deleteDoc(
                doc(db, "users", user.uid, "theatres", theatre.firestoreId)
            );
            setMessage(`${theatre.name} removed.`);
        } catch (error) {
            console.error(error);
            setMessage("Could not remove theatre.");
        } finally {
            setBusyId(null);
        }
    }

    const filteredTheatres = theatres.filter((theatre) =>
        `${theatre.name} ${theatre.city}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-xl font-semibold text-white">
                    My Favourite Theatres
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                    Choose Cineplex locations you want to track.
                </p>
            </div>

            <div>
                <h4 className="mb-3 font-medium text-purple-300">
                    Saved Theatres ({savedTheatres.length})
                </h4>

                {loading ? (
                    <p className="text-sm text-gray-400">Loading theatres...</p>
                ) : savedTheatres.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        You haven't saved any theatres yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {savedTheatres.map((theatre) => (
                            <div
                                key={theatre.firestoreId}
                                className="flex items-center justify-between gap-3 rounded-xl border border-purple-800 bg-purple-950/30 p-3"
                            >
                                <div>
                                    <p className="font-medium text-white">{theatre.name}</p>
                                    <p className="text-sm text-gray-400">{theatre.city}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeTheatre(theatre)}
                                    disabled={busyId !== null}
                                    className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300 hover:bg-red-900/70 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h4 className="mb-3 font-medium text-purple-300">
                    Find a Cineplex Theatre
                </h4>

                <input
                    type="text"
                    placeholder="Search by theatre name or city..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="mb-3 w-full rounded-xl border border-purple-800 bg-gray-950 p-3 text-white outline-none focus:border-purple-400"
                />

                <div className="max-h-80 space-y-2 overflow-y-auto">
                    {filteredTheatres.map((theatre) => {
                        const isSaved = savedTheatres.some(
                            (saved) => saved.id === theatre.id
                        );

                        return (
                            <div
                                key={theatre.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3"
                            >
                                <div>
                                    <p className="font-medium text-white">{theatre.name}</p>
                                    <p className="text-sm text-gray-400">{theatre.city}</p>
                                </div>

                                <button
                                    type="button"
                                    disabled={isSaved || busyId !== null || loading}
                                    onClick={() => addTheatre(theatre)}
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-700"
                                >
                                    {isSaved ? "Added ✓" : "Add"}
                                </button>
                            </div>
                        );
                    })}

                    {filteredTheatres.length === 0 && (
                        <p className="text-sm text-gray-400">
                            No matching theatres found.
                        </p>
                    )}
                </div>
            </div>

            {message && (
                <p role="status" className="text-sm text-purple-300">
                    {message}
                </p>
            )}
        </div>
    );
}