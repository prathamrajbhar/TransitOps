"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVehicles } from "@/hooks/useVehicles";
import { formatCurrency, formatDistance } from "@/lib/utils/format";
import { Plus, X, ShieldAlert, AlertCircle, Search } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";

export default function FleetPage() {
  const { vehicles, addVehicle, retireVehicle } = useVehicles();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [regNo, setRegNo] = useState("");
  const [nameModel, setNameModel] = useState("");
  const [type, setType] = useState<"VAN" | "TRUCK" | "MINI" | "BUS" | "OTHER">("VAN");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acqCost, setAcqCost] = useState("");
  const [region, setRegion] = useState("West");

  // Role access check
  const { canModify } = useSettings({ module: "FLEET" });

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch = v.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.nameModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || v.type === typeFilter;
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100/70 text-green-700 border-green-200/50";
      case "ON_TRIP":
        return "bg-blue-100/70 text-blue-700 border-blue-200/50";
      case "IN_SHOP":
        return "bg-orange-100/70 text-orange-700 border-orange-200/50";
      case "RETIRED":
        return "bg-red-100/70 text-red-700 border-red-200/50";
      default:
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regNo || !nameModel || !capacity || !odometer || !acqCost) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = {
      registrationNo: regNo,
      nameModel,
      type,
      maxLoadCapacityKg: Number(capacity),
      odometerKm: Number(odometer),
      acquisitionCost: Number(acqCost),
      region,
    };

    const res = await addVehicle(payload);
    if (res.success) {
      setIsModalOpen(false);
      // Reset form
      setRegNo("");
      setNameModel("");
      setCapacity("");
      setOdometer("");
      setAcqCost("");
      setError(null);
    } else {
      setError(res.error || "An error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vehicle Registry</h2>
          <p className="text-xs text-slate-500 mt-1">Manage and track active fleet transportation assets</p>
        </div>

        {/* Add Button - Only visible if Fleet Manager */}
        {canModify && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center gap-4 border border-white/60">
        {/* Search */}
        <div className="w-64 relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search registration no / model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer"
        >
          <option value="ALL">Type: All</option>
          <option value="VAN">Van</option>
          <option value="TRUCK">Truck</option>
          <option value="MINI">Mini</option>
          <option value="BUS">Bus</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer"
        >
          <option value="ALL">Status: All</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      {/* Vehicles Grid Card Container */}
      <div className="space-y-6">
        {filteredVehicles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-xs text-slate-400 font-medium shadow-sm">
            No vehicles found matching filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Card Header */}
                <div className="p-5 pb-3 flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide border border-slate-200 font-mono">
                      {vehicle.registrationNo}
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base leading-tight pt-1">
                      <Link href={`/fleet/${vehicle.id}`} className="hover:text-amber-500 transition-all">
                        {vehicle.nameModel}
                      </Link>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider capitalize">
                      {vehicle.type.toLowerCase()}
                    </p>
                  </div>
                  
                  <span className={`inline-flex px-2.5 py-1 text-[9px] font-black border rounded-md uppercase tracking-wider ${getStatusBadge(vehicle.status)}`}>
                    {vehicle.status.replace("_", " ")}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="px-5 py-3 border-t border-b border-slate-100 bg-slate-50/50 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">
                      {vehicle.maxLoadCapacityKg >= 1000 
                        ? `${vehicle.maxLoadCapacityKg / 1000} Ton` 
                        : `${vehicle.maxLoadCapacityKg} kg`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Odometer</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5 truncate">
                      {formatDistance(vehicle.odometerKm)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acq. Cost</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5 truncate">
                      {formatCurrency(vehicle.acquisitionCost)}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 flex items-center justify-between bg-white">
                  <Link 
                    href={`/fleet/${vehicle.id}`} 
                    className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                  >
                    View Details &rarr;
                  </Link>
                  
                  {canModify && (
                    <div>
                      {vehicle.status !== "RETIRED" && vehicle.status !== "ON_TRIP" ? (
                        <button
                          onClick={() => retireVehicle(vehicle.id)}
                          className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
                        >
                          Retire Asset
                        </button>
                      ) : vehicle.status === "ON_TRIP" ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">Active Trip</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">Retired</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informative Rule Badge */}
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center gap-2 text-[10px] text-orange-600 font-semibold shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Rule: Registration No. must be unique. Retired and In Shop vehicles are excluded from Trip Dispatcher assignment options.</span>
        </div>
      </div>

      {/* Add Vehicle Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/40">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Add New Vehicle</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Reg No */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. GJ01AB4521"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              {/* Name/Model */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. VAN-05"
                  value={nameModel}
                  onChange={(e) => setNameModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "BUS" | "VAN" | "TRUCK" | "OTHER" | "MINI")}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                  >
                    <option value="VAN">Van</option>
                    <option value="TRUCK">Truck</option>
                    <option value="MINI">Mini</option>
                    <option value="BUS">Bus</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Capacity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Odometer */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 74000"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Acquisition Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Acquisition Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 620000"
                    value={acqCost}
                    onChange={(e) => setAcqCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>
              </div>

              {/* Region */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Depot Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                >
                  <option value="West">West Depot</option>
                  <option value="East">East Depot</option>
                  <option value="North">North Depot</option>
                  <option value="South">South Depot</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
