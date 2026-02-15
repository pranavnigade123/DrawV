"use client";

import { useEffect, useState } from "react";
import { Bell, X, Info, CheckCircle, AlertTriangle, XCircle, Megaphone } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "announcement";
  priority: "low" | "medium" | "high";
  dismissible: boolean;
  link?: string;
}

export default function NotificationMarquee() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowPanel(true);
  };

  const getIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case "success":
        return <CheckCircle className={iconClass} />;
      case "warning":
        return <AlertTriangle className={iconClass} />;
      case "error":
        return <XCircle className={iconClass} />;
      case "announcement":
        return <Megaphone className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "announcement":
        return "text-[#1B56FD]"; // Bright blue from website
      default:
        return "text-blue-400";
    }
  };

  const getPanelColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500 bg-green-950/30";
      case "warning":
        return "border-yellow-500 bg-yellow-950/30";
      case "error":
        return "border-red-500 bg-red-950/30";
      case "announcement":
        return "border-[#1B56FD] bg-[#1B56FD]/20"; // Bright blue from website
      default:
        return "border-blue-500 bg-blue-950/30";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Marquee Section */}
      <div className="w-full relative overflow-hidden py-5">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0118D8]/10 via-[#1B56FD]/15 to-[#0118D8]/10 backdrop-blur-xl border-y border-white/10"></div>
        
        {/* Fade effect on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none"></div>
        
        <div className="relative flex items-center gap-4 px-6">
          <div className="flex items-center gap-3 text-white flex-shrink-0 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg z-20">
            <Bell className="w-5 h-5 animate-pulse text-[var(--primary)]" />
            <span className="font-bold text-sm tracking-wider">NOTIFICATIONS</span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="marquee-container">
              <div className="marquee-content">
                {notifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:border-[var(--primary)] hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer mx-2 shadow-lg hover:shadow-2xl ${getTypeColor(notification.type)}`}
                  >
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      {notification.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showPanel && selectedNotification && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPanel(false)}
        >
          <div
            className={`relative max-w-2xl w-full rounded-3xl border ${getPanelColor(selectedNotification.type)} p-8 shadow-2xl animate-scale-in bg-black/40 backdrop-blur-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPanel(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group"
              aria-label="Close panel"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Icon and Type */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 ${getTypeColor(selectedNotification.type)} shadow-lg`}>
                <div className="w-8 h-8 flex items-center justify-center">
                  {getIcon(selectedNotification.type)}
                </div>
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${getTypeColor(selectedNotification.type)}`}>
                  {selectedNotification.type}
                </span>
                <div className="text-xs text-gray-400 mt-1">Notification</div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              {selectedNotification.title}
            </h2>

            {/* Message */}
            <p className="text-gray-200 text-lg leading-relaxed mb-8">
              {selectedNotification.message}
            </p>

            {/* Link Button */}
            {selectedNotification.link && (
              <a
                href={selectedNotification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl backdrop-blur-md"
              >
                Learn More
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .marquee-container {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .marquee-content {
          display: flex;
          animation: marquee 40s linear infinite;
          width: fit-content;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - 1rem));
          }
        }

        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        /* Responsive marquee speed */
        @media (max-width: 768px) {
          .marquee-content {
            animation: marquee 25s linear infinite;
          }
        }
      `}</style>
    </>
  );
}
