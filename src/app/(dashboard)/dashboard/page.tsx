"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMockData } from "@/context/MockDataContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Map, 
  TrendingUp, 
  Clock, 
  Users,
  Search,
  Filter,
  Coins,
  Award,
  ShieldAlert,
  Fuel
} from "lucide-react";

export default function DashboardPage() {
  const { 
    vehicles, 
    drivers, 
    trips, 
    maintenanceLogs, 
    fuelLogs, 
    expenses, 
    settings, 
    currentUser,
    formatCurrency,
    formatDistance
  } = useMockData();
  const { fleetUtilization, fuelEfficiency, fleetROI } = useAnalytics();

  // Safety Officer calculations
  const suspendedDriversCount = drivers.filter((d) => d.status === "SUSPENDED").length;
  const avgSafetyScore = drivers.length > 0 
    ? Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length) 
    : 100;
  const expiredLicensesCount = drivers.filter((d) => new Date(d.licenseExpiry) < new Date()).length;
  const availDriversCount = drivers.filter((d) => d.status === "AVAILABLE").length;

  // Financial Analyst calculations
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + Number(f.cost), 0);
  const totalMaintCost = maintenanceLogs.reduce((acc, m) => acc + Number(m.cost), 0);
  const totalOpCost = totalFuelCost + totalMaintCost;
  
  const getTripRevenue = (t: any) => {
    if (t.status !== "COMPLETED") return 0;
    const distance = Number(t.actualDistanceKm || t.plannedDistanceKm || 0);
    const weight = Number(t.cargoWeightKg || 0);
    return distance * (weight * 0.15 + 20);
  };
  const totalRevenue = trips
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, t) => acc + getTripRevenue(t), 0) + 550000;

  // Filters State
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");

  // 1. Apply filters to vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchType = vehicleTypeFilter === "ALL" || v.type === vehicleTypeFilter;
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchRegion = regionFilter === "ALL" || v.region.toUpperCase() === regionFilter.toUpperCase();
    return matchType && matchStatus && matchRegion;
  });

  // Calculate dynamic KPIs based on filtered set
  const totalVehiclesCount = filteredVehicles.filter(v => v.status !== "RETIRED").length;
  const activeVehCount = filteredVehicles.filter(v => v.status === "ON_TRIP").length;
  const availVehCount = filteredVehicles.filter(v => v.status === "AVAILABLE").length;
  const shopVehCount = filteredVehicles.filter(v => v.status === "IN_SHOP").length;
  const retiredVehCount = filteredVehicles.filter(v => v.status === "RETIRED").length;

  // Filtered trips depending on filtered vehicles
  const filteredTrips = trips.filter((t) => {
    if (!t.vehicleId) return true; // Draft/unassigned trips
    const vehicle = vehicles.find((v) => v.id === t.vehicleId);
    if (!vehicle) return false;
    
    const matchType = vehicleTypeFilter === "ALL" || vehicle.type === vehicleTypeFilter;
    const matchRegion = regionFilter === "ALL" || vehicle.region.toUpperCase() === regionFilter.toUpperCase();
    return matchType && matchRegion;
  });

  const activeTripsCount = filteredTrips.filter(t => t.status === "DISPATCHED").length;
  const pendingTripsCount = filteredTrips.filter(t => t.status === "DRAFT").length;

  // Drivers on duty
  const driversOnDuty = drivers.filter(d => d.status === "AVAILABLE" || d.status === "ON_TRIP").length;

  // Dynamic Utilization based on filters
  const dynamicUtilization = totalVehiclesCount > 0 
    ? Math.round((activeVehCount / totalVehiclesCount) * 100) 
    : 0;

  // Get status color styling for badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPATCHED":
      case "ON_TRIP":
      case "On Trip":
        return "bg-blue-100/70 text-blue-700 border-blue-200/50";
      case "COMPLETED":
      case "Completed":
        return "bg-green-100/70 text-green-700 border-green-200/50";
      case "DRAFT":
      case "Draft":
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
      case "CANCELLED":
      case "Cancelled":
        return "bg-red-100/70 text-red-700 border-red-200/50";
      case "IN_SHOP":
      case "In Shop":
        return "bg-orange-100/70 text-orange-700 border-orange-200/50";
      default:
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
    }
  };



  const renderKpis = () => {
    if (!currentUser) return null;
    const role = currentUser.role;

    switch (role) {
      case "FLEET_MANAGER":
        return (
          <>
            {/* Active Vehicles */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Vehicles</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{activeVehCount}</span>
                <Activity className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Available Vehicles */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available Vehicles</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{availVehCount}</span>
                <CheckCircle className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
            {/* In Shop */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-orange-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">In Maintenance</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{shopVehCount}</span>
                <AlertTriangle className="w-5 h-5 text-orange-500/70" />
              </div>
            </div>
            {/* Drivers on Duty */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Drivers on Duty</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{driversOnDuty}</span>
                <Users className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Utilization */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Utilization %</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{dynamicUtilization}%</span>
                <TrendingUp className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
            {/* Maint Cost */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-amber-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Maintenance Cost</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-black text-slate-800 mt-2 block truncate">{formatCurrency(totalMaintCost)}</span>
                <Coins className="w-5 h-5 text-amber-500/70 absolute right-4 bottom-4" />
              </div>
            </div>
          </>
        );

      case "DISPATCHER":
        return (
          <>
            {/* Active Trips */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Trips</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{activeTripsCount}</span>
                <Map className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Pending Trips */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-sky-400 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Trips</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{pendingTripsCount}</span>
                <Clock className="w-5 h-5 text-sky-400/70" />
              </div>
            </div>
            {/* Active Vehicles */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Vehicles</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{activeVehCount}</span>
                <Activity className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Available Vehicles */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available Vehicles</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{availVehCount}</span>
                <CheckCircle className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
            {/* Drivers on Duty */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Drivers on Duty</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{driversOnDuty}</span>
                <Users className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Utilization */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Utilization %</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{dynamicUtilization}%</span>
                <TrendingUp className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
          </>
        );

      case "SAFETY_OFFICER":
        return (
          <>
            {/* Drivers on Duty */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Drivers on Duty</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{driversOnDuty}</span>
                <Users className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Available Drivers */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available Drivers</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{availDriversCount}</span>
                <CheckCircle className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
            {/* Suspended Drivers */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-orange-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suspended Drivers</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800 text-orange-600">{suspendedDriversCount}</span>
                <AlertTriangle className="w-5 h-5 text-orange-500/70" />
              </div>
            </div>
            {/* Average Safety Score */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-amber-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Safety Score</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800 text-emerald-600">{avgSafetyScore}</span>
                <Award className="w-5 h-5 text-amber-500/70" />
              </div>
            </div>
            {/* Expired Licenses */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-rose-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expired Licenses</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-3xl font-black ${expiredLicensesCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                  {expiredLicensesCount}
                </span>
                <ShieldAlert className="w-5 h-5 text-rose-500/70" />
              </div>
            </div>
            {/* Active Trips */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Trips</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{activeTripsCount}</span>
                <Map className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
          </>
        );

      case "FINANCIAL_ANALYST":
        return (
          <>
            {/* Total Op Cost */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-orange-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Op Cost</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-black text-slate-800 mt-2 block truncate">{formatCurrency(totalOpCost)}</span>
                <Coins className="w-5 h-5 text-orange-500/70 absolute right-4 bottom-4" />
              </div>
            </div>
            {/* Fuel Cost */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-500 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fuel Cost Rollup</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-black text-slate-800 mt-2 block truncate">{formatCurrency(totalFuelCost)}</span>
                <Fuel className="w-5 h-5 text-blue-500/70 absolute right-4 bottom-4" />
              </div>
            </div>
            {/* Maint Cost */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-amber-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Maintenance Cost</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-black text-slate-800 mt-2 block truncate">{formatCurrency(totalMaintCost)}</span>
                <Coins className="w-5 h-5 text-amber-500/70 absolute right-4 bottom-4" />
              </div>
            </div>
            {/* Fuel Efficiency */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fuel Efficiency</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{fuelEfficiency} <span className="text-xs text-slate-500">km/l</span></span>
                <TrendingUp className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>
            {/* Fleet ROI */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-emerald-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fleet ROI %</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-800">{fleetROI}%</span>
                <TrendingUp className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>
            {/* Freight Revenue */}
            <div className="p-4 rounded-2xl glass-card flex flex-col justify-between border-l-4 border-l-blue-600 relative overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Freight Revenue</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-black text-slate-800 mt-2 block truncate">{formatCurrency(totalRevenue)}</span>
                <Coins className="w-5 h-5 text-blue-500/70 absolute right-4 bottom-4" />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time status metrics and logistics control</p>
      </div>

      {/* Filter Bar Panel */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center gap-4 border border-white/60">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Vehicle Type */}
          <div className="flex flex-col gap-1">
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">Vehicle Type: All</option>
              <option value="VAN">Van</option>
              <option value="TRUCK">Truck</option>
              <option value="MINI">Mini</option>
              <option value="BUS">Bus</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
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

          {/* Region */}
          <div className="flex flex-col gap-1">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">Region: All</option>
              <option value="WEST">West Depot</option>
              <option value="EAST">East Depot</option>
              <option value="NORTH">North Depot</option>
              <option value="SOUTH">South Depot</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {renderKpis()}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Recent Trips Table */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-white/60">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-4">Recent Trips</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Trip</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2">ETA / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredTrips.slice(0, 5).map((trip) => {
                  const vehicleObj = vehicles.find((v) => v.id === trip.vehicleId);
                  const driverObj = drivers.find((d) => d.id === trip.driverId);
                  return (
                    <tr key={trip.id} className="text-xs text-slate-700 hover:bg-white/20 transition-colors">
                      <td className="py-3.5 pl-2 font-black text-slate-900">
                        <Link href={`/trips/${trip.id}`} className="hover:text-amber-600 hover:underline transition-all">
                          {trip.tripCode}
                        </Link>
                      </td>
                      <td className="py-3.5 font-semibold">
                        {vehicleObj ? (
                          <Link href={`/fleet/${vehicleObj.id}`} className="hover:text-amber-600 hover:underline transition-all">
                            {vehicleObj.nameModel}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="py-3.5">
                        {driverObj ? (
                          <Link href={`/drivers/${driverObj.id}`} className="hover:text-amber-600 hover:underline transition-all">
                            {driverObj.name}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold border rounded-md uppercase tracking-wider ${getStatusBadge(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 font-medium text-slate-500">
                        {trip.status === "DISPATCHED" && trip.etaMinutes ? `${trip.etaMinutes} min` : ""}
                        {trip.status === "COMPLETED" && "—"}
                        {trip.status === "DRAFT" && "Awaiting vehicle"}
                        {trip.status === "CANCELLED" && "Cancelled"}
                      </td>
                    </tr>
                  );
                })}
                {filteredTrips.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No recent trips found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Vehicle status breakdown */}
        <div className="rounded-2xl glass-panel p-6 border border-white/60 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-6">Vehicle Status</h3>
            
            <div className="space-y-5">
              {/* Available */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span>{availVehCount} ({totalVehiclesCount > 0 ? Math.round(availVehCount / totalVehiclesCount * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalVehiclesCount > 0 ? (availVehCount / totalVehiclesCount * 100) : 0}%` }} 
                  />
                </div>
              </div>

              {/* On Trip */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    On Trip
                  </span>
                  <span>{activeVehCount} ({totalVehiclesCount > 0 ? Math.round(activeVehCount / totalVehiclesCount * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalVehiclesCount > 0 ? (activeVehCount / totalVehiclesCount * 100) : 0}%` }} 
                  />
                </div>
              </div>

              {/* In Shop */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    In Shop
                  </span>
                  <span>{shopVehCount} ({totalVehiclesCount > 0 ? Math.round(shopVehCount / totalVehiclesCount * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalVehiclesCount > 0 ? (shopVehCount / totalVehiclesCount * 100) : 0}%` }} 
                  />
                </div>
              </div>

              {/* Retired */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Retired
                  </span>
                  <span>{retiredVehCount}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100/50 border border-slate-200/20 overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${vehicles.length > 0 ? (retiredVehCount / vehicles.length * 100) : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200/30 text-[10px] text-slate-400 leading-normal font-semibold">
            * Retired vehicles are kept for record but omitted from fleet capacity and active logistics dispatch schedules.
          </div>
        </div>
      </div>
    </div>
  );
}
