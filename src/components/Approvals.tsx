"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Mail, CreditCard, RotateCw, FileCheck2, Trash2, ArrowUpRight, Check, X, AlertCircle } from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  workerName: string;
  appName: string;
  timeRequested: string;
  type: 'email' | 'refund' | 'social_post' | 'inventory' | 'payment';
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  previewContent: string;
  icon: string;
}

interface ApprovalsProps {
  onAddActivity?: (activityText: string, workerName: string) => void;
  onSetActiveTab?: (tab: string) => void;
}

export default function Approvals({ onAddActivity, onSetActiveTab }: ApprovalsProps) {
  const [successToast, setSuccessToast] = useState('');
  const triggerToast = (text: string) => {
    setSuccessToast(text);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 'app-1',
      title: 'Supplier email waiting approval',
      workerName: 'Atlas',
      appName: 'Gmail',
      timeRequested: '10 minutes ago',
      type: 'email',
      status: 'pending',
      description: 'Drafted compensation notification for supplier #8821 regarding custom component latency.',
      previewContent: 'To: supply-chain@nordic-mfg.com\nSubject: Delayed Ingress Mitigation Re: #8821\n\nDear supply-chain,\n\nWe noted an auxiliary overhead exceeding 2.4 days for Q1 batches. We would like to register a credit adjustment request of $850.00 to correct ledger alignment. Let us know if you accept.\n\nWarm regards,\nAtlas Autopilot',
      icon: '✉️'
    },
    {
      id: 'app-2',
      title: 'Customer refund waiting approval',
      workerName: 'Clara',
      appName: 'Stripe',
      timeRequested: '35 minutes ago',
      type: 'refund',
      status: 'pending',
      description: 'Stripe customer balance reimbursement for order #1109 due to long transit delay.',
      previewContent: 'Reimbursement action payload:\n\n- Customer ID: cus_982187AA\n- Balance Target: $149.00 USD\n- Destination: Ending in ...9012\n- Trigger rule check: verified_delay_checked',
      icon: '💳'
    },
    {
      id: 'app-3',
      title: 'Social post waiting approval',
      workerName: 'Valkyrie',
      appName: 'Marketplace',
      timeRequested: '1 hour ago',
      type: 'social_post',
      status: 'pending',
      description: 'Scheduled release of custom AI Workers blueprint to public library catalog.',
      previewContent: 'Release catalog parameters:\n\n- Package Label: Clara Support Automation Blueprint v2.1\n- Description: Pre-configured continuous polling loops for Gmail/Shopify. Ready-to-build layout.\n- Pricing index: BYOK Private Free tier',
      icon: '🌍'
    },
    {
      id: 'app-4',
      title: 'Inventory update waiting approval',
      workerName: 'Atlas',
      appName: 'Shopify',
      timeRequested: '3 hours ago',
      type: 'inventory',
      status: 'pending',
      description: 'Automated catalog sync: Increase batch capacity index based on supplier confirm alert.',
      previewContent: 'Catalog sync targets:\n\n- Item SKU: SV-99801 (Nordic Leather Desk Protector)\n- Previous stock: 12 units available\n- Proposed adjustment stock: +45 units (Re-routed import batch #4)',
      icon: '📦'
    },
    {
      id: 'app-5',
      title: 'Payment update waiting approval',
      workerName: 'Valkyrie',
      appName: 'Stripe',
      timeRequested: '5 hours ago',
      type: 'payment',
      status: 'pending',
      description: 'Audit reconciliation update. Re-index pending wire confirmations into active balance.',
      previewContent: 'Ledger correction index:\n\n- Transaction Identifier: tr_wire_82811A\n- Amount mapped: $4,923.00 USD\n- Reconciled target company account: Octo Dev Org',
      icon: '📈'
    }
  ]);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setApprovals(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: action };
      }
      return item;
    }));

    const item = approvals.find(x => x.id === id);
    if (!item) return;

    if (action === 'approved') {
      triggerToast(`Approved: ${item.title}`);
      if (onAddActivity) {
        onAddActivity(`Approved and dispatched ${item.title} requests for worker ${item.workerName}.`, item.workerName);
      }
    } else {
      triggerToast(`Rejected: ${item.title}`);
      if (onAddActivity) {
        onAddActivity(`Rejected and cancelled action: "${item.title}" from worker ${item.workerName}.`, item.workerName);
      }
    }
  };

  const pendingCount = approvals.filter(x => x.status === 'pending').length;

  return (
    <div className="space-y-28 py-6 font-sans relative" id="approvals-unified-page">
      
      {/* GLOBAL TOAST */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="p-4 bg-stone-950 text-white rounded-xl border border-stone-800 text-xs font-semibold text-center fixed top-24 right-12 z-50 shadow-lg flex items-center gap-2.5 max-w-sm"
          >
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — HERO */}
      <section className="bg-white border border-stone-150 rounded-3xl p-10 md:p-14 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-10 text-left" id="approvals-hero">
        <div className="space-y-4 max-w-2xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9D8055] font-bold block">
            Human Approval Core Controls
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Approvals.
          </h1>
          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xl pt-1">
            Review important actions before your AI workers send, post, update, or change anything. Everything defaults to safe custody.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] font-mono text-stone-400 select-none pt-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-900">
              <Shield className="w-3.5 h-3.5" /> Private by default
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              • Human-in-the-loop control
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> No automatic overrides
            </span>
          </div>
        </div>

        {/* Pending Indicator Banner */}
        <div className="bg-[#FAF9F5] border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-center text-left shrink-0 min-w-[200px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">PENDING VERIFICATIONS</span>
          <span className="text-4xl font-mono text-stone-950 font-bold mt-1 block">
            {pendingCount} item{pendingCount !== 1 ? 's' : ''}
          </span>
          <span className="text-[9px] text-[#9D8055] font-medium mt-1 inline-flex items-center gap-1">
            <span>● Actions paused for key check</span>
          </span>
        </div>
      </section>

      {/* SECTION 2 — THE APPROVAL ITEMS CONTAINER */}
      <section className="space-y-8" id="approvals-cards">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">SECURE LEDGER QUEUE</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Awaiting Your Authorization</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Total: {approvals.length} records</span>
        </div>

        <div className="space-y-8">
          {approvals.map(item => (
            <div 
              key={item.id} 
              className={`border rounded-3xl overflow-hidden transition-all text-left ${
                item.status === 'pending' 
                  ? 'bg-white border-stone-200 hover:border-stone-350 shadow-2xs' 
                  : item.status === 'approved' 
                    ? 'bg-[#FCFCFA]/80 border-stone-150 opacity-75' 
                    : 'bg-stone-50 border-stone-200 opacity-60'
              }`}
            >
              
              {/* Card top bar */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 bg-[#FCFCFA]/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-xl shadow-3xs shrink-0 select-none">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-stone-950 font-sans leading-none">{item.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase font-bold ${
                        item.status === 'pending' 
                          ? 'bg-[#FAF9F5] border border-stone-200 text-stone-700' 
                          : item.status === 'approved' 
                            ? 'bg-stone-950 text-white' 
                            : 'bg-stone-200 text-stone-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light font-sans max-w-xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center text-left md:text-right gap-1 font-sans">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">REQUEST SOURCE</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-950 shrink-0" />
                    <span className="text-xs font-semibold text-stone-900">{item.workerName} worker via {item.appName}</span>
                  </div>
                  <span className="text-[9.5px] text-stone-400 block mt-0.5">{item.timeRequested}</span>
                </div>
              </div>

              {/* Action preview block - strict plain layouts */}
              <div className="p-6 md:p-8 bg-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Visual payload */}
                <div className="lg:col-span-8 space-y-3">
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-bold block">PLAINTEXT TRANSACTION CONTEXT</span>
                  
                  <div className="bg-stone-950 text-stone-200 p-6 rounded-2xl border border-stone-850 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre max-h-[190px] shadow-inner select-all">
                    {item.previewContent}
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="lg:col-span-4 flex flex-col justify-end gap-3.5">
                  {item.status === 'pending' ? (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleAction(item.id, 'approved')}
                        className="w-full py-4 bg-stone-950 hover:bg-stone-850 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Package dispatch</span>
                      </button>

                      <button
                        onClick={() => handleAction(item.id, 'rejected')}
                        className="w-full py-3 bg-white hover:bg-stone-50 text-red-650 hover:text-red-800 border border-stone-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject & Discard</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5 text-xs text-stone-500 font-sans">
                      <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>This request was processed. No further manual alterations are permitted inside this sandbox log.</span>
                    </div>
                  )}

                  <div className="text-[9.5px] text-stone-400 leading-normal italic text-center lg:text-left">
                    Octo strictly executes authorized JSON batches only. All requests are logged in storage.
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — TRIVIA INFO BLOCK */}
      <section className="bg-[#FCFCFA] border border-stone-200 rounded-3xl p-8 max-w-4xl mx-auto flex items-start gap-5 text-left" id="security-notes">
        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg shadow-3xs shrink-0 select-none">
          ℹ️
        </div>
        <div className="space-y-1 font-sans">
          <h4 className="text-xs font-semibold text-stone-900">Why does this page exist?</h4>
          <p className="text-[11px] text-stone-500 leading-relaxed font-light">
            Octo is an autonomous system built for absolute integrity. Unlike low-quality integrations that run tasks blindly, your profile mandates secure keys before any external client communication or Stripe movement discharges.
          </p>
        </div>
      </section>

    </div>
  );
}
