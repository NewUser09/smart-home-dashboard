"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Sensor {
    id: string;
    temperature: number;
    humidity: number;
    brightness: number;
    recorded_at: string;
}

export default function Home() {
    const [latest, setLatest] = useState<Sensor | null>(null);
    const [history, setHistory] = useState<Sensor[]>([]);
    const [status, setStatus] = useState("Connecting...");

    async function fetchSensors() {
        try {
            const [latestRes, historyRes] = await Promise.all([
                fetch("/api/sensors/latest", { cache: "no-store" }),
                fetch("/api/sensors?limit=20", { cache: "no-store" }),
            ]);

            if (!latestRes.ok || !historyRes.ok) {
                throw new Error("API unavailable");
            }

            const latestData = await latestRes.json();
            const historyData = await historyRes.json();

            console.log("Latest sensor:", latestData);
            console.log("History:", historyData);

            setLatest(latestData);
            setHistory(historyData.data ?? []);
            setStatus("Connected");
        } catch {
            setStatus("Disconnected");
        }
    }

    useEffect(() => {
        fetchSensors();

        const interval = setInterval(fetchSensors, 5000);

        return () => clearInterval(interval);
    }, []);

    const cards = [
        {
            title: "Temperature",
            value: latest?.temperature ?? "--",
            unit: "°C",
        },
        {
            title: "Humidity",
            value: latest?.humidity ?? "--",
            unit: "%",
        },
        {
            title: "Brightness",
            value: latest?.brightness ?? "--",
            unit: "ADC",
        },
    ];

    const chartData = [...history].reverse().map((item) => ({
        time: new Date(item.recorded_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        temperature: item.temperature,
        humidity: item.humidity,
    }));

    return (
        <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Smart Home
                        </h1>
                        <p className="text-slate-400 mt-1">
                            IoT Monitoring Dashboard
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`w-3 h-3 rounded-full ${
                                status === "Connected"
                                    ? "bg-green-400"
                                    : "bg-red-500"
                            }`}
                        />
                        <span className="text-sm text-slate-300">
                            {status}
                        </span>
                    </div>
                </header>

                <section>
                    <h2 className="text-xl font-semibold mb-4">
                        Room Overview
                    </h2>
                    
                    <p className="text-xs text-slate-500 mb-4">
                        Debug: {latest ? `Data ID ${latest.id}` : "No sensor data"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {cards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                            >
                                <p className="text-slate-400">
                                    {card.title}
                                </p>

                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-4xl font-bold">
                                        {card.value}
                                    </span>

                                    <span className="text-slate-400">
                                        {card.unit}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">
                        Sensor History
                    </h2>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="mb-6 text-slate-300">
                            Temperature History
                        </h3>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#334155"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        stroke="#94a3b8"
                                    />

                                    <YAxis stroke="#94a3b8" />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            border: "1px solid #334155",
                                            borderRadius: "10px",
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#38bdf8"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                <footer className="mt-10 text-center text-slate-500 text-sm">
                    Private Smart Home Project
                </footer>

            </div>
        </main>
    );
}