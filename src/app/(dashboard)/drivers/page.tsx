"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import { useDrivers } from "@/hooks/useDrivers";
import { Plus, X, AlertCircle, ShieldAlert, Award, Search } from "lucide-react";

export default function DriversPage() {
  const { drivers, addDriver, updateDriverStatus } = useDrivers();
  const { user } = useSession();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseCategory, setLicenseCategory] = useState<"LMV" | "HMV" | "OTHER">("LMV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const canModify = user?.role === "SAFETY_OFFICER" || user?.role === "FLEET_MANAGER";

  // Filter logic
  const filteredDrivers = drivers.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.licenseNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) return "bg-red-100/75 text-red-700 border-red-200/50";
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100/70 text-green-700 border-green-200/50";
      case "ON_TRIP":
        return "bg-blue-100/70 text-blue-700 border-blue-200/50";
      case "OFF_DUTY":
        return "bg-slate-100/75 text-slate-600 border-slate-200/50";
      case "SUSPENDED":
        return "bg-orange-100/70 text-orange-700 border-orange-200/50";
      default:
        return "bg-slate-100/70 text-slate-700 border-slate-200/50";
    }
  };

  const isLicenseExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !licenseNo || !licenseExpiry || !contactNumber) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = {
      name,
      email,
      licenseNo,
      licenseCategory,
      licenseExpiry: new Date(licenseExpiry).toISOString(),
      contactNumber,
      safetyScore: 100, // starting safety score
    };

    const res = await addDriver(payload);
    if (res.success) {
      setIsModalOpen(false);
      // Reset Form
      setName("");
      setEmail("");
      setLicenseNo("");
      setLicenseExpiry("");
      setContactNumber("");
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Drivers &amp; Safety Profiles</h2>
          <p className="text-xs text-slate-500 mt-1">Monitor compliance certifications and duty statuses</p>
        </div>

        {/* Add Driver - Only accessible if Safety Officer or Fleet Manager */}
        {canModify && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center gap-4 border border-white/60">
        <div className="w-64 relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search name / license no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl glass-input bg-white/40 border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer"
        >
          <option value="ALL">Status: All</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="OFF_DUTY">Off Duty</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Drivers Grid Card Container */}
      <div className="space-y-6">
        {filteredDrivers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-xs text-slate-400 font-medium shadow-sm">
            No drivers found matching filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDrivers.map((driver) => {
              const isExpired = isLicenseExpired(driver.licenseExpiry);
              
              return (
                <div 
                  key={driver.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 border border-slate-200 shadow-xs text-sm shrink-0">
                        {driver.name[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                          <Link href={`/drivers/${driver.id}`} className="hover:text-amber-500 transition-all">
                            {driver.name}
                          </Link>
                        </h3>
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono mt-0.5">
                          {driver.licenseNo} ({driver.licenseCategory})
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex px-2 py-0.5 text-[9px] font-black border rounded-md uppercase tracking-wider shrink-0 ${getStatusBadge(driver.status, isExpired)}`}>
                      {driver.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Specs List in body */}
                  <div className="px-5 py-3 border-t border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">License Expiry</span>
                      <span className={`font-black ${isExpired ? "text-red-600 font-extrabold" : "text-slate-700"}`}>
                        {new Date(driver.licenseExpiry).toLocaleDateString(undefined, { month: "2-digit", year: "numeric" })}
                        {isExpired && " (EXPIRED)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Contact</span>
                      <span className="font-bold text-slate-700">{driver.contactNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Safety Score</span>
                      <span className="font-black text-emerald-600 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {driver.safetyScore}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 flex items-center justify-between bg-white">
                    <Link 
                      href={`/drivers/${driver.id}`} 
                      className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                    >
                      View Profile &rarr;
                    </Link>
                    
                    {canModify && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={driver.status}
                          disabled={driver.status === "ON_TRIP"}
                          onChange={(e) => updateDriverStatus(driver.id, e.target.value as 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED')}
                          className="px-2.5 py-1.5 text-[10px] rounded-lg border border-slate-200 bg-slate-50 text-slate-750 font-extrabold focus:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="ON_TRIP">On Trip</option>
                          <option value="OFF_DUTY">Off Duty</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Business Rule Warning */}
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center gap-2 text-[10px] text-orange-600 font-semibold shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Rule: Driver licenses are validated on load. Drivers who are Suspended or have an expired license are automatically excluded from dispatcher trip selection menus.</span>
        </div>
      </div>

      {/* Add Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/40">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Register Driver</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200/50 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@transitops.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              {/* License No */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-88213"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">License Category</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as "LMV" | "HMV" | "OTHER")}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70 appearance-none cursor-pointer"
                  >
                    <option value="LMV">Light Motor Vehicle (LMV)</option>
                    <option value="HMV">Heavy Motor Vehicle (HMV)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Expiry */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">License Expiry</label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876598765"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input border-slate-200/70"
                />
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
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
