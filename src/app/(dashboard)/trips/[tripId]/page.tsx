"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useMockData } from "@/context/MockDataContext";
import { Route, ArrowLeft, Truck, Users, Compass, HelpCircle } from "lucide-react";

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const { tripId } = use(params);
  const { trips, vehicles, drivers } = useMockData();

  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/trips")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dispatcher
        </button>
        <div className="p-8 rounded-2xl glass-panel text-center border border-white/60">
          <p className="text-sm font-semibold text-slate-500">Trip not found.</p>
        </div>
      </div>
    );
  }

  const vehicleObj = vehicles.find((v) => v.id === trip.vehicleId);
  const driverObj = drivers.find((d) => d.id === trip.driverId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/trips")}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Live Board
      </button>

      {/* Header card info */}
      <div className="p-6 rounded-2xl glass-panel border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Compass className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Trip Dispatch Logs: {trip.tripCode}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Status Audit Trail</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold border rounded-full uppercase tracking-wider ${getStatusBadge(trip.status)}`}>
          {trip.status}
        </span>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Specs 1: Trip Route info */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2">Logistics Routing</h3>
          <div className="space-y-3 text-xs text-slate-700 font-medium">
            <div className="flex justify-between"><span className="text-slate-400">Starting Source:</span> <span className="font-bold">{trip.source}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Destination:</span> <span className="font-bold">{trip.destination}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Cargo Net Weight:</span> <span className="font-bold">{trip.cargoWeightKg} kg</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Planned Distance:</span> <span className="font-bold">{trip.plannedDistanceKm} km</span></div>
          </div>
        </div>

        {/* Specs 2: Assigned Vehicle details */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2 flex items-center justify-between">
            <span>Vehicle Specifications</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </h3>
          {vehicleObj ? (
            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex justify-between"><span className="text-slate-400">Vehicle Model:</span> <span className="font-bold">{vehicleObj.nameModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Registration Number:</span> <span className="font-bold">{vehicleObj.registrationNo}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Type Category:</span> <span className="font-bold uppercase">{vehicleObj.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Max Capacity Limit:</span> <span className="font-bold">{vehicleObj.maxLoadCapacityKg} kg</span></div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No vehicle linked to this trip record.</p>
          )}
        </div>

        {/* Specs 3: Assigned Driver details */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2 flex items-center justify-between">
            <span>Driver Specifications</span>
            <Users className="w-4 h-4 text-blue-500" />
          </h3>
          {driverObj ? (
            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex justify-between"><span className="text-slate-400">Driver Name:</span> <span className="font-bold">{driverObj.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">License Number:</span> <span className="font-bold">{driverObj.licenseNo}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Category Authorization:</span> <span className="font-bold">{driverObj.licenseCategory}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Safety Compliance Score:</span> <span className="font-bold text-emerald-600">{driverObj.safetyScore}</span></div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No driver assigned to this trip record.</p>
          )}
        </div>

      </div>

      {/* Completion report summary */}
      {trip.status === "COMPLETED" && (
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200/40 pb-2">Trip Completion Log Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700 font-medium">
            <div className="flex justify-between border-b border-slate-100 pb-2 md:border-0 md:pb-0"><span className="text-slate-400">Actual Distance Traveled:</span> <span className="font-bold">{trip.actualDistanceKm} km</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-2 md:border-0 md:pb-0"><span className="text-slate-400">Fuel Consumed:</span> <span className="font-bold text-blue-600">{trip.fuelConsumedL} Liters</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Estimated Fuel Efficiency:</span> <span className="font-bold text-emerald-600">{trip.actualDistanceKm && trip.fuelConsumedL ? (Math.round((trip.actualDistanceKm / trip.fuelConsumedL) * 10) / 10) : 0} km/L</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
