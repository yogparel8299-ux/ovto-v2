"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Plus, X, CheckCircle2, CreditCard, ArrowRight, 
  FileText, Download, Database, Cpu, Layers, Activity, Sparkles, AlertCircle
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';

interface BillingProps {
  companyFiles: MockFile[];
  workersList: AIWorker[];
  onSetActiveTab: (tab: any) => void;
  onAddActivity?: (activityText: string, workerName: string) => void;
}

// Simple structures for billing
interface ConnectedModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Claude' | 'Gemini' | 'Grok' | 'Mistral' | 'OpenRouter' | 'Together AI';
  connected: boolean;
  apiKeyMask: string;
  estimatedUsage: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface InvoiceHistory {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Outstanding' | 'Refunded';
}

export default function Billing({
  companyFiles,
  workersList,
  onSetActiveTab,
  onAddActivity
}: BillingProps) {

  // Current Plan State
  const [currentPlan, setCurrentPlan] = useState<'Starter' | 'Pro' | 'Company'>('Pro');
  
  // BYOK Models State
  const [models, setModels] = useState<ConnectedModel[]>([
    { id: 'm-1', name: 'OpenAI GPT-4o', provider: 'OpenAI', connected: true, apiKeyMask: 'sk-...49a1', estimatedUsage: '$14.20 this month' },
    { id: 'm-2', name: 'Claude 3.5 Sonnet', provider: 'Claude', connected: true, apiKeyMask: 'sk-ant-...a8f3', estimatedUsage: '$32.10 this month' },
    { id: 'm-3', name: 'Gemini 1.5 Pro', provider: 'Gemini', connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' },
    { id: 'm-4', name: 'Grok 2.0', provider: 'Grok', connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' },
    { id: 'm-5', name: 'Mistral Large', provider: 'Mistral', connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' },
    { id: 'm-6', name: 'OpenRouter Routing', provider: 'OpenRouter', connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' },
    { id: 'm-7', name: 'Together AI GPU Core', provider: 'Together AI', connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' },
  ]);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'pm-1', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
    { id: 'pm-2', brand: 'Mastercard', last4: '8890', expiry: '06/27', isDefault: false }
  ]);

  // Invoices History State
  const [invoices, setInvoices] = useState<InvoiceHistory[]>([
    { id: 'inv-3', name: 'May Invoice #2389', date: 'May 01, 2026', amount: 49.00, status: 'Paid' },
    { id: 'inv-2', name: 'April Invoice #2194', date: 'Apr 01, 2026', amount: 49.00, status: 'Paid' },
    { id: 'inv-1', name: 'March Invoice #2004', date: 'Mar 01, 2026', amount: 49.00, status: 'Paid' },
  ]);

  // Interactive local actions / togglers
  const [successBanner, setSuccessBanner] = useState('');
  const [selectedModelForKeyInput, setSelectedModelForKeyInput] = useState<ConnectedModel | null>(null);
  const [enteredKey, setEnteredKey] = useState('');
  
  // Expand Forms
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardBrand, setNewCardBrand] = useState('Visa');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    street: '120 Hawthorne St',
    city: 'Palo Alto',
    state: 'CA',
    zip: '94301',
    country: 'United States'
  });
  const [tempAddress, setTempAddress] = useState({ ...billingAddress });

  // Plan Details configuration
  const planInfoByTier = {
    Starter: {
      name: 'Starter Plan',
      price: '$19.00',
      workerLimit: 2,
      storageLimit: '250 MB',
      appsLimit: 3,
      usageScope: 'Basic support queue automation only'
    },
    Pro: {
      name: 'No active plan',
      price: '$0.00',
      workerLimit: 8,
      storageLimit: '2 GB',
      appsLimit: 12,
      usageScope: 'Cross-functional operations matching'
    },
    Company: {
      name: 'Company Plan',
      price: '$149.00',
      workerLimit: 30,
      storageLimit: '25 GB',
      appsLimit: 100,
      usageScope: 'Custom autonomous agency structure'
    }
  };

  // 1. Plan Adjustment Actions
  const handleSelectPlan = (tier: 'Starter' | 'Pro' | 'Company') => {
    if (tier === currentPlan) return;
    setCurrentPlan(tier);
    
    // Auto populate a new invoice for demo if upgraded
    const newPrice = tier === 'Starter' ? 19.00 : tier === 'Pro' ? 49.00 : 149.00;
    const freshInvoice: InvoiceHistory = {
      id: `inv-new-${Date.now()}`,
      name: `Upcoming Cycle [${tier}]`,
      date: 'Next renewal June 01, 2026',
      amount: newPrice,
      status: 'Outstanding'
    };
    
    // Add updated activity tracking if handler registered
    if (onAddActivity) {
      onAddActivity(`SaaS Cycle Modified: Switched company plan to "${tier}" ($${newPrice.toFixed(2)}/mo).`, 'System');
    }

    setInvoices(prev => [freshInvoice, ...prev]);
    triggerToast(`Subscribed: Your company workspace is now on the Octo ${tier} Plan.`);
  };

  const triggerToast = (text: string) => {
    setSuccessBanner(text);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // 2. BYOK Configuration Actions
  const handleOpenConnect = (model: ConnectedModel) => {
    setSelectedModelForKeyInput(model);
    setEnteredKey(model.connected ? 'DECRYPTED_PLAINTEXT_LOCAL_KEY' : '');
  };

  const handleSaveModelKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelForKeyInput) return;

    const keyClean = enteredKey.trim();
    const isConnecting = keyClean.length > 0;

    setModels(prev => prev.map(m => {
      if (m.id === selectedModelForKeyInput.id) {
        return {
          ...m,
          connected: isConnecting,
          apiKeyMask: isConnecting ? `sk-...${keyClean.slice(-4) || '81b2'}` : '',
          estimatedUsage: isConnecting ? '$0.00 this month' : '$0.00 this month'
        };
      }
      return m;
    }));

    if (onAddActivity) {
      onAddActivity(
        isConnecting 
          ? `BYOK Credentials Linked: Connected personal credentials for ${selectedModelForKeyInput.provider} model.`
          : `BYOK Key Cleared: Disconnected credentials for ${selectedModelForKeyInput.provider} system.`, 
        'System'
      );
    }

    triggerToast(
      isConnecting
        ? `Linked model: ${selectedModelForKeyInput.provider} credentials verified and saved locally.`
        : `Cleared configuration: Disconnected ${selectedModelForKeyInput.provider} successfully.`
    );
    
    setSelectedModelForKeyInput(null);
    setEnteredKey('');
  };

  const handleDisconnectModel = (modelId: string, modelName: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        return { ...m, connected: false, apiKeyMask: '', estimatedUsage: '$0.00 this month' };
      }
      return m;
    }));
    
    if (onAddActivity) {
      onAddActivity(`BYOK Key Removed: Disconnected credentials for ${modelName}.`, 'System');
    }
    triggerToast(`Cleared configuration: Disconnected ${modelName} successfully.`);
  };

  // 3. Payment Methods Action
  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim() || newCardNumber.length < 4) return;

    const ending4 = newCardNumber.trim().slice(-4);
    const freshCard: PaymentMethod = {
      id: `pm-new-${Date.now()}`,
      brand: newCardBrand,
      last4: ending4,
      expiry: newCardExpiry || '08/30',
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods(prev => [...prev, freshCard]);
    setShowAddCard(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvv('');
    
    if (onAddActivity) {
      onAddActivity(`Payment Profile Upgraded: Added new saved credit card ending in *${ending4}.`, 'System');
    }
    triggerToast(`Payment instrument added: Card ending in *${ending4} saved securely.`);
  };

  const handleSetDefaultCard = (cardId: string, last4: string) => {
    setPaymentMethods(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === cardId
    })));
    triggerToast(`Default updated: Card ending in *${last4} is now your default payment method.`);
  };

  const handleDeleteCard = (cardId: string, last4: string) => {
    setPaymentMethods(prev => prev.filter(c => c.id !== cardId));
    triggerToast(`Card removed: Deleted payment method ending in *${last4}.`);
  };

  // 4. Address Action
  const handleUpdateAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingAddress({ ...tempAddress });
    setShowAddressForm(false);
    triggerToast(`Billing address updated successfully.`);
  };

  // 5. Invoices Download Trigger
  const handleDownloadInvoice = (invoiceName: string) => {
    triggerToast(`Downloading PDF: Authenticating secure link download for ${invoiceName}...`);
  };

  // Live Math derived from application states
  const activeWorkersCount = workersList.length;
  const filesCount = companyFiles.length;
  
  // Derive total storage used from MockFile size parameters
  const calculateTotalFilesBytes = () => {
    let mbSum = 0;
    companyFiles.forEach(file => {
      const sizeStr = file.size.toLowerCase();
      if (sizeStr.includes('mb')) {
        mbSum += parseFloat(sizeStr) || 0;
      } else if (sizeStr.includes('kb')) {
        mbSum += (parseFloat(sizeStr) || 0) / 1024;
      }
    });
    // Add default baseline storage if no files
    return mbSum > 0 ? `${mbSum.toFixed(2)} MB` : '3.42 MB';
  };

  const activePlanLimit = planInfoByTier[currentPlan];

  return (
    <div className="space-y-28 py-6 font-sans relative" id="billing-module-workspace-scroller">
      
      {/* GLOBAL NOTIFICATION TOAST POP */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-stone-950 text-white rounded-xl border border-stone-800 text-xs font-semibold text-center fixed top-24 right-12 z-50 shadow-lg flex items-center gap-2.5 max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-[#9D8055] shrink-0" />
            <span>{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — HERO SECTION */}
      <section className="bg-white border border-stone-150 rounded-3xl p-10 md:p-14 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-10" id="billing-hero">
        <div className="space-y-4 text-left max-w-2xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9D8055] font-bold block">
            Workspace Commercial Ledger
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Your billing and AI usage.
          </h1>
          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xl pt-1">
            Manage your plan, connected AI models, payments, invoices, and monthly usage. Absolutely personal and secure by design.
          </p>

          {/* Trust Indicators in Simple Human Terms */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] font-mono text-stone-400 select-none pt-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-900">
              <Shield className="w-3.5 h-3.5" /> Secure payments
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> BYOK supported
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Private by default
            </span>
          </div>
        </div>

        {/* Hero Control Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
          <a
            href="#plan-benefits-tier-comparison"
            className="px-5 py-3.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-sans tracking-tight text-center transition-all cursor-pointer shadow-xs"
          >
            Upgrade Plan
          </a>
          <a
            href="#billing-payment-methods-block"
            className="px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-xs font-medium font-sans text-center transition-all cursor-pointer"
          >
            Manage Billing
          </a>
        </div>
      </section>

      {/* SECTION 2 — CURRENT PLAN OVERVIEW */}
      <section className="space-y-6" id="billing-current-plan-card">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Active Subscription</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Billing status</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">No subscription active</span>
        </div>

        <div className="bg-[#FCFCFA] border border-stone-200 rounded-3xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="px-2.5 py-1 bg-stone-950 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-sm">
                Active Tier
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-stone-950 mt-3">
                {activePlanLimit.name}
              </h3>
              <p className="text-xs text-stone-400 mt-1">Plan scope fits: {activePlanLimit.usageScope}</p>
            </div>
            
            <div className="pt-2">
              <span className="text-4xl font-mono font-bold text-[#9D8055]">
                {activePlanLimit.price}
              </span>
              <span className="text-xs text-stone-400 font-light font-sans inline-block ml-1">USD / no billing active</span>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:pl-8 lg:border-l border-stone-150">
            {/* Limit A */}
            <div className="bg-white border border-stone-150 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">AI workers</span>
              <div className="space-y-1">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  {activeWorkersCount} / `{activePlanLimit.workerLimit}`
                </span>
                <p className="text-[10px] text-stone-500">No plan limits active yet</p>
              </div>
              {/* Simplified flat progress indicator */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-stone-900 h-full transition-all duration-550" 
                  style={{ width: `${Math.min(100, (activeWorkersCount / activePlanLimit.workerLimit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Limit B */}
            <div className="bg-white border border-stone-150 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">Storage</span>
              <div className="space-y-1">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  {calculateTotalFilesBytes()} / {activePlanLimit.storageLimit}
                </span>
                <p className="text-[10px] text-stone-500">Storage usage will appear after uploads</p>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-stone-900 h-full transition-all duration-550" 
                  style={{ width: '12%' }} // Simple clean representative bar
                />
              </div>
            </div>

            {/* Limit C */}
            <div className="bg-white border border-stone-150 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">Connected tools</span>
              <div className="space-y-1">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  6 / {activePlanLimit.appsLimit}
                </span>
                <p className="text-[10px] text-stone-500">Connected tools will appear after setup</p>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-stone-900 h-full transition-all duration-550" 
                  style={{ width: '40%' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3 — AI MODEL USAGE & BYOK CONNECTORS */}
      <section className="space-y-6 animate-fade-in" id="billing-byok-model-connections">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Independent Keys</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">AI Model Integration & Keys</h2>
          </div>
          <span className="text-xs font-mono text-[#9D8055] font-semibold flex items-center gap-1.5 bg-[#FAF9F5] border border-stone-150 px-2.5 py-0.5 rounded">
            💡 Bring Your Own Key (BYOK)
          </span>
        </div>

        <p className="text-xs text-stone-500 max-w-3xl leading-relaxed">
          Connect your custom enterprise endpoints directly. Your credentials remain 100% hidden and saved inside your browser local session. We bill only for core active employee workflows, not basic API tokens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {models.map(model => (
            <div
              key={model.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-[230px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#9D8055] bg-stone-50 border rounded px-2 py-0.5">
                    {model.provider}
                  </span>
                  
                  {/* Digital active signal */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${model.connected ? 'bg-stone-900' : 'bg-stone-200'}`} />
                    <span className="text-[9px] font-mono tracking-tight text-stone-400 font-semibold uppercase">
                      {model.connected ? 'Linked' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950 font-sans">{model.name}</h4>
                  {model.connected ? (
                    <span className="text-[10.5px] font-mono text-stone-400 block leading-none">
                      Active: {model.apiKeyMask}
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-sans text-stone-400 block italic leading-none">
                      No local credentials provided
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block font-bold">AI Usage</span>
                  <span className="text-[11px] font-mono font-medium text-stone-700 block">
                    {model.estimatedUsage}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {model.connected ? (
                    <button
                      onClick={() => handleDisconnectModel(model.id, model.name)}
                      className="px-2.5 py-1.5 bg-stone-50 hover:bg-red-50 text-[10px] font-bold text-stone-600 hover:text-red-700 rounded-lg hover:border-red-100 border border-stone-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenConnect(model)}
                      className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-850 text-[10px] font-extrabold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL / BOTTOM SLIDE IN TO SUBMIT MODEL API KEY LOCALLY */}
        <AnimatePresence>
          {selectedModelForKeyInput && (
            <div className="fixed inset-0 bg-stone-900/10 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white border border-stone-200 rounded-3xl p-8 max-w-md w-full text-left space-y-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[9.5px] font-mono bg-[#9D8055] text-white px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                      BYOK Connection
                    </span>
                    <h3 className="text-base font-bold text-stone-950 font-sans mt-2">
                      Connect {selectedModelForKeyInput.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedModelForKeyInput(null)}
                    className="p-1 text-stone-400 hover:text-stone-90 block rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveModelKeySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                      Secure Private Key
                    </label>
                    <input
                      type="password"
                      placeholder={selectedModelForKeyInput.provider === 'OpenAI' ? 'sk-proj-...' : 'Enter your credential key'}
                      value={enteredKey}
                      onChange={(e) => setEnteredKey(e.target.value)}
                      className="w-full text-xs font-mono bg-[#FCFCFA] border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950"
                      required
                    />
                    <p className="text-[10.5px] text-stone-400 leading-normal font-light">
                      We never store this key on our servers. Processing occurs inside your immediate network sandboxes completely.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedModelForKeyInput(null)}
                      className="px-4 py-2 text-stone-500 hover:bg-stone-50 text-xs rounded-lg border border-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#111] text-white text-xs font-bold rounded-lg hover:bg-stone-850"
                    >
                      Save Key Locally
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 4 — PAYMENT METHODS BLOCK */}
      <section className="space-y-6" id="billing-payment-methods-block">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Settlements</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Payment Methods</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Secure transactions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card list */}
          <div className="lg:col-span-7 bg-[#FCFCFA] border border-stone-200 rounded-3xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono uppercase text-stone-400 tracking-wider font-bold">Saved Instruments</span>
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="text-[11px] text-stone-900 border border-stone-200 bg-white px-2.5 py-1 rounded-lg hover:bg-stone-50 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Saved Card
              </button>
            </div>

            {/* Show Add Card Form if toggled */}
            <AnimatePresence>
              {showAddCard && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddCardSubmit}
                  className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4 text-left overflow-hidden"
                >
                  <p className="text-[11px] font-bold text-stone-900">Add Credit / Debit Card</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Card Number</label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value)}
                        className="w-full text-xs font-mono bg-stone-50 border border-stone-200 p-2 rounded-lg"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Exp</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="w-full text-xs font-mono bg-stone-50 border border-stone-200 p-2 rounded-lg"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value)}
                        className="w-full text-xs font-mono bg-stone-50 border border-stone-200 p-2 rounded-lg"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Brand</label>
                      <select
                        value={newCardBrand}
                        onChange={(e) => setNewCardBrand(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-[#eee] p-2 rounded-lg"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">MC</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-3 py-1.5 text-[10px] text-stone-400 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-[10px] font-bold bg-stone-900 text-white rounded hover:bg-stone-850"
                    >
                      Add Instrument
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {paymentMethods.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6 border border-dashed border-stone-200 rounded-xl">
                  No payment methods configured.
                </p>
              ) : (
                paymentMethods.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-[#f0f0eb] rounded-xl bg-[#FAF9F5] flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-[#9D8055]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-950 font-mono">
                            {item.brand} Ending in {item.last4}
                          </span>
                          {item.isDefault && (
                            <span className="text-[8px] font-mono tracking-widest uppercase bg-[#EFECE5] font-bold px-1.5 py-0.5 rounded text-stone-605">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 font-mono">Expires {item.expiry}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!item.isDefault && (
                        <button
                          onClick={() => handleSetDefaultCard(item.id, item.last4)}
                          className="px-2.5 py-1 text-[10px] font-medium border border-stone-200 hover:border-stone-400 rounded-lg bg-stone-50/20 text-stone-600 hover:text-stone-950 cursor-pointer"
                        >
                          Def
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(item.id, item.last4)}
                        className="p-1 px-1.5 text-stone-300 hover:text-red-700 hover:bg-red-50 text-[10px] rounded transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Billing address */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 space-y-4">
            <span className="text-[9.5px] font-mono uppercase text-stone-400 tracking-wider block font-bold">Billing Address</span>
            
            <AnimatePresence mode="wait">
              {!showAddressForm ? (
                <motion.div
                  key="address-display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1 font-mono text-xs text-stone-700 leading-normal font-light">
                    <p className="font-sans font-bold text-[#111]">Company Headquarters</p>
                    <p>{billingAddress.street}</p>
                    <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zip}</p>
                    <p>{billingAddress.country}</p>
                  </div>

                  <button
                    onClick={() => {
                      setTempAddress({ ...billingAddress });
                      setShowAddressForm(true);
                    }}
                    className="px-3 py-1.5 border border-stone-200 hover:border-stone-400 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Update Address
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="address-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleUpdateAddressSubmit}
                  className="space-y-3 font-sans text-xs text-stone-700"
                >
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">Street Address</label>
                      <input
                        type="text"
                        value={tempAddress.street}
                        onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-250 p-2 rounded text-xs"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">City</label>
                        <input
                          type="text"
                          value={tempAddress.city}
                          onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-250 p-2 rounded text-xs"
                          required
                        />
                      </div>
                      
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">State</label>
                        <input
                          type="text"
                          value={tempAddress.state}
                          onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-250 p-2 rounded text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">ZIP / Postal</label>
                        <input
                          type="text"
                          value={tempAddress.zip}
                          onChange={(e) => setTempAddress({ ...tempAddress, zip: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-250 p-2 rounded text-xs"
                          required
                        />
                      </div>
                      
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">Country</label>
                        <input
                          type="text"
                          value={tempAddress.country}
                          onChange={(e) => setTempAddress({ ...tempAddress, country: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-250 p-2 rounded text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-2.5 py-1.5 text-stone-400 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-[#111] font-bold text-white rounded hover:bg-stone-850"
                    >
                      Save Address
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* SECTION 5 — INVOICES HISTORY */}
      <section className="space-y-6 animate-fade-in" id="billing-invoices-records">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Archived Purchases</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Invoices</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Audited statements</span>
        </div>

        <div className="border border-stone-200 bg-white rounded-3xl overflow-hidden shadow-3xs max-w-5xl">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-[10px] font-semibold text-stone-405 font-mono grid grid-cols-12 gap-4 hidden sm:grid">
            <div className="col-span-5">INVOICE SPECIFICATION</div>
            <div className="col-span-3">BILLING DATE</div>
            <div className="col-span-2 text-center">STATUS</div>
            <div className="col-span-2 text-right">ACTION</div>
          </div>

          <div className="divide-y divide-stone-100">
            {invoices.map(inv => (
              <div
                key={inv.id}
                className="p-5 hover:bg-stone-50/25 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs text-stone-800 text-left"
              >
                {/* Specific invoice descriptor */}
                <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 border border-stone-200 bg-[#FCFCFA] rounded-xl flex items-center justify-center text-stone-955 shrink-0">
                    <FileText className="w-4 h-4 text-[#9D8055]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111]">{inv.name}</p>
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">
                      Cycle charge: ${inv.amount.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-12 sm:col-span-3 text-stone-500 font-mono">
                  {inv.date}
                </div>

                {/* Processing state checkbox */}
                <div className="col-span-12 sm:col-span-2 sm:text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold ${
                    inv.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100 border'
                      : 'bg-amber-50 text-amber-800 border-amber-100 border'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                {/* Run download */}
                <div className="col-span-12 sm:col-span-2 text-right">
                  <button
                    onClick={() => handleDownloadInvoice(inv.name)}
                    className="p-2 border border-stone-200 hover:border-stone-450 rounded-xl text-[11px] font-bold text-stone-700 inline-flex items-center gap-1 cursor-pointer hover:bg-stone-55/10"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9D8055]" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — REAL TIME USAGE SUMMARY */}
      <section className="space-y-6" id="billing-digital-utilization-summaries">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Parameters</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Usage Summary</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Live operational status</span>
        </div>

        <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
          Overview of active systems inside your company. Standalone parameters running securely offline.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          
          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">AI Workers Running</span>
              <Cpu className="w-4 h-4 text-[#9D8055]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-bold text-stone-950 tracking-tight">
                {activeWorkersCount}
              </span>
              <p className="text-[10px] text-stone-400">Specialized profiles operating</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Files Uploaded</span>
              <Database className="w-4 h-4 text-[#9D8055]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-bold text-stone-950 tracking-tight">
                {filesCount}
              </span>
              <p className="text-[10px] text-stone-400">Secure directory documents</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Workflows Active</span>
              <Layers className="w-4 h-4 text-[#9D8055]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-bold text-stone-950 tracking-tight">
                3
              </span>
              <p className="text-[10px] text-stone-400">Integrated automated matching loops</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Storage Used</span>
              <Activity className="w-4 h-4 text-[#9D8055]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-bold text-stone-950 tracking-tight">
                {calculateTotalFilesBytes()}
              </span>
              <p className="text-[10px] text-stone-400">Encrypted workspace volume</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — CHOOSE PLAN BENEFITS TIER COMPARISON */}
      <section className="space-y-6 pt-4 scroll-mt-24" id="plan-benefits-tier-comparison">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Elevate Status</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Plan Benefits</h2>
          </div>
          <span className="text-xs font-mono text-[#9D8055]">Select ideal workflow fits</span>
        </div>

        <p className="text-xs text-stone-500 max-w-3xl leading-relaxed">
          Upgrade your workspace capabilities instantly at any billing cycle. Changing tiers shifts matching limits, expands sandboxed repositories, and grants dynamic access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          
          {/* Card STARTER */}
          <div className={`p-8 bg-white border rounded-3xl text-left flex flex-col justify-between space-y-8 ${
            currentPlan === 'Starter' ? 'border-stone-950 ring-1 ring-stone-950 shadow-3xs' : 'border-stone-200'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-stone-400 tracking-widest uppercase">STARTER</span>
                {currentPlan === 'Starter' && (
                  <span className="text-[8.5px] font-mono uppercase bg-stone-105 border px-1.5 py-0.5 font-bold rounded">Current plan</span>
                )}
              </div>
              
              <div className="space-y-1">
                <span className="text-4xl font-mono font-bold text-[#111]">$19</span>
                <span className="text-xs text-stone-400 font-light block">Billed monthly (USD)</span>
              </div>

              <div className="border-t border-stone-100 pt-5 space-y-3.5 text-xs text-stone-600">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>2 AI Workers</strong> active</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>250 MB</strong> Storage</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>3 connected apps</strong></p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Core dispatch triggers only</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Starter')}
              disabled={currentPlan === 'Starter'}
              className={`w-full py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentPlan === 'Starter'
                  ? 'bg-stone-100 text-stone-400 border border-stone-150 cursor-not-allowed text-center'
                  : 'bg-white hover:bg-stone-50 text-stone-850 border border-stone-250 text-center'
              }`}
            >
              {currentPlan === 'Starter' ? 'Active Tier' : 'Choose Starter'}
            </button>
          </div>

          {/* Card PRO */}
          <div className={`p-8 bg-white border rounded-3xl text-left flex flex-col justify-between space-y-8 relative ${
            currentPlan === 'Pro' ? 'border-stone-950 ring-1 ring-stone-950 shadow-xs' : 'border-stone-200'
          }`}>
            {/* Pop tag for absolute premium vibe */}
            <div className="absolute -top-3 left-8 bg-[#9D8055] text-white font-mono text-[8px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-2xs">
              ★ Popular Workspace
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#9D8055] tracking-widest uppercase">PRO WORKSPACE</span>
                {currentPlan === 'Pro' && (
                  <span className="text-[8.5px] font-mono uppercase bg-stone-100 border px-1.5 py-0.5 font-bold rounded">Current plan</span>
                )}
              </div>
              
              <div className="space-y-1">
                <span className="text-4xl font-mono font-bold text-[#111]">$49</span>
                <span className="text-xs text-stone-400 font-light block">Billed monthly (USD)</span>
              </div>

              <div className="border-t border-stone-100 pt-5 space-y-3.5 text-xs text-stone-600">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>8 AI Workers</strong> active</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>2 GB</strong> Storage</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>12 connected apps</strong></p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Cross-functional routine matching</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> 24/7 background queue polling</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Pro')}
              disabled={currentPlan === 'Pro'}
              className={`w-full py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentPlan === 'Pro'
                  ? 'bg-stone-100 text-stone-400 border border-stone-150 cursor-not-allowed text-center'
                  : 'bg-stone-950 hover:bg-stone-850 text-white shadow-3xs text-center'
              }`}
            >
              {currentPlan === 'Pro' ? 'Active Tier' : 'Choose Pro'}
            </button>
          </div>

          {/* Card COMPANY */}
          <div className={`p-8 bg-white border rounded-3xl text-left flex flex-col justify-between space-y-8 ${
            currentPlan === 'Company' ? 'border-stone-950 ring-1 ring-stone-950 shadow-3xs' : 'border-stone-200'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-stone-400 tracking-widest uppercase">ENTERPRISE COMPANY</span>
                {currentPlan === 'Company' && (
                  <span className="text-[8.5px] font-mono uppercase bg-stone-100 border px-1.5 py-0.5 font-bold rounded">Current plan</span>
                )}
              </div>
              
              <div className="space-y-1">
                <span className="text-4xl font-mono font-bold text-[#111]">$149</span>
                <span className="text-xs text-stone-400 font-light block">Billed monthly (USD)</span>
              </div>

              <div className="border-t border-stone-100 pt-5 space-y-3.5 text-xs text-stone-600">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>30 AI Workers</strong> active</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>25 GB</strong> Storage</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Up to <strong>100 connected apps</strong></p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Custom autonomous agency structures</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9D8055]" /> Team synchronization & collaboration</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Company')}
              disabled={currentPlan === 'Company'}
              className={`w-full py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentPlan === 'Company'
                  ? 'bg-stone-100 text-stone-400 border border-stone-150 cursor-not-allowed text-center'
                  : 'bg-white hover:bg-stone-50 text-stone-850 border border-stone-250 text-center'
              }`}
            >
              {currentPlan === 'Company' ? 'Active Tier' : 'Choose Company'}
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="pt-12 border-t border-stone-100 text-left space-y-2 pb-6" id="billing-footer">
        <p className="text-[11px] text-stone-400 font-mono tracking-wide uppercase">Workspace ledger declarations</p>
        <p className="text-[10.5px] text-stone-400 font-light leading-normal max-w-xl">
          Everything is private by default. Users control their own AI model keys. No transactions undergo public processing hops without strict client ledger verification.
        </p>
      </footer>

    </div>
  );
}
