"use client";

import React, { useState } from "react";
import { Package, Search, Route } from "lucide-react";
import { TripCard } from "./TripCard";

import type { Trip, Vehicle, Driver } from "@/context/MockDataContext";

interface LiveBoardProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  canModify: boolean;
  handleDispatch: (id: string) => void;
  handleCancel: (id: string) => void;
  onCompleteClick: (trip: Trip) => void;
}

export function LiveBoard({
  trips,
  vehicles,
  drivers,
  canModify,
  handleDispatch,
  handleCancel,
  onCompleteClick,
}: LiveBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-panel rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4.5 h-4.5 text-blue-600" />
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Live Board</h2>
        </div>

        {/* Search and Filter Row */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl glass-input border-slate-200/70 w-44 sm:w-52 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl glass-input border-slate-200/70 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Planned</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trip Cards Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-16 bg-white/20 rounded-2xl border border-dashed border-slate-200/60">
          <Route className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-extrabold text-slate-400">No matching trips found</p>
          <p className="text-xs text-slate-400 mt-1">Refine your search criteria or add a new trip</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => {
            const vehicleObj = vehicles.find((v) => v.id === trip.vehicleId);
            const driverObj = drivers.find((d) => d.id === trip.driverId);

            return (
              <TripCard
                key={trip.id}
                trip={trip}
                vehicleObj={vehicleObj}
                driverObj={driverObj}
                canModify={canModify}
                handleDispatch={handleDispatch}
                handleCancel={handleCancel}
                onCompleteClick={onCompleteClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
