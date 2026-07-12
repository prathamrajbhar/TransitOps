"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useMockData } from "@/context/MockDataContext";
import { Truck, ArrowLeft, Fuel, Wrench, ShieldAlert } from "lucide-react";

export default function VehicleDetailPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const router = useRouter();
  const { vehicleId } = use(params);
  const { vehicles, fuelLogs, maintenanceLogs, formatCurrency, formatDistance } = useMockData();

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/fleet")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </button>
        <div className="p-8 rounded-2xl glass-panel text-center border border-white/60">
          <p className="text-sm font-semibold text-slate-500">Vehicle not found.</p>
        </div>
      </div>
    );
  }

  const vehicleFuel = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const vehicleMaint = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "ON_TRIP":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_SHOP":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "RETIRED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };


  // Dynamic Vehicle Lifecycle Stepper
  const renderVehicleLifecycle = (status: string) => {
    const isRetired = status === "RETIRED";
    
    return (
      <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
        <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2">Asset Lifecycle Status</h3>
        <div className="flex items-center w-full gap-2 py-2 text-xs font-bold text-slate-500">
          
          {/* Step 1: Available */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-black text-[10px]
              ${status === "AVAILABLE"
                ? "bg-green-500 text-white border-green-600 animate-pulse" 
                : status === "ON_TRIP" || status === "IN_SHOP"
                ? "bg-green-500 text-white border-green-600"
                : "bg-slate-100 text-slate-400 border-slate-200"}`}>
              ✓
            </div>
            <span className={status === "AVAILABLE" ? "text-green-600 font-extrabold" : "text-slate-400"}>Available</span>
          </div>

          <div className={`flex-1 h-0.5 rounded-full ${status === "ON_TRIP" || status === "IN_SHOP" ? "bg-green-500" : "bg-slate-200"}`} />

          {/* Step 2: On Trip */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-black text-[10px]
              ${status === "ON_TRIP"
                ? "bg-blue-600 text-white border-blue-700 animate-pulse" 
                : status === "ON_TRIP" || status === "IN_SHOP"
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-slate-100 text-slate-400 border-slate-200"}`}>
              {status === "ON_TRIP" ? "•" : "2"}
            </div>
            <span className={status === "ON_TRIP" ? "text-blue-600 font-extrabold" : "text-slate-400"}>On Trip</span>
          </div>

          <div className={`flex-1 h-0.5 rounded-full ${status === "IN_SHOP" ? "bg-green-500" : "bg-slate-200"}`} />

          {/* Step 3: In Shop */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-black text-[10px]
              ${status === "IN_SHOP"
                ? "bg-orange-500 text-white border-orange-600 animate-pulse" 
                : "bg-slate-100 text-slate-400 border-slate-200"}`}>
              {status === "IN_SHOP" ? "•" : "3"}
            </div>
            <span className={status === "IN_SHOP" ? "text-orange-600 font-extrabold" : "text-slate-400"}>In Shop</span>
          </div>

          {isRetired && (
            <>
              <div className="flex-1 h-0.5 rounded-full bg-rose-400" />
              {/* Step 4: Retired */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] bg-rose-500 text-white border border-rose-600 animate-pulse">
                  ✕
                </div>
                <span className="text-rose-600 font-extrabold">Retired</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/fleet")}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vehicle Registry
      </button>

      {/* Header card info */}
      <div className="p-6 rounded-2xl glass-panel border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Truck className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{vehicle.nameModel}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Reg. No: {vehicle.registrationNo}</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold border rounded-full uppercase tracking-wider ${getStatusBadge(vehicle.status)}`}>
          {vehicle.status.replace("_", " ")}
        </span>
      </div>

      {/* Lifecycle Stepper */}
      {renderVehicleLifecycle(vehicle.status)}

      {/* Specification details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Specs */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2">Asset Details</h3>
          <div className="space-y-3 text-xs text-slate-700 font-medium">
            <div className="flex justify-between"><span className="text-slate-400">Category Type:</span> <span className="font-bold uppercase">{vehicle.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Load Capacity:</span> <span className="font-bold">{vehicle.maxLoadCapacityKg >= 1000 ? `${vehicle.maxLoadCapacityKg/1000} Ton` : `${vehicle.maxLoadCapacityKg} kg`}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Current Odometer:</span> <span className="font-bold">{formatDistance(vehicle.odometerKm)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Acquisition Cost:</span> <span className="font-bold">{formatCurrency(vehicle.acquisitionCost)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Depot Hub Location:</span> <span className="font-bold">{vehicle.region} Depot</span></div>
          </div>
        </div>

        {/* Card 2: Fuel logs history */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2 flex items-center justify-between">
            <span>Fuel Refuels</span>
            <Fuel className="w-4 h-4 text-blue-500" />
          </h3>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {vehicleFuel.map((fuel) => (
              <div key={fuel.id} className="text-xs flex justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="font-bold text-slate-800">{fuel.liters} Liters</p>
                  <p className="text-[9px] text-slate-400">{new Date(fuel.date).toLocaleDateString()}</p>
                </div>
                <span className="font-extrabold text-slate-900">{formatCurrency(fuel.cost)}</span>
              </div>
            ))}
            {vehicleFuel.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No refuel logs found.</p>
            )}
          </div>
        </div>

        {/* Card 3: Maintenance history */}
        <div className="p-6 rounded-2xl glass-panel border border-white/60 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200/40 pb-2 flex items-center justify-between">
            <span>Maintenance Logs</span>
            <Wrench className="w-4 h-4 text-orange-500" />
          </h3>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {vehicleMaint.map((maint) => (
              <div key={maint.id} className="text-xs flex justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="font-bold text-slate-800">{maint.serviceType}</p>
                  <p className="text-[9px] text-slate-400">{new Date(maint.serviceDate).toLocaleDateString()} • {maint.status.replace("_", " ")}</p>
                </div>
                <span className="font-extrabold text-slate-900">{formatCurrency(maint.cost)}</span>
              </div>
            ))}
            {vehicleMaint.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No service records found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
