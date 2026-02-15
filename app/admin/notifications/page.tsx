"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Eye, EyeOff, Info, CheckCircle, AlertTriangle, XCircle, Megaphone, X } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "announcement";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  dismissible: boolean;
  createdAt: string;
  expiresAt?: string;
  link?: string;
}

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    dismissible: true,
    expiresAt: "",
    link: "",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          title: "",
          message: "",
          type: "info",
          priority: "medium",
          dismissible: true,
          expiresAt: "",
          link: "",
        });
        setShowForm(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "error": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      case "announcement": return "bg-[#1B56FD]/20 dark:bg-[#1B56FD]/30 text-[#1B56FD] dark:text-[#1B56FD]";
      default: return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
    }
  };

  const getPreviewIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "error": return <XCircle className="w-5 h-5" />;
      case "announcement": return <Megaphone className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getPreviewClasses = (type: string) => {
    const baseClasses = "border-l-4 transition-all duration-300";
    switch (type) {
      case "success": return `${baseClasses} bg-green-50 dark:bg-green-950/30 border-green-500 text-green-900 dark:text-green-100`;
      case "warning": return `${baseClasses} bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 text-yellow-900 dark:text-yellow-100`;
      case "error": return `${baseClasses} bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-100`;
      case "announcement": return `${baseClasses} bg-[#1B56FD]/10 dark:bg-[#1B56FD]/20 border-[#1B56FD] text-blue-900 dark:text-blue-100`;
      default: return `${baseClasses} bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-100`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Push Notifications
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Notification
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--surface)] rounded-lg p-6 mb-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
              Create Notification
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dismissible"
                  checked={formData.dismissible}
                  onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border)]"
                />
                <label htmlFor="dismissible" className="text-sm text-[var(--foreground)]">
                  Allow users to dismiss this notification
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                >
                  Create Notification
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg transition-colors border border-[var(--border)]"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Preview */}
            {(formData.title || formData.message) && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <h3 className="text-sm font-medium mb-3 text-[var(--foreground)]">Preview</h3>
                <div className={`${getPreviewClasses(formData.type)} rounded-lg shadow-lg p-4 flex items-start gap-3`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {getPreviewIcon(formData.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                      {formData.title || "Notification Title"}
                    </h3>
                    <p className="text-sm opacity-90">
                      {formData.message || "Your notification message will appear here..."}
                    </p>
                    {formData.link && (
                      <a
                        href={formData.link}
                        className="text-sm font-medium underline mt-2 inline-block hover:opacity-80"
                        onClick={(e) => e.preventDefault()}
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                  {formData.dismissible && (
                    <button className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[var(--gray)]">
              No notifications yet. Create one to get started!
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]">
                        {notification.priority}
                      </span>
                      {!notification.isActive && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--foreground)] opacity-80 mb-2">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        {notification.link}
                      </a>
                    )}
                    <div className="text-xs text-[var(--gray)] mt-2">
                      Created: {new Date(notification.createdAt).toLocaleString()}
                      {notification.expiresAt && (
                        <> • Expires: {new Date(notification.expiresAt).toLocaleString()}</>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(notification._id, notification.isActive)}
                      className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                      title={notification.isActive ? "Deactivate" : "Activate"}
                    >
                      {notification.isActive ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
