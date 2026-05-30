"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Check, Shield, HelpCircle, Key, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface PricingProps {
  onStartBuilding: () => void;
  onLogin: () => void;
}

export default function Pricing({ onStartBuilding, onLogin }: PricingProps) {
  const faqs = [
    {
      q: 'What is BYOK?',
      a: 'BYOK stands for "Bring Your Own Key". It means you can connect your existing accounts from OpenAI, Claude, Gemini, or Grok directly. We use your keys to process worker runs, meaning your cost remains low and you have complete model sovereignty.'
    },
    {
      q: 'Are my files private?',
      a: 'Yes. Every uploaded file is written directly to an isolated local session container. There is no central intelligence scraper or model auto-training on your corporate documents.'
    },
    {
      q: 'Can I connect Gmail and Slack?',
      a: 'Absolutely. You can link your business apps in seconds. Once connected, your workers can read incoming events, compose drafts, or post notifications—but only after you verify the actions inside your Approvals ledger.'
    },
    {
      q: 'Can I upload company files?',
      a: 'Yes. You can upload spreadsheets, marketing logs, PDF manuals, or text databases. Your autonomous workers read them as secure references to keep answers aligned with your actual business standards.'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      subtitle: 'For trying Octo.',
      price: '$0',
      period: 'with your own keys',
      features: [
        'Up to 3 active AI workers',
        'Secure local file sandbox',
        'Simple linear workflow builder',
        'Connect your own AI model keys (BYOK)',
        'Private dashboard control suite'
      ],
      cta: 'Start Building',
      popular: false
    },
    {
      name: 'Pro',
      subtitle: 'For solo founders.',
      price: '$79',
      period: 'per month',
      features: [
        'Up to 10 active AI workers',
        'Dynamic multi-chain workflows',
        'Full Connected Business Apps suite',
        'Octo Marketplace access (Read-only)',
        'Manual approval gate protection',
        'Standard 5GB file storage limit'
      ],
      cta: 'Get Pro Access',
      popular: true
    },
    {
      name: 'Company',
      subtitle: 'For serious businesses.',
      price: '$240',
      period: 'per month',
      features: [
        'Unlimited autonomous workers',
        'Advanced loop workflow pipelines',
        '25GB high-volume file sandbox',
        'Enterprise Approval Core delegation',
        'Unified collaborative team layout',
        'Marketplace package selling rights',
        'Priority high-speed agent hosts'
      ],
      cta: 'Provision Company space',
      popular: false
    }
  ];

  return (
    <div className="bg-[#FDFDFD] text-stone-900 font-sans selection:bg-stone-900 selection:text-white" id="pricing-page-node">
      
      {/* SECTION 1 — HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 text-center space-y-6">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#9D8055] font-bold">
          Flexible transparent models
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-950 max-w-2xl mx-auto font-sans leading-none">
          Build your AI company.
        </h1>
        <p className="text-base text-stone-500 max-w-xl mx-auto font-light leading-relaxed">
          Create AI workers, automate workflows, connect your business apps, and let AI help run your company securely.
        </p>

        {/* Global actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartBuilding}
            className="px-6 py-3.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-sans tracking-tight transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Start Building for Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogin}
            className="px-6 py-3.5 bg-white hover:bg-stone-50 text-stone-850 border border-stone-200 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer"
          >
            Login
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 text-[10.5px] font-mono text-stone-400 select-none pt-8">
          <span className="flex items-center gap-1.5 font-medium text-stone-900">
            <Lock className="w-3.5 h-3.5 text-stone-900" /> Private by default
          </span>
          <span>•</span>
          <span>🔒 Secure connections</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-900">
            <Key className="w-3.5 h-3.5 text-stone-900" /> Connect your own models
          </span>
        </div>
      </section>

      {/* SECTION 2 — THE PLANS GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`bg-white border text-left p-8 rounded-3xl flex flex-col justify-between min-h-[580px] transition-all ${
                plan.popular 
                  ? 'border-stone-950 ring-1 ring-stone-950' 
                  : 'border-stone-200/90'
              }`}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-stone-950 font-sans tracking-tight">{plan.name}</h3>
                    {plan.popular && (
                      <span className="bg-stone-950 text-white font-mono uppercase text-[8.5px] tracking-wider font-bold px-2 py-0.5 rounded">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-1 font-sans">{plan.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-stone-950 leading-none">{plan.price}</span>
                  <span className="text-xs text-stone-400 font-sans">{plan.period}</span>
                </div>

                <ul className="space-y-4 pt-4 border-t border-stone-50 text-xs font-sans text-stone-700 font-light leading-relaxed">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#9D8055] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onStartBuilding}
                  className={`w-full py-4 text-xs font-bold font-sans rounded-xl tracking-tight transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-stone-950 text-white hover:bg-stone-850'
                      : 'bg-[#FCFCFA] hover:bg-stone-100 text-stone-800 border border-stone-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <p className="text-[10px] text-stone-400 text-center mt-3 font-mono">
                  Instant sandbox deployment. No commitment.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Quote / BYOK notice */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center" id="byok-notice">
        <div className="bg-[#FCFCFA] border border-stone-200/80 rounded-3xl p-8 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-150 flex items-center justify-center text-lg shadow-3xs shrink-0 select-none">
              🔑
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-950">Model Agnostic and Cost Efficient</h4>
              <p className="text-[10.5px] text-stone-400">Bring Your Own Key integration protocol description.</p>
            </div>
          </div>
          <p className="text-[11.5px] text-stone-500 font-light leading-relaxed">
            Octo does not restrict you to proprietary high-markup AI rates. By saving your own API model keys locally inside your settings sandbox, you pay raw cost directly to providers like Google, Mistral, or OpenAI. We compile the workflows—our fee is flat and zero premium, giving you full control over running your business.
          </p>
        </div>
      </section>

      {/* SECTION 3 — FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12">
        <div className="border-b border-stone-100 pb-4 text-left">
          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Common Inquiries</span>
          <h2 className="text-xl font-bold text-stone-900 font-sans mt-0.5">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-xs font-bold text-stone-950 font-sans flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-[11px] text-stone-500 font-light leading-relaxed pl-3.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
