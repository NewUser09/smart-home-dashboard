import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const limit = request.nextUrl.searchParams.get("limit") ?? "20";

        const response = await fetch(
            `http://127.0.0.1:3001/api/sensors?limit=${encodeURIComponent(limit)}`,
            { cache: "no-store" }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch {
        return NextResponse.json(
            { error: "Cannot connect to backend" },
            { status: 503 }
        );
    }
}