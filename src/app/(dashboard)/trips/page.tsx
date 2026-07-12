"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import type { Trip } from "@/context/MockDataContext";
import {
  Route, Plus, X, Search, AlertTriangle, Check,
  Truck, Users, MapPin, Package, Navigation,
  FileText, Send, Ban, CheckCircle, Clock,
  Eye, Weight, ArrowRight
} from "lucide-react";

export default function TripsPage() {
  const { trips, createTrip, dispatchTrip, cancelTrip, completeTrip } = useTrips();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { user } = useSession();

  // Form States
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Complete Form Modal State
  const [activeTripToComplete, setActiveTripToComplete] = useState<Trip | null>(null);
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Role access check
  const canModify = user?.role === "DISPATCHER" || user?.role === "FLEET_MANAGER";

  // Dynamic Trip Lifecycle Stepper matching the 4-step reference
  const renderTripStepper = (status: string) => {
    const steps = [
      { key: "DRAFT", label: "Planned", icon: FileText },
      { key: "DISPATCHED", label: "Dispatched", icon: Send },
      { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
      { key: "COMPLETED", label: "Delivered", icon: Check },
    ];
    const isCancelled = status === "CANCELLED";

    const statusOrder = ["DRAFT", "DISPATCHED", "IN_TRANSIT", "COMPLETED"];
    const activeIndex = status === "DISPATCHED" ? 2 : statusOrder.indexOf(status);

    const getStepStatus = (stepKey: string, index: number) => {
      if (isCancelled) {
        if (index <= 1) return "cancelled";
        return "grey";
      }
      if (index < activeIndex) return "completed";
      if (index === activeIndex) return "active";
      return "grey";
    };

    return (
      <div className="flex items-center w-full gap-1 py-2.5 text-[9px] font-bold text-slate-500 border-t border-b border-slate-100/50 my-1">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key, index);
          const StepIcon = step.icon;

          if (isCancelled && index > 1) return null;

          return (
            <React.Fragment key={step.key}>
              {index > 0 && !(isCancelled && index > 1) && (
                <div className={`flex-1 h-0.5 rounded-full ${
                  stepStatus === "completed" ? "bg-emerald-500"
                    : stepStatus === "cancelled" ? "bg-rose-400"
                    : "bg-slate-200"
                }`} />
              )}
              <div className="flex items-center gap-1 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-black text-[8px] ${
                  stepStatus === "completed"
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : stepStatus === "active"
                      ? "bg-blue-600 text-white border-blue-700 animate-pulse"
                      : stepStatus === "cancelled"
                        ? "bg-rose-500 text-white border-rose-600"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                }`}>
                  {stepStatus === "cancelled" ? (
                    <X className="w-2.5 h-2.5" />
                  ) : stepStatus === "completed" ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <StepIcon className="w-2.5 h-2.5" />
                  )}
                </div>
                <span className={
                  stepStatus === "active" ? "text-blue-600 font-extrabold"
                    : stepStatus === "completed" ? "text-emerald-600"
                    : stepStatus === "cancelled" ? "text-rose-500 font-extrabold"
                    : "text-slate-400"
                }>
                  {isCancelled && index === 1 ? "Cancelled" : step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // 1. Get ONLY available vehicles for the dispatch list
  const availableVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE"
  );

  // 2. Get ONLY available drivers with non-expired licenses
  const now = new Date();
  const availableDrivers = drivers.filter(
    (d) => d.status === "AVAILABLE" && new Date(d.licenseExpiry) >= now
  );

  // Selected Vehicle details
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Capacity validation
  const capacityExceeded =
    selectedVehicle &&
    cargoWeight &&
    Number(cargoWeight) > selectedVehicle.maxLoadCapacityKg;

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!source || !destination || !cargoWeight || !plannedDistance) {
      setFormError("Please fill out Source, Destination, Cargo Weight, and Planned Distance.");
      return;
    }

    const payload = {
      source,
      destination,
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

  const handleDispatch = async (id: string) => {
    const res = await dispatchTrip(id);
    if (!res.success) {
      alert(res.error || "Dispatch failed.");
    }
  };

  const handleCancel = async (id: string) => {
    await cancelTrip(id);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTripToComplete) return;
    setModalError(null);
    if (!finalOdometer || !fuelConsumed) {
      setModalError("Please fill out both fields.");
      return;
    }
    const res = await completeTrip(
      activeTripToComplete.id,
      Number(finalOdometer),
      Number(fuelConsumed)
    );
    if (res.success) {
      setActiveTripToComplete(null);
      setFinalOdometer("");
      setFuelConsumed("");
    } else {
      setModalError(res.error || "Failed to complete trip.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
      case "DISPATCHED":
        return "bg-blue-100/70 text-blue-700 border-blue-200/50 animate-pulse";
      case "COMPLETED":
        return "bg-green-100/70 text-green-700 border-green-200/50";
      case "CANCELLED":
        return "bg-red-100/70 text-red-700 border-red-200/50";
      default:
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200/40">
            <Route className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Trip Dispatcher</h1>
            <p className="text-[11px] text-slate-500 font-medium">Create, dispatch, and manage trips through their lifecycle</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            {trips.length} Total Trips
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            {trips.filter((t) => t.status === "DISPATCHED").length} In Transit
          </span>
        </div>
      </div>

      {/* Main Grid: Create Form + Live Board */}
      <div className={`grid gap-6 ${canModify ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>

        {/* Create Trip Form (Left Panel - Only for Dispatcher/Fleet Manager) */}
        {canModify && (
          <div className="lg:col-span-4">
            <div className="glass-panel rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-800">Create New Trip</h2>
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

              <form onSubmit={handleCreateTrip} className="space-y-3">
                {/* Source */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Depot"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune Hub"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Vehicle Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Vehicle (Available)
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Driver (Available)
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Capacity Validation Banner */}
                {selectedVehicle && cargoWeight && (
                  <div className={`p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border ${
                    capacityExceeded
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    {capacityExceeded ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exceeds capacity! {cargoWeight} kg &gt; {selectedVehicle.maxLoadCapacityKg} kg max</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Within capacity: {cargoWeight} kg / {selectedVehicle.maxLoadCapacityKg} kg</span>
                      </>
                    )}
                  </div>
                )}

                {/* Planned Distance */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Planned Distance (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-200/40 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Trip (Draft)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Live Board (Right Panel) */}
        <div className={canModify ? "lg:col-span-8" : "col-span-1"}>
          <div className="glass-panel rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-800">Live Board</h2>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input border-slate-200/70 w-44"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg glass-input border-slate-200/70"
                >
                  <option value="ALL">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Trip Cards Grid - 2 per row */}
            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <Route className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No trips found</p>
                <p className="text-xs text-slate-400 mt-1">Create a new trip to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrips.map((trip) => {
                  const vehicleObj = vehicles.find((v) => v.id === trip.vehicleId);
                  const driverObj = drivers.find((d) => d.id === trip.driverId);

                  return (
                    <div
                      key={trip.id}
                      className="glass-panel rounded-xl border border-white/60 p-4 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800">{trip.tripCode}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        <Link
                          href={`/trips/${trip.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      </div>

                      {/* Route Info */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-semibold truncate">{trip.source}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="font-semibold truncate">{trip.destination}</span>
                      </div>

                      {/* Stepper */}
                      {renderTripStepper(trip.status)}

                      {/* Details Row */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-blue-500" />
                          <span className="font-semibold truncate">
                            {vehicleObj ? `${vehicleObj.registrationNo}` : "Not assigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-violet-500" />
                          <span className="font-semibold truncate">
                            {driverObj ? driverObj.name : "Not assigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Weight className="w-3 h-3 text-amber-500" />
                          <span className="font-semibold">{trip.cargoWeightKg} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3 h-3 text-teal-500" />
                          <span className="font-semibold">{trip.plannedDistanceKm} km</span>
                        </div>
                        {trip.status === "DISPATCHED" && trip.etaMinutes && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="font-bold text-orange-600">ETA: {trip.etaMinutes} min</span>
                          </div>
                        )}
                        {trip.status === "COMPLETED" && trip.actualDistanceKm !== null && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="font-bold text-emerald-600">
                              Actual: {trip.actualDistanceKm} km | Fuel: {trip.fuelConsumedL}L
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons (Only for Dispatcher/Fleet Manager) */}
                      {canModify && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100/50">
                          {trip.status === "DRAFT" && (
                            <>
                              <button
                                onClick={() => handleDispatch(trip.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all"
                              >
                                <Send className="w-3 h-3" /> Dispatch
                              </button>
                              <button
                                onClick={() => handleCancel(trip.id)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
                              >
                                <Ban className="w-3 h-3" /> Cancel
                              </button>
                            </>
                          )}
                          {trip.status === "DISPATCHED" && (
                            <>
                              <button
                                onClick={() => {
                                  setActiveTripToComplete(trip);
                                  setFinalOdometer("");
                                  setFuelConsumed("");
                                  setModalError(null);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg hover:from-emerald-700 hover:to-green-700 shadow-sm transition-all"
                              >
                                <CheckCircle className="w-3 h-3" /> Complete
                              </button>
                              <button
                                onClick={() => handleCancel(trip.id)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
                              >
                                <Ban className="w-3 h-3" /> Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {activeTripToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl border border-white/60 shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Complete Trip {activeTripToComplete.tripCode}
              </h3>
              <button
                onClick={() => setActiveTripToComplete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 mt-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Start Odometer reference */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-500 space-y-1">
                Vehicle: {vehicles.find(v => v.id === activeTripToComplete.vehicleId)?.nameModel || ""} <br />
                Starting Odometer: {vehicles.find(v => v.id === activeTripToComplete.vehicleId)?.odometerKm.toLocaleString()} km
              </div>

              {/* Final Odometer */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Final Odometer Reading (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 74045"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              {/* Fuel Consumed */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fuel Consumed (Liters)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setActiveTripToComplete(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200/40 transition-colors"
                >
                  Complete Trip &amp; Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
