"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMockData, RoleName } from "@/context/MockDataContext";
import { Shield, Lock, Mail, AlertCircle, User, CheckCircle, Truck, Route, BarChart3, ArrowRight, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, currentUser } = useMockData();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin"); // seed default password
  const [role, setRole] = useState<RoleName>("FLEET_MANAGER");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const res = register(name.trim(), email.trim(), role);
    if (res.success) {
      setSuccess(`Account registered successfully for ${role.replace("_", " ")}! Redirecting to login...`);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const roleOptions: { value: RoleName; label: string; desc: string; icon: React.ReactNode; color: string; borderColor: string; bgColor: string }[] = [
    {
      value: "FLEET_MANAGER",
      label: "Fleet Manager",
      desc: "Manage vehicles, maintenance & fleet operations",
      icon: <Truck className="w-4 h-4" />,
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
    },
    {
      value: "DISPATCHER",
      label: "Dispatcher",
      desc: "Plan trips, dispatch vehicles & track routes",
      icon: <Route className="w-4 h-4" />,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
    },
    {
      value: "SAFETY_OFFICER",
      label: "Safety Officer",
      desc: "Monitor driver compliance & safety scores",
      icon: <Shield className="w-4 h-4" />,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
    },
    {
      value: "FINANCIAL_ANALYST",
      label: "Financial Analyst",
      desc: "Track fuel costs, expenses & ROI analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-violet-400",
      borderColor: "border-violet-500/30",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <main className="min-h-screen flex font-sans">
      {/* Left Column - Cinematic video background with brand overlay */}
      <div className="hidden lg:flex w-[55%] text-white flex-col justify-between relative overflow-hidden">
        {/* Full-bleed Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/login_bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        
        {/* Multi-layer gradient overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-slate-900/40 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/60 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-blue-900/15 z-[1]" />
        
        {/* Content over video */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          
          {/* Brand header */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-2xl tracking-tight text-white leading-none">TransitOps</h2>
              <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-[0.2em] mt-0.5">Smart Transport Operations</p>
            </div>
          </div>

          {/* Hero Content - centered */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[11px] font-semibold text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Join the Platform
              </div>
              <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">Get started</span> <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  in seconds.
                </span>
              </h1>
              <p className="text-[15px] text-slate-400 leading-relaxed font-medium max-w-md">
                Register your account and choose your role. Each role unlocks a tailored dashboard with the exact tools you need.
              </p>
            </div>

            {/* Role cards */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Available Roles</p>
              <div className="grid grid-cols-2 gap-2.5">
                {roleOptions.map((rc) => (
                  <div
                    key={rc.value}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-default ${rc.borderColor} ${rc.bgColor} hover:scale-[1.02]`}
                  >
                    <div className={rc.color}>{rc.icon}</div>
                    <div>
                      <p className="text-[11px] font-bold text-white/90">{rc.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">{rc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="tracking-wider">TRANSITOPS &copy; 2026</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-bold tracking-wider">RBAC RULE SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)', backgroundSize: '24px 24px'}} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile brand header (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h18" /><path d="M3 15h18" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-slate-900">TransitOps</h2>
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Smart Transport Operations</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-200/50">
            <div className="mb-7">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">Get access to TransitOps Logistics Suite</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Notification */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200/50 flex items-start gap-3 text-xs text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Registration failed</p>
                    <p className="mt-0.5 text-red-700/90 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-start gap-3 text-xs text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Success</p>
                    <p className="mt-0.5 text-emerald-700/90 leading-relaxed">{success}</p>
                  </div>
                </div>
              )}

              {/* Full Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Marcus V."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@transitops.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Role Select Dropdown */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Role (RBAC Scope)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                    <Shield className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </span>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleName)}
                    className="w-full pl-11 pr-10 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                  <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 transition-all duration-300 active:scale-[0.98] mt-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Login link switcher */}
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-600 font-extrabold hover:text-amber-700 hover:underline transition-all">
                Sign In instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
