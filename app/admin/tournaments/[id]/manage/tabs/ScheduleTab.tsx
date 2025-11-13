"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CalendarIcon, ClockIcon, MapPinIcon, VideoCameraIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Match {
  id: string;
  bracket: string;
  round: number;
  matchNumber: number;
  opponentA: { label: string | null };
  opponentB: { label: string | null };
  scheduledAt: string | null;
  scheduledEndAt: string | null;
  venue: string | null;
  streamUrl: string | null;
  status: string;
  finished: boolean;
}

export default function ScheduleTab({ tournament }: { tournament: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");
  const [venue, setVenue] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishedSchedules, setPublishedSchedules] = useState<any[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDescription, setPublishDescription] = useState("");

  useEffect(() => {
    if (tournament.bracketId) {
      fetchMatches();
      fetchPublishedSchedules();
    }
  }, [tournament.bracketId]);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/api/brackets/${tournament.bracketId}`);
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedSchedules = async () => {
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/publish-schedule`);
      const data = await res.json();
      if (data.schedules) {
        setPublishedSchedules(data.schedules);
      }
    } catch (error) {
      console.error("Failed to fetch published schedules:", error);
    }
  };

  const handlePublishSchedule = async () => {
    if (!publishTitle) {
      toast.error("Please enter a title for the schedule");
      return;
    }

    const scheduledMatchesCount = matches.filter((m) => m.scheduledAt).length;
    if (scheduledMatchesCount === 0) {
      toast.error("No scheduled matches to publish");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/publish-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: publishTitle,
          description: publishDescription,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setShowPublishModal(false);
        setPublishTitle("");
        setPublishDescription("");
        fetchPublishedSchedules();
      } else {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, title: string) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Delete "{title}"?</p>
          <p className="text-sm text-zinc-400">This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1 bg-zinc-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: Infinity });
    });

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/tournaments/${tournament._id}/publish-schedule?scheduleId=${scheduleId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Schedule deleted successfully");
        fetchPublishedSchedules();
      } else {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleScheduleMatch = async () => {
    if (!selectedMatch || !scheduledAt) {
      toast.error("Please select a match and set a start time");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/brackets/${tournament.bracketId}/schedule-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          scheduledAt,
          scheduledEndAt: scheduledEndAt || null,
          venue: venue || null,
          streamUrl: streamUrl || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Match scheduled successfully!");
        fetchMatches();
        setSelectedMatch(null);
        setScheduledAt("");
        setScheduledEndAt("");
        setVenue("");
        setStreamUrl("");
      } else {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally{
      setSaving(false);
    }
  };

  if (!tournament.bracketGenerated) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Match Scheduling</h3>
        <p className="text-zinc-400">
          Generate a bracket first to schedule matches.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400">Loading matches...</p>
      </div>
    );
  }

  const scheduledMatches = matches.filter((m) => m.scheduledAt);
  const unscheduledMatches = matches.filter((m) => !m.scheduledAt && m.opponentA.label && m.opponentB.label && !m.finished);

  return (
    <div className="space-y-6">
      {/* Schedule Match Form */}
      {selectedMatch && (
        <div className="bg-indigo-900/20 border border-indigo-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Schedule Match: {selectedMatch.id}
          </h3>
          <p className="text-zinc-300 mb-4">
            {selectedMatch.opponentA.label} vs {selectedMatch.opponentB.label}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledEndAt}
                onChange={(e) => setScheduledEndAt(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Venue (Optional)
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g., Discord Server, Arena 1"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <VideoCameraIcon className="w-4 h-4 inline mr-1" />
                Stream URL (Optional)
              </label>
              <input
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://twitch.tv/..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScheduleMatch}
              disabled={saving || !scheduledAt}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Schedule"}
            </button>
            <button
              onClick={() => setSelectedMatch(null)}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Matches */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          <CalendarIcon className="w-5 h-5 inline mr-2" />
          Scheduled Matches ({scheduledMatches.length})
        </h3>

        {scheduledMatches.length === 0 ? (
          <p className="text-zinc-400">No matches scheduled yet</p>
        ) : (
          <div className="space-y-3">
            {scheduledMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-2">
                      {match.opponentA.label} vs {match.opponentB.label}
                    </div>
                    <div className="text-sm text-zinc-400 space-y-1">
                      <div>
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {new Date(match.scheduledAt!).toLocaleString()}
                      </div>
                      {match.venue && (
                        <div>
                          <MapPinIcon className="w-4 h-4 inline mr-1" />
                          {match.venue}
                        </div>
                      )}
                      {match.streamUrl && (
                        <div>
                          <VideoCameraIcon className="w-4 h-4 inline mr-1" />
                          <a
                            href={match.streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            Watch Stream
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-900/30 text-emerald-300 text-xs rounded-full">
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unscheduled Matches */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Unscheduled Matches ({unscheduledMatches.length})
        </h3>

        {unscheduledMatches.length === 0 ? (
          <p className="text-zinc-400">All matches are scheduled!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unscheduledMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 text-left transition-colors"
              >
                <div className="text-sm text-zinc-500 mb-1">
                  {match.bracket} - Round {match.round} - Match {match.matchNumber}
                </div>
                <div className="font-medium text-white">
                  {match.opponentA.label} vs {match.opponentB.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Publish Schedule Button */}
      {scheduledMatches.length > 0 && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Publish Schedule</h3>
          <p className="text-zinc-400 mb-4">
            Publish scheduled matches to make them visible to participants. You can publish multiple schedules for different rounds.
          </p>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            Publish New Schedule ({scheduledMatches.length} matches)
          </button>
        </div>
      )}

      {/* Published Schedules */}
      {publishedSchedules.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Published Schedules ({publishedSchedules.length})
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            All published schedules are visible to participants on the tournament page.
          </p>
          <div className="space-y-3">
            {publishedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">{schedule.title}</div>
                    {schedule.description && (
                      <div className="text-sm text-zinc-400 mt-1">{schedule.description}</div>
                    )}
                    <div className="text-sm text-zinc-500 mt-2">
                      {schedule.matchCount} matches • Published{" "}
                      {new Date(schedule.publishedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-900/30 text-emerald-300 text-xs rounded-full">
                      Published
                    </span>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id, schedule.title)}
                      className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete schedule"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Publish Schedule</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="e.g., Round 1 Schedule, Semi-Finals"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  placeholder="Additional information about this schedule..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="bg-zinc-800 p-3 rounded-lg">
                <div className="text-sm text-zinc-400">
                  This will publish {scheduledMatches.length} scheduled matches. All published schedules will be visible to participants.
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePublishSchedule}
                disabled={saving || !publishTitle}
                className="flex-1 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {saving ? "Publishing..." : "Publish"}
              </button>
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishTitle("");
                  setPublishDescription("");
                }}
                className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}