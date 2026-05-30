"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, ArrowRight, Lock } from 'lucide-react';

interface SignupViewProps {
  onSignupSuccess: (email: string) => void;
  onGoToLogin: () => void;
}

export default function SignupView({ onSignupSuccess, onGoToLogin }: SignupViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    setTimeout(() => {
      onSignupSuccess(email);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#FDFDFD] px-6 my-10 font-sans" id="signup-view-root">
      <div className="w-full max-w-lg space-y-10 text-left">
        
        {/* Title Area */}
        <div className="space-y-3">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            🌌 ONBOARD NEW WORKSPACE
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-stone-950 font-sans leading-tight">
            Build your AI company.
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1 max-w-md font-sans">
            Create AI workers, connect your tools, upload files, and start running your business with AI. Setup takes less than a minute.
          </p>
        </div>

        {/* Signup Container Card */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-stone-200/90 rounded-3xl p-8 shadow-3xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Your Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Taylor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-955 text-stone-900 font-medium placeholder-stone-350"
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Nordic Labs"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-955 text-stone-900 font-medium placeholder-stone-350"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Work Email Address</label>
              <input
                type="email"
                required
                placeholder="CEO@nordiclabs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-955 text-stone-905 font-medium placeholder-stone-350"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Password</label>
              <input
                type="password"
                required
                placeholder="Choose a strong passkey"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-955 text-stone-905 font-mono placeholder-stone-350"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-950 text-white rounded-xl text-xs font-bold font-sans hover:bg-stone-850 transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Bootstrapping Encrypted Space...' : 'Create Account & Launch'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-100"></div>
            <span className="flex-shrink mx-4 text-[9.5px] font-mono text-stone-350 uppercase">Or instantly join</span>
            <div className="flex-grow border-t border-stone-100"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              const testEmail = 'evaluator@octo.ai';
              onSignupSuccess(testEmail);
            }}
            className="w-full py-3 bg-[#FCFCFA] hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer Area */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2.5 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-light leading-normal">Everything is private by default. Your environment is isolated.</span>
          </div>

          <p className="text-xs text-stone-500 text-center sm:text-left mt-2">
            Already have an active company workspace?{' '}
            <button
              onClick={onGoToLogin}
              className="text-[#9D8055] font-semibold hover:underline"
            >
              Sign in instead
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
