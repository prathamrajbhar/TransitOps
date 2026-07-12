"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Invalid credentials.");
      }

      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Sign in failed. Please try again.");
    }
  };



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
              One platform, <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                four roles.
              </span>
            </h1>
            <p className="text-base sm:text-lg !text-slate-100 leading-relaxed font-semibold max-w-md lg:mx-0 mx-auto drop-shadow-sm">
              A centralized dashboard that automatically enforces business regulations, vehicle capacity compliance, and driver safety schedules in real-time.
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
          <div className="p-8 sm:p-10 rounded-3xl bg-white/90 border border-white/30 backdrop-blur-xl shadow-2xl shadow-slate-900/40">
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
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 font-medium text-slate-900 placeholder-slate-400"
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
                    className="w-full pl-11 pr-12 py-3 text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 font-medium text-slate-900 placeholder-slate-400"
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
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 active:scale-[0.98] mt-1 flex items-center justify-center gap-2 cursor-pointer"
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
        </div>
      </div>
    </main>
  );
}
