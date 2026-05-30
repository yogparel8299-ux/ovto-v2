import React from 'react';
import { ShieldAlert, Fingerprint, Lock, Trash2, EyeOff } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#FDFDFD] text-stone-900 font-sans min-h-screen py-24 px-6 md:px-12 selection:bg-stone-900 selection:text-white" id="privacy-policy-view">
      <div className="max-w-4xl mx-auto space-y-20 text-left">
        
        {/* Page Header */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            PRIVACY GUARANTEE • LAST UPDATED MAY 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Privacy Policy
          </h1>
          <p className="text-base text-stone-500 max-w-xl font-light leading-relaxed">
            We believe you own your work. Our privacy architecture ensures that everything you input, upload, or build stays entirely inside your control.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-stone-100">
          <div className="space-y-2">
            <Lock className="w-5 h-5 text-[#9D8055]" />
            <h3 className="text-sm font-bold text-stone-950 font-sans">105% Private Sandbox</h3>
            <p className="text-xs text-stone-500 leading-normal font-light">Your workflows, worker scripts, and raw execution logs operate in isolated environments. No central scraper or general leaks.</p>
          </div>
          <div className="space-y-2">
            <Fingerprint className="w-5 h-5 text-[#9D8055]" />
            <h3 className="text-sm font-bold text-stone-950 font-sans">No Auto-Scraping</h3>
            <p className="text-xs text-stone-500 leading-normal font-light">We do not train general AI model weights on your company manuals, operational sheets, or private communications.</p>
          </div>
          <div className="space-y-2">
            <Trash2 className="w-5 h-5 text-[#9D8055]" />
            <h3 className="text-sm font-bold text-stone-950 font-sans">Complete Purge Rights</h3>
            <p className="text-xs text-stone-500 leading-normal font-light">Click delete once inside your profile to wipe stored tokens, local session variables, and worker logs instantly.</p>
          </div>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-12 text-sm text-stone-700 font-light leading-relaxed max-w-3xl">
          
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">1. Your Files & Data Custody</h3>
            <p>
              When you drag spreadsheets or documents into the Octo environment, those assets are packaged securely. They are used exclusively as system context for your connected specialists. No third-party model gets automatic bulk training permissions.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">2. AI Workers Stay Private</h3>
            <p>
              By default, every custom specialist you design—including their behavioral rules, tool hooks, and system prompts—is invisible to the world. Marketplace submissions require explicit human authorization, confirmation of metadata schema, and manual publishing clicks.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">3. Workflows and App Permissions</h3>
            <p>
              We integrate with Gmail, Stripe, Slack, and other client systems through secure authorization flows. Our system does not poll or edit records automatically unless specified by your linear workflows. Even then, you can enable human approvals for absolute transaction guarding.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">4. Complete Account Cleansing</h3>
            <p>
              Your right to disappear is absolute. Under the compliance controls in your Settings page, you can request an instant deletion. Once processed, we flush your records, decrypt credentials securely, and purge associated containers from running hosts.
            </p>
          </div>

        </div>

        {/* Contact Note */}
        <div className="p-8 bg-[#FCFCFA] border border-stone-200 rounded-3xl max-w-2xl font-sans">
          <h4 className="text-xs font-bold text-stone-950">Have a privacy question?</h4>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
            We speak human. Write to our legal operations team at <strong className="text-stone-700 font-mono">sovereignty@octo.ai</strong> with any questions about hosting security, ledger audits, or data protection.
          </p>
        </div>

      </div>
    </div>
  );
}
