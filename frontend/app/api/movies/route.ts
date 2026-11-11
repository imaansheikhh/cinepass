
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim();

    if (!query) {
        return NextResponse.json(
            { error: "Please enter a movie title." },
            { status: 400 }
        );
    }

    if (query.length > 150) {
        return NextResponse.json(
            { error: "Search is too long." },
            { status: 400 }
        );
    }

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Movie search is not configured." },
            { status: 500 }
        );
    }

    try {
        const url = new URL(
            "https://api.themoviedb.org/3/search/movie"
        );

        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("query", query);
        url.searchParams.set("include_adult", "false");
        url.searchParams.set("language", "en-US");

        const response = await fetch(url.toString(), {
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("TMDB request failed:", response.status);

            return NextResponse.json(
                { error: "Unable to search for movies." },
                { status: 502 }
            );
        }

        const data = await response.json();

        const movies = (data.results ?? [])
            .filter(
                (movie: { adult?: boolean }) =>
                    movie.adult !== true
            )
            .slice(0, 10)
            .map(
                (movie: {
                    id: number;
                    title: string;
                    overview: string;
                    release_date: string;
                    poster_path: string | null;
                }) => ({
                    id: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    releaseDate: movie.release_date,
                    posterUrl: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null,
                })
            );

        return NextResponse.json({ movies });
    } catch (error) {
        console.error("Movie search error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}