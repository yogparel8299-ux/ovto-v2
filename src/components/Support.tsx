"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquare,
  Mail,
  HelpCircle,
  BookOpen,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface SupportProps {
  onGoToLogin?: () => void;
  onGoToDashboard?: () => void;
}

export default function Support({ onGoToLogin, onGoToDashboard }: SupportProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setMessage("");
    }, 4000);
  };

  const guides = [
    {
      title: "Launch your first AI worker",
      detail:
        "Open the Builder, describe your business in plain language, and deploy specialists that connect to Gmail, Slack, or Shopify safely.",
      icon: BookOpen,
    },
    {
      title: "Connect business apps",
      detail:
        "Authorize integrations inside Settings. Workers only act after you review sensitive steps in Approvals.",
      icon: Shield,
    },
    {
      title: "Upload company files",
      detail:
        "Drop SOP manuals, ledgers, and policy PDFs into Files. Workers reference them privately without exposing data.",
      icon: HelpCircle,
    },
  ];

  return (
    <div
      className="bg-[#FDFDFD] text-stone-900 font-sans min-h-screen py-24 px-6 md:px-12 selection:bg-stone-900 selection:text-white"
      id="support-view"
    >
      <div className="max-w-4xl mx-auto space-y-20 text-left">
        <div className="space-y-4">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            HUMAN SUPPORT • OCTO OPERATIONS DESK
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Support Center
          </h1>
          <p className="text-base text-stone-500 max-w-xl font-light leading-relaxed">
            Get help running your AI company workspace. We respond to billing, integration, and worker configuration questions within two business days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-stone-100">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div key={guide.title} className="space-y-2">
                <Icon className="w-5 h-5 text-[#9D8055]" />
                <h3 className="text-sm font-bold text-stone-950 font-sans">{guide.title}</h3>
                <p className="text-xs text-stone-500 leading-normal font-light">{guide.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-stone-200/90 rounded-3xl p-8 shadow-3xs space-y-5"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-950" />
              <h2 className="text-sm font-bold text-stone-950 font-sans">Send a support ticket</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Stripe connector not syncing"
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-bold">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you were trying to do and what happened."
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-sans tracking-tight transition-all flex items-center justify-center gap-2"
            >
              Submit ticket
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ticket received. Our team will reply to your workspace email shortly.
              </motion.p>
            )}
          </form>

          <div className="space-y-6">
            <div className="bg-[#FCFCFA] border border-stone-200/80 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#9D8055]" />
                <h3 className="text-sm font-bold text-stone-950 font-sans">Direct email</h3>
              </div>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                For billing disputes, refund requests, or security reviews, email{" "}
                <strong className="text-stone-700 font-mono">support@octo.ai</strong> with your workspace ID and ledger reference numbers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {onGoToDashboard && (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="flex-1 py-3 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
                >
                  Open Dashboard
                </button>
              )}
              {onGoToLogin && (
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="flex-1 py-3 bg-white border border-stone-200 text-stone-950 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-all"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
