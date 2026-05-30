"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
  onGoToSignup: () => void;
}

export default function LoginView({ onLoginSuccess, onGoToSignup }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(email);
      setLoading(false);
    }, 850);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FDFDFD] px-6 my-10 font-sans" id="login-view-root">
      <div className="w-full max-w-md space-y-10 text-left">
        
        {/* Title Area */}
        <div className="space-y-3">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            🔒 SECURE CLIENT LOGON Gateway
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-stone-950 font-sans">
            Welcome back to Octo.
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1.5 font-sans">
            Sign in to your AI company. All runs execute inside safe host spaces.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-stone-200/90 rounded-3xl p-8 shadow-3xs">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Email Address</label>
              <input
                type="email"
                required
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900 font-medium placeholder-stone-350"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo platform account triggers automatically. Enter any mock values to initiate environment.')}
                  className="text-[9.5px] font-mono text-[#9D8055] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900 font-mono placeholder-stone-350"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-950 text-white rounded-xl text-xs font-bold font-sans hover:bg-stone-850 transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Decrypting Secure Vault...' : 'Login & Open Workspace'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          {/* Social login line */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-100"></div>
            <span className="flex-shrink mx-4 text-[9.5px] font-mono text-stone-300 uppercase">Or bypass validation</span>
            <div className="flex-grow border-t border-stone-100"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              const testEmail = 'founder@octo.ai';
              setEmail(testEmail);
              onLoginSuccess(testEmail);
            }}
            className="w-full py-3 bg-[#FCFCFA] hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer info line list */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2.5 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-light leading-normal">Your company data stays private. Secure local environment.</span>
          </div>

          <p className="text-xs text-stone-500 text-center sm:text-left mt-2">
            Don't have an enterprise workspace?{' '}
            <button
              onClick={onGoToSignup}
              className="text-[#9D8055] font-semibold hover:underline"
            >
              Sign up today
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
