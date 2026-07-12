"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import { useVehicles } from "@/hooks/useVehicles";
import { useMaintenance } from "@/hooks/useMaintenance";
import { formatCurrency } from "@/lib/utils/format";
import { ShieldAlert, AlertCircle, CheckCircle2, Hammer } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";

export default function MaintenancePage() {
  const { user } = useSession();
  const { vehicles } = useVehicles();
  const { maintenanceLogs, addMaintenanceLog, completeMaintenanceLog } = useMaintenance();

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("Oil Change");
  const [cost, setCost] = useState("2500");
  const [serviceDate, setServiceDate] = useState("2026-07-12");
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED'>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const { canModify } = useSettings({ module: "MAINTENANCE" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicleId || !serviceType || !cost || !serviceDate) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = {
      vehicleId: selectedVehicleId,
      serviceType,
      cost: Number(cost),
      serviceDate: new Date(serviceDate).toISOString(),
      status,
    };

    const res = await addMaintenanceLog(payload);
    if (res.success) {
      // Reset form
      setSelectedVehicleId("");
      setServiceType("Oil Change");
      setCost("2500");
      setError(null);
    } else {
      setError(res.error || "An error occurred.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance Logs</h2>
        <p className="text-xs text-slate-500 mt-1">Schedule servicing, log repair costs, and manage shop status</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form - Only enabled for Fleet Manager */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-white/60">
          <div className="flex items-center gap-2 mb-6">
            <Hammer className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Log Service Record</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* View Mode Warning Notice */}
            {!canModify && (
              <div className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200/40 text-center text-xs text-slate-400 font-semibold leading-normal">
                You do not have write permissions for Maintenance modules. <br />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">View Mode Only</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Vehicle */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold appearance-none"
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.filter(v => v.status !== "RETIRED").map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nameModel} ({v.registrationNo}) - Current status: {v.status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Type</label>
              <input
                type="text"
                placeholder="e.g. Oil Change, Engine Repair"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Cost */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Cost</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  disabled={!canModify}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  disabled={!canModify}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "COMPLETED")}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold appearance-none"
              >
                <option value="ACTIVE">Active (Send to Shop)</option>
                <option value="COMPLETED">Completed (Log Expense only)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canModify}
              className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-amber-500 hover:bg-amber-600 shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              Save Log &amp; Update Vehicle
            </button>

            {/* Annotations */}
            <div className="mt-6 p-3 rounded-xl bg-slate-50/50 border border-slate-200/30 text-[10px] space-y-1.5 font-medium leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-emerald-600 font-bold">Available</span>
                <span>&rarr;</span>
                <span>[creating active record]</span>
                <span>&rarr;</span>
                <span className="text-orange-600 font-bold">In Shop</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-orange-600 font-bold">In Shop</span>
                <span>&rarr;</span>
                <span>[closing active record]</span>
                <span>&rarr;</span>
                <span className="text-emerald-600 font-bold">Available</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Service Logs Table */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-white/60">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-6">Service Logs</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Vehicle</th>
                  <th className="pb-3">Service Type</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  {canModify && <th className="pb-3 pr-2 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {maintenanceLogs.map((log) => {
                  const vehicleObj = vehicles.find((v) => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="text-xs text-slate-700 hover:bg-white/20 transition-colors">
                      <td className="py-3.5 pl-2 font-black text-slate-900">
                        {vehicleObj ? (
                          <Link href={`/fleet/${vehicleObj.id}`} className="hover:text-amber-600 hover:underline transition-all">
                            {vehicleObj.nameModel}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">{log.serviceType}</td>
                      <td className="py-3.5 font-medium text-slate-600">
                        {formatCurrency(log.cost)}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {new Date(log.serviceDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold border rounded-md uppercase tracking-wider ${getStatusBadge(log.status)}`}>
                          {log.status === "ACTIVE" ? "In Shop" : "Completed"}
                        </span>
                      </td>
                      {canModify && (
                        <td className="py-3.5 pr-2 text-right">
                          {log.status === "ACTIVE" ? (
                            <button
                              onClick={() => completeMaintenanceLog(log.id)}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 hover:border-green-200 transition-all cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Release
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-semibold">Logged</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {maintenanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={canModify ? 6 : 5} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No maintenance records logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Warn rule */}
          <div className="mt-6 pt-4 border-t border-slate-200/30 flex items-center gap-2 text-[10px] text-orange-600 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Rule: Setting maintenance record to Completed automatically restores vehicle status to Available, unless Retired separately.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
