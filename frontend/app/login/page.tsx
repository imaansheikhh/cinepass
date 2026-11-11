
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleGoogleLogin() {
        setLoading(true);
        setError("");

        try {
            const provider = new GoogleAuthProvider();

            await signInWithPopup(auth, provider);

            router.push("/dashboard");
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                err !== null &&
                "code" in err &&
                err.code === "auth/popup-closed-by-user"
            ) {
                setError("Sign-in was cancelled.");
            } else {
                setError("Unable to sign in. Please try again.");
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#080b14] px-6 text-white">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <Link
                    href="/"
                    className="mb-8 inline-block text-3xl font-bold text-violet-400"
                >
                    CinePass
                </Link>

                <h1 className="mb-3 text-3xl font-bold">
                    Welcome to CinePass
                </h1>

                <p className="mb-8 text-gray-400">
                    Sign in to track your favourite movies and
                    receive showtime alerts.
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-gray-900 transition hover:bg-gray-200 disabled:opacity-50"
                >
                    <span className="text-xl font-bold">G</span>
                    {loading ? "Signing in..." : "Continue with Google"}
                </button>

                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <p className="mt-8 text-sm text-gray-500">
                    Your personal movie tracking companion.
                </p>
            </div>
        </main>
    );
}