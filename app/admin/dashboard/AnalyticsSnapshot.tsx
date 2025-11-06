"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Stat = { name: string; count: number };

export default function AnalyticsSnapshot() {
  const [data, setData] = useState<Stat[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tournaments");
        const json = await res.json();
        const items = Array.isArray(json)
          ? json
          : Array.isArray(json.items)
          ? json.items
          : [];

        // group tournaments by game
        const counts: Record<string, number> = {};
        for (const t of items) {
          const key = t.game || "Unknown";
          counts[key] = (counts[key] || 0) + 1;
        }

        const arr = Object.entries(counts).map(([name, count]) => ({
          name,
          count,
        }));
        // sort descending
        arr.sort((a, b) => b.count - a.count);
        setData(arr);
      } catch (e) {
        console.error("fetch analytics failed", e);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-5 text-white">
      <h3 className="text-lg font-semibold mb-4">
        Game Popularity Snapshot
      </h3>

      {data.length === 0 ? (
        <div className="text-sm text-zinc-500">
          No registration data yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                color: "#fff",
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
