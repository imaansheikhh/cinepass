
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "CinePass Showtime API is working!",
        showtimes: [],
    });
}