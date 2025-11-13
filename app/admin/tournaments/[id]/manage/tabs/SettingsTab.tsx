"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function SettingsTab({ tournament }: { tournament: any }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name || "",
    game: tournament.game || "",
    description: tournament.description || "",
    rules: tournament.rules || "",
    maxParticipants: tournament.maxParticipants || "",
    registrationOpenAt: tournament.registrationOpenAt
      ? new Date(tournament.registrationOpenAt).toISOString().slice(0, 16)
      : "",
    registrationCloseAt: tournament.registrationCloseAt
      ? new Date(tournament.registrationCloseAt).toISOString().slice(0, 16)
      : "",
    startDate: tournament.startDate
      ? new Date(tournament.startDate).toISOString().slice(0, 16)
      : "",
    endDate: tournament.endDate
      ? new Date(tournament.endDate).toISOString().slice(0, 16)
      : "",
    status: tournament.status || "draft",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update tournament");

      toast.success("Tournament updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating tournament:", error);
      toast.error("Failed to update tournament");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    toast.promise(
      (async () => {
        const res = await fetch(`/api/admin/tournaments/${tournament._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) throw new Error("Failed to update status");
        router.refresh();
      })(),
      {
        loading: `Changing status to ${newStatus}...`,
        success: "Status updated successfully!",
        error: "Failed to update status",
      }
    );
  };

  const handleArchive = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Archive this tournament?</p>
          <p className="text-sm text-zinc-400">It will be hidden from public view.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
            >
              Archive
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

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/archive`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to archive tournament");

      toast.success("Tournament archived successfully!");
      router.push("/admin/tournaments");
    } catch (error) {
      console.error("Error archiving tournament:", error);
      toast.error("Failed to archive tournament");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-red-400">⚠️ Delete Tournament?</p>
          <p className="text-sm text-zinc-400">This will permanently delete all data. This cannot be undone!</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete Forever
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

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete tournament");

      toast.success("Tournament deleted successfully!");
      router.push("/admin/tournaments");
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast.error("Failed to delete tournament");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <PencilIcon className="w-5 h-5" />
          Basic Information
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tournament Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Game
              </label>
              <input
                type="text"
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="open">Open for Registration</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Rules
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Dates & Deadlines */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dates & Deadlines</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Registration Opens
            </label>
            <input
              type="datetime-local"
              value={formData.registrationOpenAt}
              onChange={(e) => setFormData({ ...formData, registrationOpenAt: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Registration Closes
            </label>
            <input
              type="datetime-local"
              value={formData.registrationCloseAt}
              onChange={(e) => setFormData({ ...formData, registrationCloseAt: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tournament Start
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tournament End
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Status Management</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Quickly change tournament status
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleStatusChange("draft")}
            disabled={updating || tournament.status === "draft"}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Set to Draft
          </button>
          <button
            onClick={() => handleStatusChange("open")}
            disabled={updating || tournament.status === "open"}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Open Registration
          </button>
          <button
            onClick={() => handleStatusChange("ongoing")}
            disabled={updating || tournament.status === "ongoing"}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Start Tournament
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            disabled={updating || tournament.status === "completed"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Mark Complete
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Archive Tournament</h4>
              <p className="text-sm text-zinc-400">
                Hide tournament from public view (can be restored)
              </p>
            </div>
            <button
              onClick={handleArchive}
              disabled={updating}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              Archive
            </button>
          </div>

          <div className="border-t border-red-800/50 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-red-400 font-medium">Delete Tournament</h4>
                <p className="text-sm text-zinc-400">
                  Permanently delete tournament and all data (cannot be undone)
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={updating}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
