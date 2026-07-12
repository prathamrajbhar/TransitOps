"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface CostliestVehicle {
  id: string;
  nameModel: string;
  registrationNo: string;
  cost: number;
}

interface TopCostliestVehiclesChartProps {
  vehicles: CostliestVehicle[];
}

export function TopCostliestVehiclesChart({ vehicles }: TopCostliestVehiclesChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [vehicles]);

  const maxCost = vehicles[0]?.cost || 1;

  const barColors = [
    "bg-gradient-to-r from-rose-500 to-rose-600 border-rose-400/30 shadow-xs shadow-rose-500/20",
    "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400/30 shadow-xs shadow-orange-500/20",
    "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400/30 shadow-xs shadow-blue-500/20",
  ];

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/60 flex flex-col justify-between h-full hover:shadow-md transition-all duration-300">
      <div>
        <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-6">
          Top Costliest Vehicles
        </h3>

        <div className="space-y-6">
          {vehicles.slice(0, 3).map((item, index) => {
            const percentage = Math.round((item.cost / maxCost) * 100);
            const activeColor = barColors[index] || barColors[2];
            const currentWidth = animated ? percentage : 0;

            return (
              <div key={item.id} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                    <Link
                      href={`/fleet/${item.id}`}
                      className="hover:underline transition-all"
                    >
                      {item.nameModel} ({item.registrationNo})
                    </Link>
                  </span>
                  <span className="font-black text-slate-800">{formatCurrency(item.cost)}</span>
                </div>

                <div className="w-full h-4 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden relative shadow-inner">
                  <div
                    className={`h-full rounded-full border-r ${activeColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${currentWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
          {vehicles.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No operational expenses logged for this period.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200/30 flex items-center gap-2 text-[10px] text-orange-600 font-semibold leading-relaxed">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>
          Rule: Operational cost rankings are updated dynamically when fuel logs
          or maintenance service records are added.
        </span>
      </div>
    </div>
  );
}
