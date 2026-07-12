"use client";

import React, { useState } from "react";
import { useSession } from "@/providers/SessionProvider";
import { RoleName, ModuleName, AccessLevel, RBAC_MATRIX } from "@/context/MockDataContext";
import { useSettings } from "@/hooks/useSettings";
import { Settings as SettingsIcon, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useSession();
  const { settings, updateSettings, userMatrix, canModify } = useSettings({ module: "SETTINGS" });

  // Form State
  const [depotName, setDepotName] = useState(settings.depotName || "Mumbai Logistics Depot");
  const [currency, setCurrency] = useState(settings.currency || "INR");
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit || "km");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local state for the editable matrix
  const [matrix, setMatrix] = useState<Record<RoleName, Record<ModuleName, AccessLevel>>>(RBAC_MATRIX);

  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    if (settings && Object.keys(settings).length > 0) {
      setDepotName(settings.depotName || "Mumbai Logistics Depot");
      setCurrency(settings.currency || "INR");
      setDistanceUnit(settings.distanceUnit || "km");
    }
  }

  const [prevUserMatrix, setPrevUserMatrix] = useState(userMatrix);
  if (userMatrix !== prevUserMatrix) {
    setPrevUserMatrix(userMatrix);
    if (userMatrix) {
      setMatrix(userMatrix);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const res = await updateSettings({
      depotName,
      currency,
      distanceUnit,
      rbac_matrix: matrix,
    });

    if (res.success) {
      setSuccessMsg("System configuration updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleMatrixChange = async (role: RoleName, module: ModuleName, value: AccessLevel) => {
    const updatedMatrix = {
      ...matrix,
      [role]: {
        ...matrix[role],
        [module]: value,
      },
    };

    setMatrix(updatedMatrix);

    // Auto-save instantly in real-time
    await updateSettings({
      depotName,
      currency,
      distanceUnit,
      rbac_matrix: updatedMatrix,
    });
  };

  const getRbacCell = (access: string) => {
    switch (access) {
      case "FULL":
        return <span className="font-extrabold text-emerald-600 text-sm">✓</span>;
      case "VIEW":
        return <span className="font-semibold text-blue-600 text-xs">View</span>;
      case "NONE":
      default:
        return <span className="text-slate-350 font-bold">—</span>;
    }
  };

  const renderInteractiveCell = (role: RoleName, module: ModuleName) => {
    const value = matrix[role]?.[module] || "NONE";
    return (
      <select
        value={value}
        onChange={(e) => handleMatrixChange(role, module, e.target.value as AccessLevel)}
        className="px-2.5 py-1 text-xs rounded-xl border border-slate-200/80 bg-white text-slate-800 font-extrabold cursor-pointer outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white"
      >
        <option value="FULL">✓ Full</option>
        <option value="VIEW">View</option>
        <option value="NONE">— None</option>
      </select>
    );
  };

  const roleLabels: Record<RoleName, string> = {
    FLEET_MANAGER: "Fleet Manager",
    DISPATCHER: "Dispatcher",
    SAFETY_OFFICER: "Safety Officer",
    FINANCIAL_ANALYST: "Financial Analyst",
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings &amp; RBAC</h2>
        <p className="text-xs text-slate-500 mt-1">Configure global depot units and manage role-based module security</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-white/60">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">General Configurations</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success message on save */}
            {canModify && successMsg && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200/50 flex items-center gap-2 text-xs text-green-800 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Warning notice for view mode */}
            {!canModify && (
              <div className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200/40 text-center text-xs text-slate-400 font-semibold leading-normal">
                You do not have permission to modify depot settings. <br />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">View Mode Only</span>
              </div>
            )}

            {/* Depot Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Depot Station Name</label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold"
              />
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Local Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold appearance-none"
              >
                <option value="INR">INR (Rs)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
              </select>
            </div>

            {/* Distance Unit */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Distance Metric Label</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                disabled={!canModify}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 disabled:opacity-65 disabled:bg-slate-50/20 disabled:cursor-not-allowed text-slate-800 font-semibold appearance-none"
              >
                <option value="KM">Kilometers (KM)</option>
                <option value="MILES">Miles (Mi)</option>
              </select>
            </div>

            {/* Save Changes Button */}
            <button
              type="submit"
              disabled={!canModify}
              className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-amber-500 hover:bg-amber-600 shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Column: Role-Based Access Control Table */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-white/60">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Role-Based Access (RBAC)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Role</th>
                  <th className="pb-3 text-center">Fleet</th>
                  <th className="pb-3 text-center">Driver</th>
                  <th className="pb-3 text-center">Trip</th>
                  <th className="pb-3 text-center">Maintenance</th>
                  <th className="pb-3 text-center">Fuel/Exp.</th>
                  <th className="pb-3 text-center pr-2">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {(Object.keys(matrix) as RoleName[]).map((roleKey) => {
                  const isCurrentRole = user?.role === roleKey;
                  return (
                    <tr 
                      key={roleKey} 
                      className={`text-xs text-slate-700 hover:bg-white/20 transition-colors ${
                        isCurrentRole ? "bg-amber-500/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-2 font-bold text-slate-800">
                        {roleLabels[roleKey]}
                        {isCurrentRole && (
                          <span className="ml-1.5 text-[8px] bg-amber-100 text-amber-800 border border-amber-200 px-1 rounded-sm uppercase tracking-wider font-extrabold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">{canModify ? renderInteractiveCell(roleKey, "FLEET") : getRbacCell(matrix[roleKey]?.FLEET)}</td>
                      <td className="py-3 text-center">{canModify ? renderInteractiveCell(roleKey, "DRIVERS") : getRbacCell(matrix[roleKey]?.DRIVERS)}</td>
                      <td className="py-3 text-center">{canModify ? renderInteractiveCell(roleKey, "TRIPS") : getRbacCell(matrix[roleKey]?.TRIPS)}</td>
                      <td className="py-3 text-center">{canModify ? renderInteractiveCell(roleKey, "MAINTENANCE") : getRbacCell(matrix[roleKey]?.MAINTENANCE)}</td>
                      <td className="py-3 text-center">{canModify ? renderInteractiveCell(roleKey, "FUEL_EXPENSES") : getRbacCell(matrix[roleKey]?.FUEL_EXPENSES)}</td>
                      <td className="py-3 text-center pr-2">{canModify ? renderInteractiveCell(roleKey, "ANALYTICS") : getRbacCell(matrix[roleKey]?.ANALYTICS)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alert check info */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50/50 border border-slate-200/40 text-[10px] text-slate-500 leading-relaxed font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 uppercase font-black mb-1">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" /> Note on Access Matrix
            </span>
            The access control matrix maps roles to either Full editing capability (✓), View-only permission (View), or Restricted access (—). Left navigation options adapt dynamically depending on this authorization scheme.
          </div>
        </div>
      </div>
    </div>
  );
}
