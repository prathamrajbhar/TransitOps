"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import type { RoleName } from "@/context/MockDataContext";
import { Shield, Lock, Mail, AlertCircle, User, CheckCircle, Truck, Route, BarChart3, ArrowRight, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, refresh } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [role, setRole] = useState<RoleName>("FLEET_MANAGER");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Registration failed.");
      }

      setSuccess(`Account created! Redirecting to dashboard...`);
      await refresh();
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError((err as Error).message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
    <main className="min-h-screen w-full relative flex items-center justify-center font-sans overflow-hidden bg-slate-950 p-4 sm:p-6 md:p-8">
      {/* Full-bleed Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/login_bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      
      {/* Multi-layer gradient overlays for cinematic depth (brighter view) */}
      <div className="absolute inset-0 bg-slate-950/45 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 z-[1]" />
      
      {/* Content wrapper floating above video */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 animate-in fade-in duration-700">
        
        {/* Left column: Brand & Hero text */}
        <div className="flex flex-col justify-between space-y-8 max-w-xl text-white lg:text-left text-center">
          {/* Brand header */}
          <div className="flex items-center gap-3.5 lg:justify-start justify-center">
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
              <h2 className="font-black text-2xl tracking-tight !text-white leading-none drop-shadow-md">TransitOps</h2>
              <p className="text-[10px] !text-amber-400 font-extrabold uppercase tracking-[0.2em] mt-0.5">Smart Transport Operations</p>
            </div>
          </div>

          {/* Hero Content - clean & cinematic */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-bold !text-amber-400 uppercase tracking-widest lg:mx-0 mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Enterprise Fleet Platform
            </div>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.02] tracking-tighter !text-white drop-shadow-lg">
              Join the <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                operations team.
              </span>
            </h1>
            <p className="text-base sm:text-lg !text-slate-100 leading-relaxed font-semibold max-w-md lg:mx-0 mx-auto drop-shadow-sm">
              Create your account and start managing your fleet with role-based access controls tailored to your responsibilities.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] !text-slate-300 font-bold lg:justify-between justify-center gap-6">
            <span className="tracking-wider">TRANSITOPS &copy; 2026</span>
          </div>
        </div>

        {/* Right column: Glassmorphic form card */}
        <div className="w-full max-w-md">
          {/* Light Glass Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/90 border border-white/20 backdrop-blur-xl shadow-2xl shadow-slate-900/30">
            <div className="mb-7">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Create account</h2>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">Get started with your operations dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <p className="font-semibold">{success}</p>
                  </div>
                </div>
              )}

              {/* Name Field */}
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
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 font-medium text-slate-900 placeholder-slate-400"
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
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 font-medium text-slate-900 placeholder-slate-400"
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
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Role
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                    <Shield className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </span>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleName)}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 appearance-none cursor-pointer font-medium text-slate-900"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 active:scale-[0.98] mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-600 font-extrabold hover:text-amber-700 hover:underline transition-all">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
