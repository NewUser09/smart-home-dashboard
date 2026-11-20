import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            "http://127.0.0.1:3001/api/sensors/latest",
            { cache: "no-store"}
        );

        if (!response.ok) {
            throw new Error("Backend API unailable");
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "Cannot connect to backend" },
            { status: 503 }
        );
    }
}