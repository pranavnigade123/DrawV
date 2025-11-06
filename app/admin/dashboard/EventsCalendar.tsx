"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import clsx from "clsx";

type T = {
  _id?: string;
  name: string;
  slug: string;
  game?: string | null;
  status: "draft" | "open" | "ongoing" | "completed";
  startDate?: string | null;
  endDate?: string | null;
};

export default function EventsCalendar() {
  const [tournaments, setTournaments] = useState<T[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        const list: T[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setTournaments(list);
      } catch (e) {
        console.error("fetch tournaments failed", e);
        setTournaments([]);
      }
    })();
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const t of tournaments) {
      const s = t.startDate ? new Date(t.startDate) : null;
      const e = t.endDate ? new Date(t.endDate) : null;
      if (!s && !e) continue;
      const days: string[] = [];
      if (s && e) {
        const cur = new Date(s);
        const end = new Date(e);
        while (cur <= end) {
          days.push(cur.toDateString());
          cur.setDate(cur.getDate() + 1);
        }
      } else if (s) days.push(s.toDateString());
      else if (e) days.push(e.toDateString());
      for (const d of days) {
        const arr = map.get(d) ?? [];
        arr.push(t);
        map.set(d, arr);
      }
    }
    return map;
  }, [tournaments]);

  const tileClassName = ({ date, view }: any) => {
    if (view !== "month") return "";
    const hasEvent = eventsByDay.has(date.toDateString());
    return hasEvent ? "has-event" : "";
  };

  const dayEvents = selectedDate
    ? eventsByDay.get(selectedDate.toDateString()) || []
    : [];

  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-5 text-white">
      <h3 className="text-lg font-semibold mb-4">Upcoming Events Calendar</h3>

      <div className="react-calendar-wrapper">
        <Calendar
          onClickDay={(d: Date) => setSelectedDate(d)}
          tileClassName={tileClassName}
          className="!bg-zinc-900 !text-white !border-none w-full rounded-lg p-2"
        />
      </div>

      <style jsx global>{`
        .react-calendar {
          background: transparent;
          color: #e4e4e7;
        }
        .react-calendar__navigation button {
          color: #e4e4e7;
        }
        .react-calendar__tile {
          background: transparent;
          color: #e4e4e7;
        }
        .react-calendar__tile--now {
          background: rgba(99, 102, 241, 0.15);
          border-radius: 6px;
        }
        .react-calendar__tile--active {
          background: #6366f1 !important;
          color: #fff !important;
          border-radius: 6px;
        }
        .has-event {
          position: relative;
        }
        .has-event::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #6366f1;
          border-radius: 50%;
        }
      `}</style>

      <div className="mt-4">
        <div className="text-sm text-zinc-400 mb-2">
          {selectedDate ? selectedDate.toDateString() : "Pick a date"}
        </div>

        {selectedDate && dayEvents.length === 0 && (
          <div className="text-sm text-zinc-500">
            No events on this date. Add start/end dates when creating tournaments.
          </div>
        )}

        <ul className="space-y-2">
          {dayEvents.map((ev) => (
            <li key={ev.slug} className="text-sm">
              <div className="font-medium">{ev.name}</div>
              <div className="text-zinc-400">
                {ev.game ?? "—"} • {ev.status}
              </div>
              <a
                href={`/tournaments/${ev.slug}`}
                className="text-indigo-400 text-xs hover:underline"
              >
                View tournament →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
