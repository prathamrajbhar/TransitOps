"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { useFuelExpenses } from "@/hooks/useFuelExpenses";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/utils/format";
import { Fuel, Plus, X, AlertCircle, Coins } from "lucide-react";

export default function FuelExpensesPage() {
  const { user } = useSession();
  const { vehicles } = useVehicles();
  const { trips } = useTrips();
  const { fuelLogs, expenses, addFuelLog, addExpense } = useFuelExpenses();
  const { totalOperationalCost } = useAnalytics();

  // Dialog Modals State
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log Fuel Form State
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState("2026-07-12");
  const [liters, setLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Log Expense Form State
  const [expTripId, setExpTripId] = useState("");
  const [expVehicleId, setExpVehicleId] = useState("");
  const [tollCost, setTollCost] = useState("");
  const [otherCost, setOtherCost] = useState("");

  const canModify = user?.role === "FINANCIAL_ANALYST";

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fuelVehicleId || !liters || !fuelCost || !fuelDate) {
      setError("Please fill out all fields.");
      return;
    }

    addFuelLog({
      vehicleId: fuelVehicleId,
      date: new Date(fuelDate).toISOString(),
      liters: Number(liters),
      cost: Number(fuelCost),
    });

    setIsFuelModalOpen(false);
    setFuelVehicleId("");
    setLiters("");
    setFuelCost("");
    setError(null);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!expVehicleId || !tollCost || !otherCost) {
      setError("Please select a vehicle and enter costs.");
      return;
    }

    addExpense({
      tripId: expTripId || null,
      vehicleId: expVehicleId,
      toll: Number(tollCost),
      other: Number(otherCost),
      maintenanceLinked: 0,
    });

    setIsExpenseModalOpen(false);
    setExpTripId("");
    setExpVehicleId("");
    setTollCost("");
    setOtherCost("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fuel &amp; Expense Management</h2>
          <p className="text-xs text-slate-500 mt-1">Track fleet resource consumption and cargo expenses</p>
        </div>

        {canModify && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Fuel className="w-4 h-4" />
              Log Fuel
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        )}
      </div>

      {/* Grid: Fuel logs on Left, Other expenses on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Fuel Logs */}
        <div className="rounded-2xl glass-panel p-6 border border-white/60">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-6">Fuel Logs</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Vehicle</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Liters</th>
                  <th className="pb-3 pr-2">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="text-xs text-slate-700 hover:bg-white/20 transition-colors">
                    <td className="py-3.5 pl-2 font-black text-slate-900">
                      {vehicles.find(v => v.id === log.vehicleId) ? (
                        <Link href={`/fleet/${log.vehicleId}`} className="hover:text-amber-600 hover:underline transition-all">
                          {vehicles.find(v => v.id === log.vehicleId)?.nameModel}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="py-3.5 text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="py-3.5 font-semibold text-slate-800">{log.liters} L</td>
                    <td className="py-3.5 pr-2 font-extrabold text-slate-900">{formatCurrency(log.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Other Expenses */}
        <div className="rounded-2xl glass-panel p-6 border border-white/60">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-6">Other Expenses (Toll / Misc)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Trip</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Toll</th>
                  <th className="pb-3">Other</th>
                  <th className="pb-3">Maint (Linked)</th>
                  <th className="pb-3 pr-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="text-xs text-slate-700 hover:bg-white/20 transition-colors">
                    <td className="py-3.5 pl-2 font-black text-slate-900">
                      {exp.tripId ? (
                        <Link href={`/trips/${exp.tripId}`} className="hover:text-amber-600 hover:underline transition-all">
                          {trips.find(t => t.id === exp.tripId)?.tripCode || "Misc"}
                        </Link>
                      ) : "Misc"}
                    </td>
                    <td className="py-3.5 font-semibold">
                      {exp.vehicleId && vehicles.find(v => v.id === exp.vehicleId) ? (
                        <Link href={`/fleet/${exp.vehicleId}`} className="hover:text-amber-600 hover:underline transition-all">
                          {vehicles.find(v => v.id === exp.vehicleId)?.nameModel}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="py-3.5 text-slate-600">{exp.toll > 0 ? formatCurrency(exp.toll) : "—"}</td>
                    <td className="py-3.5 text-slate-600">{exp.other > 0 ? formatCurrency(exp.other) : "—"}</td>
                    <td className="py-3.5 text-slate-600">{exp.maintenanceLinked > 0 ? formatCurrency(exp.maintenanceLinked) : "—"}</td>
                    <td className="py-3.5 pr-2">
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold border border-amber-200/50 bg-amber-50 text-amber-800 rounded-md">
                        {formatCurrency(exp.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Summary operational cost indicator */}
      <div className="p-6 rounded-2xl glass-panel border border-white/60 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Total Operational Cost (Auto)</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Sum of Fuel Logs + Active Maintenance Servicing Costs</p>
          </div>
        </div>
        <div className="text-2xl font-black text-orange-600">
          {formatCurrency(totalOperationalCost)}
        </div>
      </div>

      {/* Fuel Modal Dialog */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/40">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Log Fuel Purchase</h3>
              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="space-y-4 mt-4">
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
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.filter(v => v.status !== "RETIRED").map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fuel Refill Date</label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Liters */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Liters (L)</label>
                  <input
                    type="number"
                    placeholder="e.g. 42"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Fuel Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3150"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal Dialog */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/40">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Add Miscellaneous Expense</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Trip (Optional Link) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Link Trip (Optional)</label>
                <select
                  value={expTripId}
                  onChange={(e) => setExpTripId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                >
                  <option value="">-- Generic Org Expense (No Trip Link) --</option>
                  {trips.filter(t => t.status === "COMPLETED" || t.status === "DISPATCHED").map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tripCode} ({t.source} &rarr; {t.destination})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle (Linked)</label>
                <select
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.filter(v => v.status !== "RETIRED").map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Toll */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Toll Expense (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={tollCost}
                    onChange={(e) => setTollCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>

                {/* Other */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Other Expense (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
