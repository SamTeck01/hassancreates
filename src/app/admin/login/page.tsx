"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to admin dashboard on success
        router.push("/admin");
        router.refresh();
      } else {
        triggerShake();
        setError(data.error || "Invalid credentials.");
        if (typeof data.attemptsRemaining === "number") {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setPassword(""); // Clear password on failure
      }
    } catch {
      triggerShake();
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#6B21D9]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#6B21D9]/4 rounded-full blur-[100px]" />
      </div>

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Login card */}
      <div
        className={`relative z-10 w-full max-w-sm transition-all duration-300 ${shake ? "animate-shake" : ""}`}
        style={{
          animation: shake ? "shake 0.4s ease-in-out" : undefined,
        }}
      >
        {/* Logo / Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6B21D9]/15 border border-[#6B21D9]/30 mb-4 shadow-lg shadow-[#6B21D9]/10">
            <span className="text-[#6B21D9] font-black text-xl font-mono tracking-tight">HC</span>
          </div>
          <h1 className="text-white text-xl font-extrabold tracking-tight font-kyiv">
            HassanCreates
          </h1>
          <p className="text-white/55 text-[13px] mt-1 font-medium">
            Admin Dashboard Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/7 rounded-2xl p-7 shadow-2xl shadow-black/60 backdrop-blur-xl">
          
          {/* Error message */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-950/25 border border-red-800/30 rounded-xl flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-red-400 text-xs font-semibold">{error}</p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-red-500/60 text-[10px] font-mono">
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before lockout
                </p>
              )}
              {attemptsRemaining === 0 && (
                <p className="text-red-500/60 text-[10px] font-mono">
                  Account locked for 15 minutes.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-username" className="text-xs font-semibold tracking-wide text-white/60">
                Username
              </label>
              <input
                id="admin-username"
                ref={usernameRef}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                spellCheck={false}
                required
                disabled={isLoading}
                className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/45 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-all disabled:opacity-50 font-medium"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-semibold tracking-wide text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/45 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-all disabled:opacity-50 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="mt-2 w-full bg-[#6B21D9] hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#6B21D9]/20 hover:shadow-[#6B21D9]/30 flex items-center justify-center gap-2.5 relative overflow-hidden group"
            >
              {/* Shimmer on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Access Dashboard</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-[11px] mt-6 font-mono">
          Protected admin access — hassancreates.com
        </p>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
