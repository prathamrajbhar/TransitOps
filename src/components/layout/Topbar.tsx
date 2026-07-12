"use client";

import React, { useState } from "react";
import { useMockData, RoleName } from "@/context/MockDataContext";
import { Shield, ChevronDown, Search } from "lucide-react";
import RoleBadge from "./RoleBadge";

export const Topbar: React.FC = () => {
  const { currentUser, switchRole } = useMockData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { value: RoleName; label: string; desc: string }[] = [
    {
      value: "FLEET_MANAGER",
      label: "Fleet Manager",
      desc: "Manages fleet, maintenance, reports",
    },
    {
      value: "DISPATCHER",
      label: "Dispatcher",
      desc: "Creates/dispatches trips, dashboard",
    },
    {
      value: "SAFETY_OFFICER",
      label: "Safety Officer",
      desc: "Monitors driver safety, compliance",
    },
    {
      value: "FINANCIAL_ANALYST",
      label: "Financial Analyst",
      desc: "Tracks fuel, expenses, analytics",
    },
  ];

  const handleRoleSwitch = (role: RoleName) => {
    switchRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-20 backdrop-blur-md">
      {/* Search Input */}
      <div className="w-96 relative">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Global search (vehicles, drivers, trips...)"
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input bg-white/20 border-slate-200 focus:bg-white/70 focus:border-amber-500 focus:outline-none transition-all duration-300"
        />
      </div>

      {/* Right Side: Profile & Switcher */}
      <div className="flex items-center gap-6">
        {/* Role Quick Switcher */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-500/5 hover:bg-amber-500/10 text-amber-800 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Switch Role</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoleMenu ? "rotate-180" : ""}`} />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-lg border border-slate-200/50 py-2 p-1.5 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in duration-200">
                <div className="px-3 py-1.5 border-b border-slate-200/30">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulate Role View</p>
                </div>
                {roles.map((r) => {
                  const isCurrent = currentUser.role === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => handleRoleSwitch(r.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-150 flex flex-col gap-0.5 cursor-pointer ${
                        isCurrent
                          ? "bg-amber-500/10 border-l-4 border-amber-600 font-semibold"
                          : "hover:bg-slate-100/60"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isCurrent ? "text-amber-800" : "text-slate-700"}`}>
                        {r.label}
                      </span>
                      <span className="text-[9px] text-slate-400">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-none">logged in</p>
            </div>
            <div className="flex items-center">
              <RoleBadge role={currentUser.role} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
