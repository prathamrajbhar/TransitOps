"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMockData, RoleName } from "@/context/MockDataContext";
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, Truck, Route, BarChart3, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useMockData();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin"); // default password for ease of hackathon test
  
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const res = login(email.trim());
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Invalid credentials. Please verify your email.");
    }
  };

  const handleAutofill = (type: RoleName) => {
    const emails: Record<RoleName, string> = {
      FLEET_MANAGER: "manager@transitops.in",
      DISPATCHER: "dispatcher@transitops.in",
      SAFETY_OFFICER: "safety@transitops.in",
      FINANCIAL_ANALYST: "analyst@transitops.in",
    };
    setEmail(emails[type]);
    setPassword("admin");
    setError(null);
  };

  const roleCards: { role: RoleName; label: string; desc: string; icon: React.ReactNode; color: string; borderColor: string; bgColor: string }[] = [
    {
      role: "FLEET_MANAGER",
      label: "Fleet Manager",
      desc: "Fleet & Maintenance",
      icon: <Truck className="w-4 h-4" />,
      color: "text-amber-400",
      borderColor: "border-amber-500/30 hover:border-amber-400/60",
      bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    },
    {
      role: "DISPATCHER",
      label: "Dispatcher",
      desc: "Trip Planning & Dashboard",
      icon: <Route className="w-4 h-4" />,
      color: "text-blue-400",
      borderColor: "border-blue-500/30 hover:border-blue-400/60",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      role: "SAFETY_OFFICER",
      label: "Safety Officer",
      desc: "Drivers & Compliance",
      icon: <Shield className="w-4 h-4" />,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
      role: "FINANCIAL_ANALYST",
      label: "Financial Analyst",
      desc: "Fuel, Expenses & ROI",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-violet-400",
      borderColor: "border-violet-500/30 hover:border-violet-400/60",
      bgColor: "bg-violet-500/10 hover:bg-violet-500/20",
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
                Enterprise Fleet Management Platform
              </div>
              <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">One platform,</span> <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  four distinct roles.
                </span>
              </h1>
              <p className="text-[15px] text-slate-400 leading-relaxed font-medium max-w-md">
                A centralized dashboard that automatically enforces business regulations, vehicle-capacity compliance, and driver safety schedules in real-time.
              </p>
            </div>

            {/* Role privilege cards - horizontal */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Access Privileges</p>
              <div className="grid grid-cols-2 gap-2.5">
                {roleCards.map((rc) => (
                  <div
                    key={rc.role}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-default ${rc.borderColor} ${rc.bgColor}`}
                  >
                    <div className={rc.color}>{rc.icon}</div>
                    <div>
                      <p className="text-[11px] font-bold text-white/90">{rc.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{rc.desc}</p>
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

      {/* Right Column - Login form */}
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
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">Sign in to access your operations dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Notification */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200/50 flex items-start gap-3 text-xs text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Sign in failed</p>
                    <p className="mt-0.5 text-red-700/90 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Extra Row: Remember me / Forgot pwd */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="flex items-center gap-2.5 text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 focus:ring-offset-0 accent-amber-500 cursor-pointer"
                  />
                  Remember me
                </label>
                <a href="#" className="text-amber-600 hover:text-amber-700 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 transition-all duration-300 active:scale-[0.98] mt-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Registration link */}
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              New to TransitOps?{" "}
              <Link href="/register" className="text-amber-600 font-extrabold hover:text-amber-700 hover:underline transition-all">
                Create an account
              </Link>
            </div>
          </div>

          {/* Quick Demo Autofill section - outside the card for cleaner look */}
          <div className="mt-6 p-5 rounded-2xl bg-white/60 border border-slate-200/50 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              Quick Autofill (Hackathon Demo)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {roleCards.map((rc) => (
                <button
                  key={rc.role}
                  type="button"
                  onClick={() => handleAutofill(rc.role)}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-xl border border-slate-200/60 bg-white/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-left cursor-pointer group"
                >
                  <span className={`${rc.color.replace('400', '500')} opacity-70 group-hover:opacity-100 transition-opacity`}>
                    {rc.icon}
                  </span>
                  <span className="truncate">{rc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
