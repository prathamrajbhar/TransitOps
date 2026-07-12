"use client";

import React from "react";
import Link from "next/link";
import { Eye, MapPin, ArrowRight, Truck, Users, Weight, Navigation, Clock, CheckCircle, Send, Ban } from "lucide-react";
import { TripLifecycleStepper } from "./TripLifecycleStepper";

import type { Trip, Vehicle, Driver } from "@/context/MockDataContext";

interface TripCardProps {
  trip: Trip;
  vehicleObj?: Vehicle;
  driverObj?: Driver;
  canModify: boolean;
  handleDispatch: (id: string) => void;
  handleCancel: (id: string) => void;
  onCompleteClick: (trip: Trip) => void;
}

export function TripCard({
  trip,
  vehicleObj,
  driverObj,
  canModify,
  handleDispatch,
  handleCancel,
  onCompleteClick,
}: TripCardProps) {
  // Helper to capitalize route locations (e.g. "mumbai" -> "Mumbai")
  const capitalize = (str: string) => {
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
      case "DISPATCHED":
        return "bg-blue-100/70 text-blue-700 border-blue-200/50 animate-pulse";
      case "IN_TRANSIT":
        return "bg-amber-100/70 text-amber-700 border-amber-200/50";
      case "COMPLETED":
        return "bg-green-100/70 text-green-700 border-green-200/50";
      case "CANCELLED":
        return "bg-red-100/70 text-red-700 border-red-200/50";
      default:
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/60 p-5 hover:bg-white/75 hover:shadow-lg hover:shadow-slate-200/40 hover:scale-[1.01] transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800 tracking-tight">{trip.tripCode}</span>
            <span
              className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${getStatusBadge(
                trip.status
              )}`}
            >
              {trip.status === "DRAFT" ? "PLANNED" : trip.status}
            </span>
          </div>
          <Link
            href={`/trips/${trip.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <Eye className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Route Info with typography enhancement and auto-capitalization */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-700 font-extrabold mb-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span className="text-slate-800" title={trip.source}>
              {capitalize(trip.source)}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0" />
            <span className="text-slate-800" title={trip.destination}>
              {capitalize(trip.destination)}
            </span>
          </div>
        </div>

        {/* Dynamic Stepper */}
        <TripLifecycleStepper status={trip.status} />

        {/* Details Grid - Redesigned for improved typography sizes */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-semibold text-slate-500 mt-3.5 border-t border-slate-50/50 pt-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-extrabold text-slate-700 truncate" title={vehicleObj?.nameModel}>
              {vehicleObj ? vehicleObj.registrationNo : "Not assigned"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="font-extrabold text-slate-700 truncate" title={driverObj?.name}>
              {driverObj ? driverObj.name.split(" ")[0] : "Not assigned"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-extrabold text-slate-700">
              {trip.cargoWeightKg.toLocaleString()} kg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="font-extrabold text-slate-700">
              {trip.plannedDistanceKm.toLocaleString()} km
            </span>
          </div>
          {trip.status === "DISPATCHED" && trip.etaMinutes && (
            <div className="flex items-center gap-2 col-span-2 bg-orange-50/50 border border-orange-100/50 p-2 rounded-xl mt-1">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="font-black text-orange-600">ETA: {trip.etaMinutes} mins remaining</span>
            </div>
          )}
          {trip.status === "COMPLETED" && trip.actualDistanceKm !== null && (
            <div className="flex items-center gap-2 col-span-2 bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-xl mt-1">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-black text-emerald-600">
                Actual: {trip.actualDistanceKm} km | Fuel: {trip.fuelConsumedL}L
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Only for Dispatcher/Fleet Manager) */}
      {canModify && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100/60">
          {trip.status === "DRAFT" && (
            <>
              <button
                onClick={() => handleDispatch(trip.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-500/10 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Dispatch
              </button>
              <button
                onClick={() => handleCancel(trip.id)}
                className="flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/50 rounded-xl hover:bg-rose-100/70 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" /> Cancel
              </button>
            </>
          )}
          {trip.status === "DISPATCHED" && (
            <>
              <button
                onClick={() => onCompleteClick(trip)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow-xs shadow-emerald-500/10 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Complete
              </button>
              <button
                onClick={() => handleCancel(trip.id)}
                className="flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/50 rounded-xl hover:bg-rose-100/70 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" /> Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
