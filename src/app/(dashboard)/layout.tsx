"use client";

import React, { useLayoutEffect, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";
import { ModuleName, RBAC_MATRIX } from "@/context/MockDataContext";
import { useSettings } from "@/hooks/useSettings";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { ShieldAlert } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();
  const [mounted, setMounted] = useState(false);
  const [deniedNotice, setDeniedNotice] = useState<string | null>(null);
  
  const { settings } = useSettings();

  const userMatrix = useMemo(() => {
    if (settings && settings.rbac_matrix) {
      try {
        return typeof settings.rbac_matrix === "string"
          ? JSON.parse(settings.rbac_matrix)
          : settings.rbac_matrix;
      } catch (e) {
        console.error("Failed to parse dynamic RBAC matrix in layout", e);
      }
    }
    return RBAC_MATRIX;
  }, [settings]);

  const pathToModule: Record<string, ModuleName> = useMemo(() => ({
    "/fleet": "FLEET",
    "/drivers": "DRIVERS",
    "/trips": "TRIPS",
    "/maintenance": "MAINTENANCE",
    "/fuel-expenses": "FUEL_EXPENSES",
    "/analytics": "ANALYTICS",
    "/settings": "SETTINGS",
  }), []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [user, router, mounted]);

  // Route-level RBAC Page Guarding
  useEffect(() => {
    if (!mounted || !user) return;

    const matchedPrefix = Object.keys(pathToModule).find(prefix => pathname.startsWith(prefix));

    if (matchedPrefix) {
      const moduleName = pathToModule[matchedPrefix];
      const access = userMatrix[user.role]?.[moduleName];

      if (!access || access === "NONE") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeniedNotice(`Access Denied: Your role (${user.role.replace("_", " ")}) does not have permission to view '${matchedPrefix}' modules.`);
        router.push("/dashboard");
        // Clear notice after 5 seconds
        const timer = setTimeout(() => setDeniedNotice(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, user, mounted, router, pathToModule, userMatrix]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-sans flex">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Header Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {deniedNotice && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200/50 backdrop-blur-md flex items-center gap-3 text-xs text-red-800 shadow-lg animate-in slide-in-from-top-3 duration-300">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">Security Guard Alert</p>
                  <p className="mt-0.5 font-bold text-red-700">{deniedNotice}</p>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
