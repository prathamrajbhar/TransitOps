"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockData, RBAC_MATRIX } from "@/context/MockDataContext";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<Record<string, unknown>>;
  module: "FLEET" | "DRIVERS" | "TRIPS" | "MAINTENANCE" | "FUEL_EXPENSES" | "ANALYTICS" | "SETTINGS" | null;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, settings } = useMockData();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      module: null, // Always visible
    },
    {
      name: "Fleet",
      href: "/fleet",
      icon: Truck,
      module: "FLEET",
    },
    {
      name: "Drivers",
      href: "/drivers",
      icon: Users,
      module: "DRIVERS",
    },
    {
      name: "Trips",
      href: "/trips",
      icon: Route,
      module: "TRIPS",
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
      module: "MAINTENANCE",
    },
    {
      name: "Fuel & Expenses",
      href: "/fuel-expenses",
      icon: Fuel,
      module: "FUEL_EXPENSES",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      module: "ANALYTICS",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: SettingsIcon,
      module: "SETTINGS",
    },
  ];

  const filterNavItems = (items: NavItem[]) => {
    if (!currentUser) return [];
    const role = currentUser.role;

    return items.filter((item) => {
      if (item.module === null) return true;
      const access = RBAC_MATRIX[role]?.[item.module];
      return access && access !== "NONE";
    });
  };

  const filteredItems = filterNavItems(navItems);

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col h-screen fixed left-0 top-0 z-30 overflow-y-auto">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-200/40">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
          <svg
            className="w-6 h-6 text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
          </svg>
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">TransitOps</h1>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate block max-w-[130px]" title={settings.depotName}>
            {settings.depotName}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-amber-500/10 text-amber-700 shadow-xs border-l-4 border-amber-600 pl-3 font-semibold"
                  : "text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info / Logout */}
      {currentUser && (
        <div className="p-4 border-t border-slate-200/40 bg-slate-50/30 backdrop-blur-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shadow-sm">
              {currentUser.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 border border-rose-100 hover:border-rose-200 transition-all duration-200 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
