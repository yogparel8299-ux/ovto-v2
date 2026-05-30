import React from 'react';
import { ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="bg-[#FDFDFD] text-stone-900 font-sans min-h-screen py-24 px-6 md:px-12 selection:bg-stone-900 selection:text-white" id="terms-view">
      <div className="max-w-4xl mx-auto space-y-20 text-left">
        
        {/* Page Header */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            TERMS OF SERVICE • AGREEMENT PLATFORM
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Terms of Service
          </h1>
          <p className="text-base text-stone-500 max-w-xl font-light leading-relaxed">
            Please read these terms carefully before starting your AI company workspace. By using Octo, you agree to these simple human-readable rules.
          </p>
        </div>

        {/* Highlight Quote */}
        <div className="p-8 bg-[#FCFCFA] border-x-2 border-stone-950 text-stone-800 leading-relaxed font-sans text-xs flex flex-col gap-3">
          <p className="font-semibold text-stone-950 uppercase text-[9px] font-mono tracking-widest">Sovereignty Warning</p>
          <p className="italic">
            "You hold absolute operational control and responsibility over what your AI specialists do, send, write, or reconcile. We keep the servers running and secure—but you command the decisions."
          </p>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-12 text-sm text-stone-700 font-light leading-relaxed max-w-3xl">
          
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">1. Using Octo Workspaces</h3>
            <p>
              We grant you a secure, private client login to manage autonomous business specialists. You are welcome to create works, link tools, and delegate computational pipelines. We support legal corporate setups—any use of workers for fraud, bulk mail bypass, or unauthorized intrusion is strictly against policy.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">2. User Responsibilities & AI Outputs</h3>
            <p>
              All AI outputs—whether draft messages, financial estimates, customer responses, or database updates—are suggestions authored by LLMs. You must review key items in your Approvals ledger. We are not liable for accidental executions, missed logistics, or transaction errors arising from unreviewed activities.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">3. Connected Business Apps</h3>
            <p>
              You authorize Octo to synchronize with supported services (Stripe, Gmail, Slack, Spotify, etc.) via official API tokens. Keep your integration keys secure, and ensure your third-party account standings conform to their separate service rules.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">4. Payments & Billing</h3>
            <p>
              Premium tiers are billed at the beginning of each cycle. We do not apply hidden or variable per-token markups; instead, you pay the flat subscription or use private model keys with zero premium. Fees are subject to periodic, notified updates.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">5. Marketplace Publishing</h3>
            <p>
              All blueprint sharing or widget releases are manual-only and under your signature. You warrant that any published blueprint is free of embedded secrets, malintent, or copyright infringement. We reserve the absolute right to remove templates violating safe operations policies.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">6. Account Termination</h3>
            <p>
              You may cancel your subscription at any time. We also reserve the right to suspend or close environments if a user violates our fair play policy or behaves maliciously under local sandbox rules.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
