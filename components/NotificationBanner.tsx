"use client";

import { useEffect, useState } from "react";
import { X, Info, CheckCircle, AlertTriangle, XCircle, Megaphone } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "announcement";
  priority: "low" | "medium" | "high";
  dismissible: boolean;
  link?: string;
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Load dismissed notifications from localStorage
    const stored = localStorage.getItem("dismissedNotifications");
    if (stored) {
      setDismissed(new Set(JSON.parse(stored)));
    }

    return () => clearInterval(interval);
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
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
    localStorage.setItem("dismissedNotifications", JSON.stringify([...newDismissed]));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "announcement":
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getThemeClasses = (type: string) => {
    const baseClasses = "border-l-4 transition-all duration-300";
    
    switch (type) {
      case "success":
        return `${baseClasses} bg-green-50 dark:bg-green-950/30 border-green-500 text-green-900 dark:text-green-100`;
      case "warning":
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 text-yellow-900 dark:text-yellow-100`;
      case "error":
        return `${baseClasses} bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-100`;
      case "announcement":
        return `${baseClasses} bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-900 dark:text-purple-100`;
      default:
        return `${baseClasses} bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-100`;
    }
  };

  const visibleNotifications = notifications
    .filter((n) => !dismissed.has(n._id))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4">
      {visibleNotifications.map((notification) => (
        <div
          key={notification._id}
          className={`${getThemeClasses(notification.type)} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-down`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
            <p className="text-sm opacity-90">{notification.message}</p>
            
            {notification.link && (
              <a
                href={notification.link}
                className="text-sm font-medium underline mt-2 inline-block hover:opacity-80"
              >
                Learn more →
              </a>
            )}
          </div>

          {notification.dismissible && (
            <button
              onClick={() => handleDismiss(notification._id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
