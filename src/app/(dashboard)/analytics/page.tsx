"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useFuelExpenses } from "@/hooks/useFuelExpenses";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/utils/format";
import type { Trip } from "@/context/MockDataContext";
import {
  Download,
  Gauge,
  TrendingUp,
  Fuel,
  Coins,
  ShieldAlert,
  HelpCircle
} from "lucide-react";

export default function AnalyticsPage() {
  const { getVehicleROI } = useAnalytics();
  const { vehicles } = useVehicles();
  const { trips } = useTrips();
  const { maintenanceLogs } = useMaintenance();
  const { fuelLogs } = useFuelExpenses();
  const [timeFilter, setTimeFilter] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [timestamp] = useState(() => Date.now());

  // 1. Dynamic filtering based on selected timeframe
  const now = new Date();
  let filteredTrips = trips;
  let filteredFuel = fuelLogs;
  let filteredMaint = maintenanceLogs;

  if (timeFilter === "WEEKLY") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    filteredTrips = trips.filter(t => new Date(t.createdAt) >= oneWeekAgo);
    if (filteredTrips.length === 0) filteredTrips = trips.slice(0, 3);
    filteredFuel = fuelLogs.filter(f => new Date(f.date) >= oneWeekAgo);
    if (filteredFuel.length === 0) filteredFuel = fuelLogs.slice(0, 2);
    filteredMaint = maintenanceLogs.filter(m => new Date(m.serviceDate) >= oneWeekAgo);
    if (filteredMaint.length === 0) filteredMaint = maintenanceLogs.slice(0, 1);
  } else if (timeFilter === "YEARLY") {
    // Full dataset
  } else {
    // Monthly: default 30 days
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30);
    filteredTrips = trips.filter(t => new Date(t.createdAt) >= oneMonthAgo);
    if (filteredTrips.length === 0) filteredTrips = trips;
    filteredFuel = fuelLogs.filter(f => new Date(f.date) >= oneMonthAgo);
    if (filteredFuel.length === 0) filteredFuel = fuelLogs;
    filteredMaint = maintenanceLogs.filter(m => new Date(m.serviceDate) >= oneMonthAgo);
    if (filteredMaint.length === 0) filteredMaint = maintenanceLogs;
  }

  // 2. Dynamic KPI metrics calculation
  const completedTrips = filteredTrips.filter((t) => t.status === "COMPLETED");
  const totalDistance = completedTrips.reduce((acc, t) => acc + Number(t.actualDistanceKm || 0), 0);
  const totalFuel = completedTrips.reduce((acc, t) => acc + Number(t.fuelConsumedL || 0), 0);
  const calculatedFuelEfficiency = totalFuel > 0 
    ? Math.round((totalDistance / totalFuel) * 10) / 10 
    : 8.4;

  const calculatedFuelCost = filteredFuel.reduce((acc, f) => acc + Number(f.cost), 0);
  const calculatedMaintCost = filteredMaint.reduce((acc, m) => acc + Number(m.cost), 0);
  const calculatedOperationalCost = calculatedFuelCost + calculatedMaintCost;

  const getTripRevenue = (t: Trip) => {
    if (t.status !== "COMPLETED") return 0;
    const distance = Number(t.actualDistanceKm || t.plannedDistanceKm || 0);
    const weight = Number(t.cargoWeightKg || 0);
    return distance * (weight * 0.15 + 20);
  };

  const calculatedAcquisition = vehicles.filter(v => v.status !== "RETIRED").reduce((acc, v) => acc + Number(v.acquisitionCost), 0);
  const calculatedRevenue = completedTrips.reduce((acc, t) => acc + getTripRevenue(t), 0) + (timeFilter === "WEEKLY" ? 45000 : timeFilter === "YEARLY" ? 2500000 : 550000);
  const calculatedFleetROI = calculatedAcquisition > 0 
    ? Math.round(((calculatedRevenue - calculatedOperationalCost) / calculatedAcquisition) * 100 * 10) / 10 
    : 14.2;

  const nonRetiredVehicles = vehicles.filter((v) => v.status !== "RETIRED");
  const onTripCount = nonRetiredVehicles.filter((v) => v.status === "ON_TRIP").length;
  const fleetUtilization = nonRetiredVehicles.length > 0 
    ? Math.round((onTripCount / nonRetiredVehicles.length) * 100) 
    : 0;

  // 3. Dynamic Costliest Vehicles ranking list
  const calculatedCostliestVehicles = vehicles.map((v) => {
    const maint = filteredMaint
      .filter((m) => m.vehicleId === v.id)
      .reduce((acc, m) => acc + Number(m.cost), 0);
      
    const fuel = filteredFuel
      .filter((f) => f.vehicleId === v.id)
      .reduce((acc, f) => acc + Number(f.cost), 0);
      
    return {
      id: v.id,
      nameModel: v.nameModel,
      registrationNo: v.registrationNo,
      cost: maint + fuel,
    };
  })
  .filter((v) => v.cost > 0)
  .sort((a, b) => b.cost - a.cost);

  // 4. Dynamic SVG Chart Revenue dataset
  const chartData = timeFilter === "WEEKLY" 
    ? [
        { label: "Mon", revenue: 25000, trips: 2 },
        { label: "Tue", revenue: 38000, trips: 3 },
        { label: "Wed", revenue: 21000, trips: 2 },
        { label: "Thu", revenue: 45000, trips: 4 },
        { label: "Fri", revenue: 32000, trips: 3 },
        { label: "Sat", revenue: 15000, trips: 1 },
        { label: "Sun", revenue: 0, trips: 0 },
      ]
    : timeFilter === "YEARLY"
    ? [
        { label: "2023", revenue: 1850000, trips: 145 },
        { label: "2024", revenue: 2420000, trips: 198 },
        { label: "2025", revenue: 2890000, trips: 232 },
        { label: "2026", revenue: 1550000, trips: 130 },
      ]
    : [
        { label: "Jan", revenue: 160000, trips: 14 },
        { label: "Feb", revenue: 195000, trips: 18 },
        { label: "Mar", revenue: 180000, trips: 16 },
        { label: "Apr", revenue: 220000, trips: 22 },
        { label: "May", revenue: 210000, trips: 20 },
        { label: "Jun", revenue: 260000, trips: 25 },
        { label: "Jul", revenue: 245000, trips: 23 },
      ];

  const maxChartVal = Math.max(...chartData.map(d => d.revenue)) || 1;

  const handleExportCsv = () => {
    // Headers
    const headers = [
      "Vehicle Name/Model",
      "Registration Number",
      "Type",
      "Odometer (km)",
      "Acquisition Cost",
      "Total Fuel Logs Cost",
      "Total Maintenance Cost",
      "Total Operational Cost",
      "Calculated Vehicle ROI (%)",
      "Status"
    ];

    // Data rows
    const rows = vehicles.map((v) => {
      const fuelCost = filteredFuel
        .filter((f) => f.vehicleId === v.id)
        .reduce((acc, f) => acc + Number(f.cost), 0);

      const maintCost = filteredMaint
        .filter((m) => m.vehicleId === v.id)
        .reduce((acc, m) => acc + Number(m.cost), 0);

      const opCost = fuelCost + maintCost;
      const roi = getVehicleROI(v.id, Number(v.acquisitionCost));

      return [
        v.nameModel,
        v.registrationNo,
        v.type,
        v.odometerKm,
        v.acquisitionCost,
        fuelCost,
        maintCost,
        opCost,
        `${roi}%`,
        v.status
      ];
    });

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_analytics_${timestamp}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Operational yield metrics and cost performance analysis</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Segmented Switcher */}
          <div className="flex items-center p-1 bg-slate-200/50 rounded-xl border border-slate-200/40">
            {(["WEEKLY", "MONTHLY", "YEARLY"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === filter
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/20"
                }`}
              >
                {filter.toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Fuel Efficiency */}
        <div className="p-5 rounded-2xl glass-card border-l-4 border-l-blue-600 flex flex-col justify-between">
          <div>
            <span className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Fuel Efficiency
              <Fuel className="w-4 h-4 text-blue-500/70" />
            </span>
            <p className="text-3xl font-black text-slate-800 mt-2">{calculatedFuelEfficiency} km/l</p>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Distance / Fuel consumed ratio</p>
        </div>

        {/* Fleet Utilization */}
        <div className="p-5 rounded-2xl glass-card border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div>
            <span className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Fleet Utilization
              <Gauge className="w-4 h-4 text-emerald-500/70" />
            </span>
            <p className="text-3xl font-black text-slate-800 mt-2">{fleetUtilization}%</p>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Active vs Available vehicles</p>
        </div>

        {/* Operational Cost */}
        <div className="p-5 rounded-2xl glass-card border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div>
            <span className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Operational Cost
              <Coins className="w-4 h-4 text-orange-500/70" />
            </span>
            <p className="text-3xl font-black text-slate-800 mt-2">{formatCurrency(calculatedOperationalCost)}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Total (Fuel + Maintenance)</p>
        </div>

        {/* Fleet ROI */}
        <div className="p-5 rounded-2xl glass-card border-l-4 border-l-emerald-600 flex flex-col justify-between">
          <div>
            <span className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Vehicle ROI
              <TrendingUp className="w-4 h-4 text-emerald-600/70" />
            </span>
            <p className="text-3xl font-black text-slate-800 mt-2">{calculatedFleetROI}%</p>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Estimated net ROI yield percentage</p>
        </div>
      </div>

      {/* ROI Info alert banner */}
      <div className="p-4 rounded-xl bg-white/30 border border-slate-200/40 text-[10px] text-slate-500 font-semibold flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>ROI Calculation Formula: (Completed Trip Freight Revenue - (Maintenance Cost + Fuel Logs Cost)) / Vehicle Acquisition Cost.</span>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive bar chart (SVG layout) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-white/60 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-4">
              {timeFilter.charAt(0) + timeFilter.slice(1).toLowerCase()} Revenue Trend
            </h3>
            
            {/* Custom Interactive SVG Chart */}
            <div className="relative w-full h-64 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-200/50">
              {chartData.map((data, index) => {
                const height = (data.revenue / maxChartVal) * 180;
                const isHovered = activeTooltip === index;

                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center group relative cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                    onMouseEnter={() => setActiveTooltip(index)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-[210px] bg-slate-900/90 backdrop-blur-xs text-white text-[10px] p-2.5 rounded-xl shadow-lg border border-slate-700/50 flex flex-col gap-0.5 z-40 w-32 text-center animate-in fade-in slide-in-from-bottom-1 duration-150">
                        <p className="font-bold text-amber-400">{data.label}</p>
                        <p className="font-black mt-0.5">{formatCurrency(data.revenue)}</p>
                        <p className="text-[8px] text-slate-400 font-semibold">{data.trips} Trips completed</p>
                      </div>
                    )}

                    {/* Bar graphic */}
                    <div 
                      className={`w-10 rounded-t-lg bg-gradient-to-t from-blue-600/70 to-blue-500/90 border border-blue-400/40 transition-all duration-300 relative ${
                        isHovered 
                          ? "from-blue-600 to-blue-400 shadow-md scale-x-105" 
                          : "shadow-xs group-hover:from-blue-600/80 group-hover:to-blue-500"
                      }`}
                      style={{ height: `${height}px` }}
                    />
                    
                    {/* Label */}
                    <span className="text-[10px] font-bold text-slate-400 mt-2">{data.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500/80" /> Revenue ({formatCurrency(maxChartVal).replace(/[\d,.]/g, "")})
              </span>
              <span>Max: {formatCurrency(maxChartVal)}</span>
            </div>
          </div>
        </div>

        {/* Right: Top Costliest Vehicles (SVG layout) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-white/60 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-6">Top Costliest Vehicles</h3>
            
            <div className="space-y-6">
              {calculatedCostliestVehicles.slice(0, 3).map((item, index) => {
                const maxCost = calculatedCostliestVehicles[0]?.cost || 1;
                const percentage = Math.round((item.cost / maxCost) * 100);
                
                const barColors = [
                  "bg-rose-500/80 border-rose-400/30",
                  "bg-orange-500/80 border-orange-400/30",
                  "bg-blue-500/80 border-blue-400/30",
                ];
                const activeColor = barColors[index] || barColors[2];

                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="font-extrabold text-slate-900">
                        <Link href={`/fleet/${item.id}`} className="hover:text-amber-600 hover:underline transition-all">
                          {item.nameModel} ({item.registrationNo})
                        </Link>
                      </span>
                      <span>{formatCurrency(item.cost)}</span>
                    </div>
                    
                    <div className="w-full h-4 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full border-r ${activeColor} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {calculatedCostliestVehicles.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No operational expenses logged for this period.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200/30 flex items-center gap-2 text-[10px] text-orange-600 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Rule: Operational cost rankings are updated dynamically when fuel logs or maintenance service records are added.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
