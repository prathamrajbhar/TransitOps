"use client";

import React, { useState } from "react";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import type { Trip } from "@/context/MockDataContext";
import { Route } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

// Subcomponents
import { TripForm } from "@/components/trips/TripForm";
import { LiveBoard } from "@/components/trips/LiveBoard";
import { CompleteTripModal } from "@/components/trips/CompleteTripModal";

export default function TripsPage() {
  const { trips, createTrip, dispatchTrip, cancelTrip, completeTrip } = useTrips();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  // Complete Form Modal State
  const [activeTripToComplete, setActiveTripToComplete] = useState<Trip | null>(null);

  // Role access check
  const { canModify } = useSettings({ module: "TRIPS" });

  const handleDispatch = async (id: string) => {
    const res = await dispatchTrip(id);
    if (!res.success) {
      alert(res.error || "Dispatch failed.");
    }
  };

  const handleCancel = async (id: string) => {
    await cancelTrip(id);
  };

  const handleCompleteSubmit = async (finalOdometer: number, fuelConsumed: number) => {
    if (!activeTripToComplete) return { success: false, error: "No active trip" };
    return await completeTrip(activeTripToComplete.id, finalOdometer, fuelConsumed);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200/40">
            <Route className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trip Dispatcher</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Create, dispatch, and manage trips through their lifecycle
            </p>
          </div>
        </div>

        {/* Header Stats Counter */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-600 shadow-xs">
            {trips.length} Total Trips
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-600 shadow-xs">
            {trips.filter((t) => t.status === "DISPATCHED").length} In Transit
          </span>
        </div>
      </div>

      {/* Main Grid: Create Form + Live Board */}
      <div className={`grid gap-6 ${canModify ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Create Trip Form (Left Panel - Only for Dispatcher/Fleet Manager) */}
        {canModify && (
          <div className="lg:col-span-4">
            <TripForm vehicles={vehicles} drivers={drivers} createTrip={createTrip} />
          </div>
        )}

        {/* Live Board (Right Panel) */}
        <div className={canModify ? "lg:col-span-8" : "col-span-1"}>
          <LiveBoard
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            canModify={canModify}
            handleDispatch={handleDispatch}
            handleCancel={handleCancel}
            onCompleteClick={setActiveTripToComplete}
          />
        </div>
      </div>

      {/* Complete Trip Modal Overlay */}
      {activeTripToComplete && (
        <CompleteTripModal
          activeTripToComplete={activeTripToComplete}
          vehicles={vehicles}
          onClose={() => setActiveTripToComplete(null)}
          onSubmit={handleCompleteSubmit}
        />
      )}
    </div>
  );
}
