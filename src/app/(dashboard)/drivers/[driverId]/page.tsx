"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useMockData } from "@/context/MockDataContext";
import { ArrowLeft, Award } from "lucide-react";

export default function DriverDetailPage({ params }: { params: Promise<{ driverId: string }> }) {
  const router = useRouter();
  const { driverId } = use(params);
  const { drivers, trips, vehicles } = useMockData();

  const driver = drivers.find((d) => d.id === driverId);

  if (!driver) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/drivers")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Drivers
        </button>
        <div className="p-8 rounded-2xl glass-panel text-center border border-white/60">
          <p className="text-sm font-semibold text-slate-500">Driver not found.</p>
        </div>
      </div>
    );
  }

  const driverTrips = trips.filter((t) => t.driverId === driver.id);
  const completedCount = driverTrips.filter(t => t.status === "COMPLETED").length;
  const tripCompletionRate = driverTrips.length > 0
    ? Math.round((completedCount / driverTrips.length) * 100)
    : 100; // default to 100 if no trips

  const isExpired = new Date(driver.licenseExpiry) < new Date();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "ON_TRIP":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "OFF_DUTY":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "SUSPENDED":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/drivers")}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Drivers &amp; Safety Profiles
      </button>

      {/* Header Info */}
      <div className="p-6 rounded-2xl glass-panel border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shadow-sm text-lg">
            {driver.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{driver.name}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Contact: {driver.contactNumber} | Email: {driver.email}</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold border rounded-full uppercase tracking-wider ${getStatusBadge(driver.status)}`}>
          {driver.status.replace("_", " ")}
        </span>
      </div>

      {/* Driver specs grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Specs 1: Licenses */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2">Compliance Details</h3>
          <div className="space-y-3 text-xs text-slate-700 font-medium">
            <div className="flex justify-between"><span className="text-slate-400">License Number:</span> <span className="font-bold">{driver.licenseNo}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">License Category:</span> <span className="font-bold">{driver.licenseCategory}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-400">License Expiry:</span> 
              <span className={`font-bold ${isExpired ? "text-red-600 font-black animate-pulse" : ""}`}>
                {new Date(driver.licenseExpiry).toLocaleDateString()} {isExpired && "(EXPIRED)"}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-slate-400">Trip Completion %:</span> <span className="font-bold">{tripCompletionRate}%</span></div>
          </div>
        </div>

        {/* Specs 2: Safety Audit */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2 flex items-center justify-between">
              <span>Safety Audit Score</span>
              <Award className="w-4 h-4 text-amber-500" />
            </h3>
            <div className="flex items-center gap-4 py-3">
              <span className="text-4xl font-black text-slate-800">{driver.safetyScore}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Excellent</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold leading-normal">
            Safety Score represents rating evaluation based on speed limit audits, compliance reporting, and freight dispatch delivery checklists.
          </p>
        </div>

        {/* Specs 3: Assigned Trips */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2">Linked Trip Logs</h3>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {driverTrips.map((trip) => {
              const linkedVeh = vehicles.find((v) => v.id === trip.vehicleId);
              return (
                <div key={trip.id} className="text-xs flex justify-between border-b border-slate-100 pb-2">
                  <div>
                    <p className="font-bold text-slate-800">{trip.tripCode}</p>
                    <p className="text-[9px] text-slate-400">{trip.source} &rarr; {trip.destination}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-slate-700">{linkedVeh?.nameModel || "—"}</span>
                    <span className="text-[9px] text-slate-400 font-medium capitalize">{trip.status.toLowerCase()}</span>
                  </div>
                </div>
              );
            })}
            {driverTrips.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No associated trip records.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
