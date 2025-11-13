"use client";

import { useState } from "react";
import OverviewTab from "./tabs/OverviewTab";
import RegistrationsTab from "./tabs/RegistrationsTab";
import BracketTab from "./tabs/BracketTab";
import ScheduleTab from "./tabs/ScheduleTab";
import ResultsTab from "./tabs/ResultsTab";
import SettingsTab from "./tabs/SettingsTab";

type Tab = "overview" | "registrations" | "bracket" | "schedule" | "results" | "settings";

interface TournamentManagementTabsProps {
  tournament: any;
  registrationCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function TournamentManagementTabs({
  tournament,
  registrationCounts,
}: TournamentManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "registrations", label: "Registrations", badge: registrationCounts.pending },
    { id: "bracket", label: "Bracket" },
    { id: "schedule", label: "Schedule" },
    { id: "results", label: "Results" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-zinc-800 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab tournament={tournament} registrationCounts={registrationCounts} />}
        {activeTab === "registrations" && <RegistrationsTab tournament={tournament} />}
        {activeTab === "bracket" && <BracketTab tournament={tournament} />}
        {activeTab === "schedule" && <ScheduleTab tournament={tournament} />}
        {activeTab === "results" && <ResultsTab tournament={tournament} />}
        {activeTab === "settings" && <SettingsTab tournament={tournament} />}
      </div>
    </div>
  );
}
