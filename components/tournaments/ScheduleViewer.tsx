"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

interface Match {
  matchId: string;
  opponentA: string;
  opponentB: string;
  scheduledAt: string;
  scheduledEndAt?: string;
  venue?: string;
  streamUrl?: string;
  round: number;
  bracket: string;
}

interface Schedule {
  id: string;
  title: string;
  description?: string;
  matches: Match[];
  publishedAt: string;
}

interface ScheduleViewerProps {
  tournamentSlug: string;
}

export default function ScheduleViewer({ tournamentSlug }: ScheduleViewerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        console.log("Fetching schedules for:", tournamentSlug);
        const res = await fetch(`/api/tournaments/${tournamentSlug}/schedules`);
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Schedules data:", data);
        if (data.schedules) {
          setSchedules(data.schedules);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [tournamentSlug]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-zinc-400">Loading schedules...</p>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">No schedules published yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white">{schedule.title}</h3>
            {schedule.description && (
              <p className="text-sm text-zinc-400 mt-1">{schedule.description}</p>
            )}
            <p className="text-xs text-zinc-500 mt-2">
              Published {new Date(schedule.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="space-y-3">
            {schedule.matches
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .map((match, index) => (
                <div
                  key={match.matchId}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-sm text-zinc-500 mb-1">
                        {match.bracket} - Round {match.round}
                      </div>
                      <div className="font-medium text-white text-lg">
                        {match.opponentA} <span className="text-zinc-500">vs</span> {match.opponentB}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <ClockIcon className="w-4 h-4 text-zinc-500" />
                      <span>
                        {new Date(match.scheduledAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {match.venue && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPinIcon className="w-4 h-4 text-zinc-500" />
                        <span>{match.venue}</span>
                      </div>
                    )}

                    {match.streamUrl && (
                      <div className="flex items-center gap-2">
                        <VideoCameraIcon className="w-4 h-4 text-zinc-500" />
                        <a
                          href={match.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                          Watch Stream
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
