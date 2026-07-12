"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDrivers } from "@/hooks/useDrivers";
import { Plus, X, AlertCircle, ShieldAlert, Award, Search } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";

export default function DriversPage() {
  const { drivers, addDriver, updateDriverStatus } = useDrivers();

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

  const { canModify } = useSettings({ module: "DRIVERS" });

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

  // Dynamic avatar gradient based on driver's name
  const getAvatarGradient = (name: string) => {
    const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const index = charCode % 4;
    const gradients = [
      "from-amber-400 to-orange-500 text-white",
      "from-blue-400 to-indigo-500 text-white",
      "from-emerald-400 to-teal-500 text-white",
      "from-purple-400 to-pink-500 text-white",
    ];
    return gradients[index];
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Drivers &amp; Safety Profiles</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Monitor compliance certifications, driver safety scores, and duty statuses</p>
        </div>

        {/* Add Driver - Only accessible if Safety Officer or Fleet Manager */}
        {canModify && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-650 hover:to-orange-650 rounded-xl shadow-md shadow-amber-200/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Driver
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4.5 rounded-2xl glass-panel flex flex-wrap items-center gap-4 border border-white/60 shadow-xs">
        <div className="w-72 relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search name or license no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200/80 bg-white/70 shadow-inner focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:outline-none transition-all duration-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl border border-slate-200/80 bg-white/70 shadow-inner focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:outline-none font-semibold cursor-pointer"
        >
          <option value="ALL">Status: All</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="OFF_DUTY">Off Duty</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Drivers Grid Card Container */}
      <div className="space-y-8">
        {filteredDrivers.length === 0 ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 p-16 text-center text-sm text-slate-400 font-semibold shadow-xs">
            No drivers found matching filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDrivers.map((driver) => {
              const isExpired = isLicenseExpired(driver.licenseExpiry);
              
              return (
                <div 
                  key={driver.id} 
                  className="glass-card rounded-2xl border border-slate-200/60 shadow-md hover:shadow-xl hover:border-amber-500/30 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3.5 flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shadow-md bg-gradient-to-br border border-white/50 shrink-0 ${getAvatarGradient(driver.name)}`}>
                        {driver.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-base leading-snug group-hover:text-amber-600 transition-colors duration-200 truncate">
                          <Link href={`/drivers/${driver.id}`} className="hover:text-amber-500 transition-all">
                            {driver.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 font-bold tracking-normal mt-0.5 truncate">
                          {driver.licenseNo} ({driver.licenseCategory})
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-black border rounded-md uppercase tracking-wider shrink-0 ${getStatusBadge(driver.status, isExpired)}`}>
                      {driver.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Specs List in body */}
                  <div className="px-5 py-4.5 border-t border-b border-slate-100/60 bg-slate-50/40 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">License Expiry</span>
                      <span className={`font-black text-sm ${isExpired ? "text-red-600 font-extrabold" : "text-slate-700"}`}>
                        {new Date(driver.licenseExpiry).toLocaleDateString(undefined, { month: "2-digit", year: "numeric" })}
                        {isExpired && " (EXPIRED)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact</span>
                      <span className="font-bold text-sm text-slate-700">{driver.contactNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Safety Score</span>
                      <span className="font-black text-sm text-emerald-600 flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        {driver.safetyScore}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4.5 flex items-center justify-between bg-white/60 backdrop-blur-xs">
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
                          className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-750 font-extrabold focus:border-amber-500 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/50 flex items-center gap-3 text-xs text-amber-700 font-semibold shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
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
                  <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@transitops.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70"
                />
              </div>

              {/* License No */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-88213"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Category</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as "LMV" | "HMV" | "OTHER")}
                    className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70 cursor-pointer"
                  >
                    <option value="LMV">Light Motor (LMV)</option>
                    <option value="HMV">Heavy Motor (HMV)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876598765"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input border-slate-200/70"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md transition-all cursor-pointer"
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
