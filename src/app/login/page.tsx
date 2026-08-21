"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Compass, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@tapgo.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful! Welcome to Tap & Go Admin Portal.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate with backend API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail("admin@tapgo.com");
    setPassword("Password123!");
    toast.info("Demo Superadmin credentials loaded.");
  };

  return (
    <div className="min-h-screen w-full bg-[#0A1128] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#009B9E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FF3E7F]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#009B9E] to-[#FF3E7F] flex items-center justify-center shadow-lg shadow-[#009B9E]/20 mb-4">
            <Compass className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            TAP & GO <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FF3E7F]/20 text-[#FF3E7F] border border-[#FF3E7F]/30 uppercase tracking-wider">CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Travel Platform & Booking Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tapgo.com"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-[#009B9E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#009B9E] transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-[#009B9E] rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#009B9E] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-[#009B9E] focus:ring-0 bg-slate-950"
              />
              <span>Remember this session</span>
            </label>
            <span className="text-[#009B9E] hover:underline cursor-pointer">Security Policies</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#009B9E] to-[#FF3E7F] hover:opacity-90 text-white font-semibold rounded-xl text-sm shadow-lg shadow-[#009B9E]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In To Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Seed / Fill Assistant */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Use Default Superadmin Credentials (`admin@tapgo.com`)</span>
          </button>
        </div>

        {/* Security Badge Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected with JWT & Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}
