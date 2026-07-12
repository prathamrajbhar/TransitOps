"use client";

import React from "react";
import { Fuel, Gauge, Coins, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface AnalyticsKpiCardsProps {
  fuelEfficiency: number;
  fleetUtilization: number;
  operationalCost: number;
  fleetROI: number;
}

export function AnalyticsKpiCards({
  fuelEfficiency,
  fleetUtilization,
  operationalCost,
  fleetROI,
}: AnalyticsKpiCardsProps) {
  const cards = [
    {
      title: "Fuel Efficiency",
      value: `${fuelEfficiency} km/l`,
      desc: "Distance / Fuel consumed ratio",
      icon: Fuel,
      borderColor: "border-l-blue-600",
      iconColor: "text-blue-500/70",
    },
    {
      title: "Fleet Utilization",
      value: `${fleetUtilization}%`,
      desc: "Active vs Available vehicles",
      icon: Gauge,
      borderColor: "border-l-emerald-500",
      iconColor: "text-emerald-500/70",
    },
    {
      title: "Operational Cost",
      value: formatCurrency(operationalCost),
      desc: "Total (Fuel + Maintenance)",
      icon: Coins,
      borderColor: "border-l-orange-500",
      iconColor: "text-orange-500/70",
    },
    {
      title: "Vehicle ROI",
      value: `${fleetROI}%`,
      desc: "Estimated net ROI yield percentage",
      icon: TrendingUp,
      borderColor: "border-l-emerald-600",
      iconColor: "text-emerald-600/70",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl glass-card border-l-4 ${card.borderColor} flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 shadow-sm cursor-default`}
          >
            <div>
              <span className="flex items-center justify-between text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                {card.title}
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </span>
              <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                {card.value}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">
              {card.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
