"use client";

import React, { useState } from "react";
import { Plus, MapPin, Truck, Users, Weight, Navigation, AlertTriangle, Check } from "lucide-react";
import { CapacityValidationBanner } from "./CapacityValidationBanner";

interface Vehicle {
  id: string;
  nameModel: string;
  registrationNo: string;
  maxLoadCapacityKg: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  licenseCategory: string;
  licenseExpiry: string;
  status: string;
}

interface TripFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  createTrip: (payload: {
    source: string;
    destination: string;
    vehicleId: string | null;
    driverId: string | null;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    etaMinutes: number | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function TripForm({ vehicles, drivers, createTrip }: TripFormProps) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // 1. Get ONLY available vehicles
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");

  // 2. Get ONLY available drivers with non-expired licenses
  const now = new Date();
  const availableDrivers = drivers.filter(
    (d) => d.status === "AVAILABLE" && new Date(d.licenseExpiry) >= now
  );

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const capacityExceeded =
    selectedVehicle &&
    cargoWeight &&
    Number(cargoWeight) > selectedVehicle.maxLoadCapacityKg;

  // Helper to capitalize location names (e.g. "mumbai depot" -> "Mumbai Depot")
  const capitalize = (str: string) => {
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!source || !destination || !cargoWeight || !plannedDistance) {
      setFormError("Please fill out Source, Destination, Cargo Weight, and Planned Distance.");
      return;
    }

    if (capacityExceeded) {
      setFormError("Cargo weight exceeds vehicle capacity.");
      return;
    }

    const payload = {
      source: capitalize(source.trim()),
      destination: capitalize(destination.trim()),
      vehicleId: selectedVehicleId || null,
      driverId: selectedDriverId || null,
      cargoWeightKg: Number(cargoWeight),
      plannedDistanceKm: Number(plannedDistance),
      etaMinutes: null,
    };

    const res = await createTrip(payload);
    if (res.success) {
      setFormSuccess(true);
      setSource("");
      setDestination("");
      setSelectedVehicleId("");
      setSelectedDriverId("");
      setCargoWeight("");
      setPlannedDistance("");
      setTimeout(() => setFormSuccess(false), 3000);
    } else {
      setFormError(res.error || "Failed to create trip.");
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-5 sticky top-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Plus className="w-4.5 h-4.5 text-indigo-600" />
        <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Create New Trip</h2>
      </div>

      {formError && (
        <div className="p-3 mb-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="p-3 mb-3 rounded-lg bg-green-50 border border-green-200/50 flex items-start gap-2 text-xs text-green-700">
          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <span>Trip created successfully as Draft!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Source
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai Depot"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          />
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Destination
          </label>
          <input
            type="text"
            placeholder="e.g. Pune Hub"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          />
        </div>

        {/* Vehicle Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Vehicle (Available)
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          >
            <option value="">— Select Vehicle (optional) —</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNo} — {v.nameModel} ({v.maxLoadCapacityKg} kg)
              </option>
            ))}
          </select>
        </div>

        {/* Driver Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Driver (Available)
          </label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          >
            <option value="">— Select Driver (optional) —</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.licenseCategory} (Exp: {new Date(d.licenseExpiry).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {/* Cargo Weight */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-slate-400" /> Cargo Weight (kg)
          </label>
          <input
            type="number"
            placeholder="e.g. 450"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          />
        </div>

        {/* Capacity Validation Banner */}
        <CapacityValidationBanner selectedVehicle={selectedVehicle} cargoWeight={cargoWeight} />

        {/* Planned Distance */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-slate-400" /> Planned Distance (km)
          </label>
          <input
            type="number"
            placeholder="e.g. 150"
            value={plannedDistance}
            onChange={(e) => setPlannedDistance(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!!capacityExceeded}
          className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-200/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-200 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Trip (Draft)
        </button>
      </form>
    </div>
  );
}
