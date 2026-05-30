import React from 'react';
import { Sparkles, HelpingHand, DollarSign, RotateCcw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="bg-[#FDFDFD] text-stone-900 font-sans min-h-screen py-24 px-6 md:px-12 selection:bg-stone-900 selection:text-white" id="refund-policy-view">
      <div className="max-w-4xl mx-auto space-y-20 text-left">
        
        {/* Page Header */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-widest font-mono text-[#9D8055] uppercase font-bold block">
            BILLING INTEGRITY • SATISFACTION RULE
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Refund Policy
          </h1>
          <p className="text-base text-stone-500 max-w-xl font-light leading-relaxed">
            We value your trust and build relationships with mutual respect. Here is how we handle subscriptions, cancellations, and refund claims.
          </p>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-12 text-sm text-stone-700 font-light leading-relaxed max-w-3xl">
          
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">1. Subscriptions & Trial Runs</h3>
            <p>
              Octo provides free sandboxes so you can experience our Specialist system and test your API keys with zero upfront risk. If you select a paid subscription (Pro or Company), your billing cycle runs monthly. You can cancel at any time—no questions asked, and no trailing fees.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">2. Standard Refund Requests</h3>
            <p>
              If you forget to cancel before a renewal dates, or are unhappy with your operational workspace, please let us know within <strong>14 days</strong> of the transaction. We will evaluate and issue a full credit refund for that cycle, provided there is no evidence of extensive resource abuse.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">3. Failed Payments & Retries</h3>
            <p>
              We know credit links can lapse. If a standard charge fails, we keep your AI workers paused in safe storage for up to 7 days. Your workspace will not be deleted, and you can re-activate or export local files whenever you verify the payment method.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">4. Marketplace Purchases</h3>
            <p>
              Octo Marketplace releases are uploaded and priced directly by independent blueprint builders. Since templates contain raw workspace codes, marketplace purchases are generally <strong>non-refundable</strong> unless the file code is proven corrupt or broken, in which case we will address the dispute on your behalf.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-950 font-sans">5. Requesting a Refund</h3>
            <p>
              To open a formal request or dispute a balance, email us at <strong className="text-stone-700 font-mono">support@octo.ai</strong> with your account details and billing ledger numbers. We review every ticket manually and respond within 2 business days.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
