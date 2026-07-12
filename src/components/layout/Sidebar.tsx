"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/src/providers/SessionProvider";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Fleet", href: "/fleet", icon: "🚛" },
  { label: "Drivers", href: "/drivers", icon: "👤" },
  { label: "Trips", href: "/trips", icon: "📍" },
  { label: "Maintenance", href: "/maintenance", icon: "🔧" },
  { label: "Fuel & Expenses", href: "/fuel-expenses", icon: "⛽" },
  { label: "Analytics", href: "/analytics", icon: "📈" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <aside className="flex w-64 flex-col bg-gray-900 text-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-700 px-6">
        <span className="text-xl font-bold">TransitOps</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-xs font-medium">
            {user?.role?.[0] ?? "?"}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-200">
              {user?.role ?? "Guest"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
