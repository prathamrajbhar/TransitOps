"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, LogOut, User, Mail, Shield } from "lucide-react";
import RoleBadge from "./RoleBadge";

export const Topbar: React.FC = () => {
  const { user, signOut } = useSession();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut();
    router.push("/login");
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Dynamic avatar gradient based on role
  const getAvatarGradient = (role: string) => {
    switch (role) {
      case "FLEET_MANAGER":
        return "bg-gradient-to-br from-amber-400 to-orange-500 text-white";
      case "DISPATCHER":
        return "bg-gradient-to-br from-blue-400 to-indigo-500 text-white";
      case "SAFETY_OFFICER":
        return "bg-gradient-to-br from-emerald-400 to-teal-500 text-white";
      case "FINANCIAL_ANALYST":
        return "bg-gradient-to-br from-purple-400 to-pink-500 text-white";
      default:
        return "bg-gradient-to-br from-slate-400 to-slate-600 text-white";
    }
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

      {/* Right Side: Profile Dropdown */}
      <div className="flex items-center gap-4" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100/60 border border-transparent hover:border-slate-200/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 active:scale-98 cursor-pointer"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            {/* Avatar Circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${getAvatarGradient(user.role)}`}>
              {getInitials(user.name)}
            </div>

            {/* User Info */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-lg border border-slate-200/50 py-2 p-1.5 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header section */}
              <div className="px-3 py-2 border-b border-slate-200/30 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  <span>Profile Info</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Role Display */}
              <div className="px-3 py-2 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Security Role</span>
                </div>
                <div className="flex">
                  <RoleBadge role={user.role as any} />
                </div>
              </div>

              <div className="border-t border-slate-200/30 my-0.5" />

              {/* Actions */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-700 text-slate-700 text-sm font-semibold flex items-center gap-2.5 transition-all duration-150 cursor-pointer active:scale-98"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
