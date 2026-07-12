"use client";

import React, { useState } from "react";
import { CheckCircle, X, AlertTriangle } from "lucide-react";

import type { Trip, Vehicle } from "@/context/MockDataContext";

interface CompleteTripModalProps {
  activeTripToComplete: Trip;
  vehicles: Vehicle[];
  onClose: () => void;
  onSubmit: (finalOdometer: number, fuelConsumed: number) => Promise<{ success: boolean; error?: string }>;
}

export function CompleteTripModal({
  activeTripToComplete,
  vehicles,
  onClose,
  onSubmit,
}: CompleteTripModalProps) {
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleObj = vehicles.find((v) => v.id === activeTripToComplete.vehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!finalOdometer || !fuelConsumed) {
      setModalError("Please fill out both fields.");
      return;
    }

    const odoValue = Number(finalOdometer);
    const fuelValue = Number(fuelConsumed);

    if (vehicleObj && odoValue <= vehicleObj.odometerKm) {
      setModalError(`Final odometer must be greater than starting odometer (${vehicleObj.odometerKm.toLocaleString()} km).`);
      return;
    }

    setIsSubmitting(true);
    const res = await onSubmit(odoValue, fuelValue);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setModalError(res.error || "Failed to complete trip.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-panel rounded-2xl border border-white/60 shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
            Complete Trip {activeTripToComplete.tripCode}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Start Odometer reference */}
          {vehicleObj && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-500 space-y-1">
              <span className="font-extrabold text-slate-700">Vehicle:</span> {vehicleObj.nameModel} <br />
              <span className="font-extrabold text-slate-700">Starting Odometer:</span> {vehicleObj.odometerKm.toLocaleString()} km
            </div>
          )}

          {/* Final Odometer */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Final Odometer Reading (km)
            </label>
            <input
              type="number"
              placeholder={`e.g. ${vehicleObj ? vehicleObj.odometerKm + 100 : 74000}`}
              value={finalOdometer}
              onChange={(e) => setFinalOdometer(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
            />
          </div>

          {/* Fuel Consumed */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Fuel Consumed (Liters)
            </label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={fuelConsumed}
              onChange={(e) => setFuelConsumed(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Completing..." : "Complete Trip & Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
