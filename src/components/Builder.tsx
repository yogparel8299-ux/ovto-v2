"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mic, FileText, CheckCircle2, Lock, ArrowRight, 
  RefreshCw, Layers, Users, ShieldCheck, Mail, Database, 
  Check, Play, Plus, X, Upload, CheckSquare, Settings, AlertCircle, HelpCircle,
  Monitor, Layout, ExternalLink, Dumbbell, Home, ShoppingBag, MessageSquare,
  TrendingUp, Calendar, Trash2
} from 'lucide-react';

const CodeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const CalendarIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface BuilderProps {
  onAddWorkers: (newWorkers: any[]) => void;
  onAddActivity: (activityText: string, workerName: string) => void;
  onAddFile?: (newFile: { name: string; size: string; type: string; uploadedAt: string }) => void;
  onToggleApp?: (appName: string) => void;
  connectedApps?: string[];
}

export default function Builder({ 
  onAddWorkers, 
  onAddActivity,
  onAddFile,
  onToggleApp,
  connectedApps = []
}: BuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [showPreview, setShowPreview] = useState(true); // Default preview to open for instant typing magic
  const [isListening, setIsListening] = useState(false);
  const [lastBuiltPrompt, setLastBuiltPrompt] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Custom uploaded files specifically in the builder session
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, isUploaded: boolean}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view tab inside the Live Preview panel
  const [previewTab, setPreviewTab] = useState<'landing' | 'product' | 'website'>('landing');

  // Interactive local states for simulated checkout stores inside preview
  const [gymSelectedClass, setGymSelectedClass] = useState<string>('');
  const [gymBookingSuccess, setGymBookingSuccess] = useState<boolean>(false);
  
  const [realEstateSelectedHouse, setRealEstateSelectedHouse] = useState<string>('');
  const [realEstateIssueStatus, setRealEstateIssueStatus] = useState<string>('');
  
  const [clothingCart, setClothingCart] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [clothingCustomSize, setClothingCustomSize] = useState<string>('M');

  const [supportSimulatedChat, setSupportSimulatedChat] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: "Hello! OctoSupport live dispatcher here. How can we resolve your query?" }
  ]);
  const [supportInputMessage, setSupportInputMessage] = useState<string>('');
  const [supportTyping, setSupportTyping] = useState<boolean>(false);

  const [localApps, setLocalApps] = useState<
    { name: string; icon: typeof Mail; desc: string; checked: boolean }[]
  >([]);

  // Rotational placeholders for Section 2
  const rotatingPlaceholders = [
    "Build me a SaaS product for gym owners.",
    "Build me a AI real estate company.",
    "Create a clothing brand business.",
    "Create a AI support company.",
    "Build me a AI company that sells mobile phones.",
    "Build a AI marketing agency."
  ];

  // Rotate placeholders regularly
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLocalApps(
      connectedApps.map((name) => ({
        name,
        icon: Mail,
        desc: 'Connected workspace integration',
        checked: true,
      }))
    );
  }, [connectedApps]);

  const handleAppToggle = (appName: string) => {
    if (onToggleApp) {
      onToggleApp(appName);
    } else {
      // Local fallback toggle
      setLocalApps(prev => prev.map(a => a.name === appName ? { ...a, checked: !a.checked } : a));
    }
    onAddActivity(`Integration with ${appName} updated inside workspace session.`, 'System');
  };

  // Generate tailored structures from prompt keywords (uses connected integrations only)
  const handleIntelligentAnalyze = (text: string) => {
    const query = text.toLowerCase().trim();
    const appsSlice = (n: number) => connectedApps.slice(0, n);
    const sessionFiles = uploadedFiles.map((f) => f.name).slice(0, 3);
    const files = sessionFiles.length > 0 ? sessionFiles : [];

    const build = (
      key: string,
      title: string,
      tagline: string,
      specs: { role: string; bio: string }[],
      teams: string[],
      workflows: string[]
    ) => ({
      key,
      title,
      tagline,
      workers: specs.map((s) => ({
        name: `${s.role} Agent`,
        role: s.role,
        bio: s.bio,
        apps: appsSlice(3),
      })),
      teams,
      workflows,
      appsNeeded: connectedApps,
      files,
    });

    if (query.includes('gym') || query.includes('fitness') || query.includes('workout') || query.includes('member') || query.includes('saas product for gym')) {
      return build(
        'gym',
        'FitPulse Gym SaaS',
        'Autonomous Member Retention & Schedule Desks',
        [
          { role: 'Support', bio: 'Fields membership questions, manages complaints, and coordinates schedule slots.' },
          { role: 'Marketing', bio: 'Analyzes retention logs and sends tailored promo briefs to save cancellations.' },
          { role: 'Operations', bio: 'Surveys trainer occupancy schedules and logs delay records.' },
        ],
        ['Member Engagement Desk', 'Gym Operations Triage'],
        ['Membership Save & Offer Dispatch Loop', 'Peak Hours Trainer Calendar Alignment']
      );
    }

    if (query.includes('real estate') || query.includes('estate') || query.includes('property') || query.includes('house') || query.includes('broker')) {
      return build(
        'estate',
        'Hearthstone Real Estate',
        'Sovereign Property Stewardship & Vetting Pipeline',
        [
          { role: 'Support', bio: 'Answers tenant inquiries and drafts polite responses.' },
          { role: 'Finance', bio: 'Audits invoice balances, reconciles deposits, and drafts logs.' },
          { role: 'Operations', bio: 'Coordinates repair vendor quotes and registers safety audit spreadsheets.' },
        ],
        ['Tenant Care Hub', 'Vendor Repayment Desk'],
        ['Late Payment Notification Loop', 'Emergency Repair Dispatch pipeline']
      );
    }

    if (query.includes('cloth') || query.includes('brand') || query.includes('apparel') || query.includes('fashion') || query.includes('store')) {
      return build(
        'clothing',
        'Vela Knits Clothing Brand',
        'Direct-to-Consumer Boutique Apparel Dispatch',
        [
          { role: 'Support', bio: 'Interprets sizing charts, coordinates refunds, and answers shipping inquiries.' },
          { role: 'Operations', bio: 'Cross-checks delivery manifests and reports low inventory gauges.' },
          { role: 'Marketing', bio: 'Schedules seasonal mailers, newsletter drafts, and caption sheets.' },
        ],
        ['Order Fulfillment Desk', 'Brand Engagement Group'],
        ['Fulfillment Delay Customer Warning Dispatch', 'Size Change Request Audit Automation']
      );
    }

    if (query.includes('support') || query.includes('customer') || query.includes('help') || query.includes('ticket')) {
      return build(
        'support',
        'OctoSupport Desk',
        'Instant Sentiment-Aware Helpdesk Fleet',
        [
          { role: 'Support', bio: 'Responds to ticket details, tags emotions, and handles standard issues.' },
          { role: 'Support', bio: 'Reconciles order timestamps to authorize refund workflows safely.' },
        ],
        ['Customer Success Group', 'Refund Dispatches Desk'],
        ['Triage Emotion Queue Scan', 'Auto Refund Validation Gateway Loop']
      );
    }

    return build(
      'general',
      'Sovereign Enterprise System',
      'Autonomous Custom Business Process Hub',
      [
        { role: 'Support', bio: 'Reviews incoming messages and drafts customized answer emails.' },
        { role: 'Operations', bio: 'Audits logistic tables, flagging delays or supplier feedback.' },
      ],
      ['Operations Cluster', 'Triage Division'],
      ['Continuous Document Synchronization Loop', 'Alert Pulse on Customer Delays']
    );
  };

  const handleBuild = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsBuilding(true);
    setBuildStep(0);
    setLastBuiltPrompt(prompt);

    // Staggered step progress to make it feel cinematic
    const t0 = setTimeout(() => setBuildStep(1), 800);
    const t1 = setTimeout(() => setBuildStep(2), 1600);
    const t2 = setTimeout(() => setBuildStep(3), 2400);
    const t3 = setTimeout(() => {
      setIsBuilding(false);
      onAddActivity(`Completed direct build parsing for "${prompt}". View Live preview update!`, 'System');
    }, 3200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleDeployBlueprints = () => {
    const outcome = handleIntelligentAnalyze(prompt || lastBuiltPrompt || rotatingPlaceholders[placeholderIndex]);
    
    // Format to internal AIWorker layout
    const mappedWorkers = outcome.workers.map((w, idx) => ({
      id: `worker-built-${Date.now()}-${idx}`,
      name: w.name,
      role: w.role,
      status: 'running',
      avatarColor: 'bg-stone-100 text-stone-900 border-stone-200',
      connectedApps: w.apps,
      tasksCount: Math.floor(Math.random() * 20) + 1
    }));

    onAddWorkers(mappedWorkers as any[]);
    onAddActivity(`Instantiated ${outcome.title} enclosing ${outcome.workers.length} continuous workers.`, 'System');

    // Notify user of immediate success with zero modals inside the page
    alert(`Success: Built & deployed "${outcome.title}" containing ${outcome.workers.length} workers to your active team.`);
    
    // Reset states elegantly
    setPrompt('');
    setLastBuiltPrompt('');
  };

  const handleVoiceSimulation = () => {
    setIsListening(true);
    onAddActivity(`Spoken audio feedback session registered.`, 'System');
    setTimeout(() => {
      setIsListening(false);
      setPrompt('Build an automated refund handling team that connects to my workspace apps and notifies the support channel.');
    }, 2800);
  };

  const handleUploadFileSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const newFile = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
      uploadedAt: 'Just now'
    };

    setUploadedFiles(prev => [...prev, { name: newFile.name, size: newFile.size, isUploaded: true }]);

    if (onAddFile) {
      onAddFile(newFile);
    }
    
    onAddActivity(`Indexed custom dossier: "${newFile.name}" into storage vault.`, 'System');
  };

  const sendSupportChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInputMessage.trim()) return;

    const userMessage = supportInputMessage;
    setSupportInputMessage('');
    setSupportSimulatedChat(prev => [...prev, { sender: 'user', text: userMessage }]);
    setSupportTyping(true);

    setTimeout(() => {
      setSupportTyping(false);
      let reply = "Your ticket has been prioritized! Our support team has logged this into your operations thread.";
      if (userMessage.toLowerCase().includes('refund') || userMessage.toLowerCase().includes('money')) {
        reply = 'I see your refund request. Our support agent has cross-checked your billing history and started the refund workflow.';
      } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hey')) {
        reply = "Hello! Welcome to our automated customer lounge. Our agent is ready to sync with your order number.";
      }
      setSupportSimulatedChat(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1205);
  };

  const activeQuery = prompt.trim() || lastBuiltPrompt || rotatingPlaceholders[placeholderIndex];
  const parsedOutcome = handleIntelligentAnalyze(activeQuery);
  const previewSupportName =
    parsedOutcome.workers.find((w) => w.role === 'Support')?.name ?? 'Support Agent';
  const previewMarketingName =
    parsedOutcome.workers.find((w) => w.role === 'Marketing')?.name ?? 'Marketing Agent';
  const previewOperationsName =
    parsedOutcome.workers.find((w) => w.role === 'Operations')?.name ?? 'Operations Agent';

  return (
    <div className="space-y-40 pb-36 px-4 md:px-0 font-sans" id="octo-grand-workspace-builder">
      
      {/* =========================================================================
                             SECTION 1 — HERO (MASSIVE HEADINGS)
         ========================================================================= */}
      <section className="text-left py-12 animate-fade-in" id="builder-hero-panel">
        <div className="max-w-4xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 font-sans leading-none"
          >
            What do you want <br/>
            Octo to build?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-stone-500 font-light max-w-2xl leading-relaxed"
          >
            Describe the business, AI workers, workflows, automations, or company you want. Octo will build it live.
          </motion.p>
        </div>
      </section>

      {/* =========================================================================
                      SECTION 2 — DOUBLE COLUMN SPLIT GRID: CHAT & LIVE PREVIEW
         ========================================================================= */}
      <section id="builder-main-split-area" className="relative">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ======================= LEFT COLUMN: CHAT & STRUCTURES ======================= */}
          <div className="lg:col-span-6 space-y-10">
            
            {/* Main giant chat box card */}
            <div className="border border-stone-200/80 rounded-2xl bg-white p-6 sm:p-10 shadow-xs transition-all hover:border-stone-300">
              <form onSubmit={handleBuild} className="space-y-6">
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={rotatingPlaceholders[placeholderIndex]}
                    rows={4}
                    className="w-full text-base sm:text-lg bg-[#FCFCFA] border border-stone-150 p-6 sm:p-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans resize-none placeholder-stone-400 text-stone-900 transition-all leading-relaxed"
                    id="massive-workspace-query-box"
                  />
                  
                  {/* Floating controllers inside textarea */}
                  <div className="absolute right-4 bottom-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVoiceSimulation}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isListening 
                          ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse scale-105' 
                          : 'bg-[#FCFCFB] border-stone-200 text-stone-450 hover:text-stone-900 hover:border-stone-350 hover:bg-stone-50'
                      }`}
                      title="Speak to Octo"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      disabled={!prompt.trim() || isBuilding}
                      className="bg-stone-950 hover:bg-stone-850 disabled:bg-stone-200 text-white font-semibold text-xs px-6 py-3 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Build
                    </button>
                  </div>
                </div>
              </form>

              {/* Listening simulated dialog banner */}
              <AnimatePresence>
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 border border-rose-100 rounded-xl bg-rose-50/45 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex gap-1 items-center">
                        <span className="w-1 h-3 bg-rose-500 animate-[bounce_0.8s_infinite] inline-block" />
                        <span className="w-1 h-5 bg-rose-500 animate-[bounce_0.6s_infinite_0.1s] inline-block" />
                        <span className="w-1 h-4 bg-rose-500 animate-[bounce_0.7s_infinite_0.2s] inline-block" />
                      </span>
                      <span className="text-xs font-semibold text-rose-800 tracking-tight">Listening for company ideas... Spoken audio synced.</span>
                    </div>
                    <button 
                      onClick={() => setIsListening(false)} 
                      className="text-[10px] font-mono text-stone-400 hover:text-stone-950 uppercase font-semibold"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Standard micro info label */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-stone-400">
                <span>Enterprise Sandbox Parameters Auto-Mapped</span>
                <span>Isolated Port Security</span>
              </div>

              {/* Instant exploration chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {rotatingPlaceholders.slice(0, 4).map((exPrompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPrompt(exPrompt);
                      setLastBuiltPrompt(exPrompt);
                    }}
                    className={`text-xs border px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                      prompt === exPrompt 
                        ? 'bg-stone-950 text-white border-stone-950' 
                        : 'bg-stone-50 border-stone-200 text-stone-605 hover:border-stone-400 hover:text-stone-950'
                    }`}
                  >
                    {exPrompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Cinematic step loader when building is active */}
            <AnimatePresence>
              {isBuilding && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="border border-stone-200 p-8 rounded-2xl bg-white space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-stone-600 animate-spin" />
                      <h4 className="text-sm font-bold text-stone-950 tracking-tight">Compiling structural nodes...</h4>
                    </div>
                    <span className="font-mono text-[10px] text-stone-400 font-bold uppercase tracking-wider">Syncing</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[10px] pl-1">
                    <div className={`p-3 border rounded-xl transition-all ${buildStep >= 0 ? "border-stone-200 bg-stone-50 text-stone-900" : "border-stone-100 opacity-30"}`}>
                      <p className="font-bold mb-1">{buildStep > 0 ? "✓ Checked" : "■ Parsing"}</p>
                      <p className="text-[9px] text-stone-500">Resolving intent...</p>
                    </div>
                    <div className={`p-3 border rounded-xl transition-all ${buildStep >= 1 ? "border-stone-200 bg-stone-50 text-stone-900" : "border-stone-100 opacity-30"}`}>
                      <p className="font-bold mb-1">{buildStep > 1 ? "✓ Staffed" : "■ Hiring"}</p>
                      <p className="text-[9px] text-stone-500">Assigning AI..."</p>
                    </div>
                    <div className={`p-3 border rounded-xl transition-all ${buildStep >= 2 ? "border-stone-200 bg-stone-50 text-stone-900" : "border-stone-100 opacity-30"}`}>
                      <p className="font-bold mb-1">{buildStep > 2 ? "✓ Tied" : "■ Routing"}</p>
                      <p className="text-[9px] text-stone-500">Linking pipelines...</p>
                    </div>
                    <div className={`p-3 border rounded-xl transition-all ${buildStep >= 3 ? "border-stone-200 bg-stone-50 text-stone-900" : "border-stone-100 opacity-30"}`}>
                      <p className="font-bold mb-1">{buildStep >= 3 ? "✓ Secured" : "■ Isolation"}</p>
                      <p className="text-[9px] text-stone-500">Closing rules...</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* =========================================================================
                             PROMPT REQUESTED: SHOW GENERATED STRUCTURE SECTIONS
               AI Workers • Teams • Workflows • Apps Needed • Files Suggested
               We render this on the left channel, updating in real-time as they type!
               ========================================================================= */}
            <div className="border border-stone-200 rounded-2xl bg-[#FCFCFA] p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-150 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-stone-950 tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-stone-700" />
                    Assembled Company Structure
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Calculated blueprint structure derived live from input.</p>
                </div>
                <span className="font-mono text-[9px] font-bold text-stone-850 px-2.5 py-1 bg-stone-200/55 rounded-full uppercase tracking-wider">
                  Live Sync
                </span>
              </div>

              {/* 1. AI Workers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono uppercase tracking-wider font-bold">
                  <span>AI Workers Assembled ({parsedOutcome.workers.length})</span>
                  <span>Autonomous Nodes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {parsedOutcome.workers.map((w, i) => (
                    <div key={i} className="p-4 border border-stone-150 bg-white rounded-xl flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-mono text-[10px] font-bold text-stone-700 border border-stone-200">
                        {w.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{w.name}</span>
                          <span className="text-[8px] font-mono bg-stone-100 border border-stone-200/50 text-stone-500 px-1.5 py-0.5 rounded font-bold uppercase">
                            {w.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-normal">{w.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Teams Section */}
              <div className="space-y-3">
                <span className="text-xs text-stone-400 font-mono uppercase tracking-wider font-bold block">
                  Collaborative Teams Designed
                </span>
                <div className="flex flex-wrap gap-3">
                  {parsedOutcome.teams.map((team, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white border border-stone-150 px-3 py-2 rounded-lg font-medium text-stone-800">
                      <Users className="w-3.5 h-3.5 text-stone-600" />
                      <span>{team}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Workflows Section */}
              <div className="space-y-3">
                <span className="text-xs text-stone-400 font-mono uppercase tracking-wider font-bold block">
                  Automated Workflows Linked
                </span>
                <div className="space-y-2">
                  {parsedOutcome.workflows.map((wf, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white border border-stone-150 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-stone-800">
                        <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin-slow text-stone-500 shrink-0" />
                        <span className="font-medium">{wf}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md font-bold uppercase shrink-0">
                        Loop Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Apps Needed */}
              <div className="space-y-3">
                <span className="text-xs text-stone-400 font-mono uppercase tracking-wider font-bold block">
                  Apps Required
                </span>
                <div className="flex flex-wrap gap-2">
                  {parsedOutcome.appsNeeded.map((app, i) => (
                    <span key={i} className="text-xs bg-white border border-stone-150 hover:border-stone-300 text-stone-800 px-3 py-1.5 rounded-lg font-medium select-none">
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Files Suggested */}
              <div className="space-y-3">
                <span className="text-xs text-stone-400 font-mono uppercase tracking-wider font-bold block">
                  Suggested Vault Files to Index
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedOutcome.files.map((file, i) => (
                    <div key={i} className="p-3 border border-dashed border-stone-200 bg-white rounded-lg flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-stone-650 font-medium truncate">
                        <FileText className="w-3.5 h-3.5 text-stone-400" />
                        {file}
                      </span>
                      <span className="text-[9px] font-mono text-stone-400 font-semibold shrink-0">Required</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Draft Trigger CTA */}
              <div className="pt-6 border-t border-stone-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-stone-450 leading-relaxed max-w-sm font-sans">
                  Instantiate this calculated configuration immediately to add this custom department.
                </p>
                <button
                  type="button"
                  onClick={handleDeployBlueprints}
                  className="bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Deploy Sovereign Division
                </button>
              </div>

            </div>

          </div>

          {/* ======================= RIGHT COLUMN: LIVE VISUAL PREVIEW ======================= */}
          {/* Real-time HTML/Product/Company simulator representing the requested views */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-6">
            
            <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-xs flex flex-col min-h-[640px]">
              
              {/* Device browser window top chrome header */}
              <div className="border-b border-stone-100 bg-[#FCFCFA] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Simulated standard traffic dots */}
                  <div className="flex gap-1.5 shrink-0 select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-250 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-250 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-250 inline-block" />
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 max-w-[200px] truncate bg-stone-100 border border-stone-200 px-3 py-1 rounded">
                    localhost:3000 • preview
                  </span>
                </div>

                {/* Switchable Visual Tabs: Landing Page, Product View, Live Website */}
                <div className="flex gap-2 bg-stone-100 border border-stone-200 p-0.5 rounded-xl shrink-0 select-none font-sans">
                  {[
                    { id: 'landing', label: 'Landing Page', icon: Layout },
                    { id: 'product', label: 'Product App', icon: Monitor },
                    { id: 'website', label: 'Simple Site', icon: ExternalLink }
                  ].map((tab) => {
                    const isSelected = previewTab === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-white shadow-xs text-stone-950 font-bold' 
                            : 'text-stone-400 hover:text-stone-800'
                        }`}
                      >
                        <TabIcon className="w-3 h-3 shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active preview viewport body */}
              <div className="p-8 flex-1 bg-[#F9F9FB] overflow-y-auto max-h-[580px]">
                <AnimatePresence mode="wait">
                  
                  {/* ==================================== GYM FLOW SaaS ==================================== */}
                  {parsedOutcome.key === 'gym' && (
                    <motion.div 
                      key="gym"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="space-y-6"
                    >
                      {previewTab === 'landing' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00E575] bg-[#00E575]/10 border border-[#00E575]/25 px-2.5 py-1 rounded-full">
                            FitPulse AI SaaS
                          </span>
                          <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-sans leading-tight">
                            Maximize Gym Check-Ins. <br />
                            Minimize Membership Attrition.
                          </h2>
                          <p className="text-sm text-stone-500 leading-relaxed font-sans font-light">
                            FitPulse AI deploys continuous, self-driving schedule desks and cancel-save assistants to keep your studio full and your ledger growing without hiring admin teams.
                          </p>
                          <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                            <div className="bg-[#FAF9FA] p-4 rounded-lg border border-stone-200/50">
                              <span className="text-[10px] uppercase font-mono text-stone-400 font-bold">Standard Tier</span>
                              <p className="text-xl font-bold text-stone-950 mt-1">₹4,250/mo</p>
                              <p className="text-[9px] text-stone-500 leading-normal mt-0.5">Continuous automated check-in and billing triage loop.</p>
                            </div>
                            <div className="bg-[#F2FCF5] p-4 rounded-lg border border-emerald-100">
                              <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold">Premium Tier</span>
                              <p className="text-xl font-bold text-emerald-950 mt-1">₹8,500/mo</p>
                              <p className="text-[9px] text-emerald-600 leading-normal mt-0.5">Enables AI Trainer schedules & automatic cancellation save triggers.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'product' && (
                        <div className="bg-stone-950 text-white rounded-xl p-8 border border-stone-800 shadow-xs space-y-6">
                          <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-stone-450 tracking-wider">Internal Desk Console</span>
                              <h3 className="text-lg font-bold font-sans">FitPulse AI Workspace</h3>
                            </div>
                            <span className="text-xs bg-[#00E575]/20 text-[#00E575] border border-[#00E575]/30 px-2 py-0.5 rounded font-bold font-mono">Continuous</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg">
                              <span className="text-[10px] text-stone-450 font-mono">Members Screened</span>
                              <p className="text-2xl font-bold font-sans mt-1">128</p>
                            </div>
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg">
                              <span className="text-[10px] text-stone-450 font-mono">Saved Cancel Requests</span>
                              <p className="text-2xl font-bold font-sans mt-1">14</p>
                            </div>
                          </div>

                          <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">Class Booking Status</h4>
                            <div className="text-xs space-y-2">
                              <div className="flex justify-between p-2 rounded bg-stone-950 border border-stone-850">
                                <span>Yoga Core Training ({previewSupportName})</span>
                                <span className="text-[#00E575] font-semibold">9/12 Filled</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-stone-950 border border-stone-850">
                                <span>HIIT Conditioning ({previewMarketingName})</span>
                                <span className="text-stone-400 font-semibold">4/15 Filled</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'website' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#00E575]">Member Interaction Playground</span>
                            <h3 className="text-lg font-bold text-stone-950 font-sans mt-1">Test Gym Membership Portal</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Click class buttons below to test live worker calendar routing.</p>
                          </div>

                          <div className="bg-stone-50 p-5 rounded-lg border border-stone-150 space-y-4">
                            <span className="text-xs font-bold text-stone-800 block">Select a Gym Session:</span>
                            <div className="flex flex-col gap-2.5">
                              {[
                                { id: 'yoga', label: 'Yoga Core Flow (10:00 AM)', desc: `Instructed by ${previewSupportName}` },
                                { id: 'hiit', label: 'Peak HIIT Power Training (12:30 PM)', desc: `Managed by ${previewMarketingName}` },
                                { id: 'spin', label: 'Dynamic Spin Blast (17:00 PM)', desc: "Continuous operations" }
                              ].map((cls) => (
                                <button
                                  key={cls.id}
                                  type="button"
                                  onClick={() => {
                                    setGymSelectedClass(cls.label);
                                    setGymBookingSuccess(true);
                                    onAddActivity(`Live Simulation: Member clicked booking request slot for "${cls.label}".`, 'System');
                                    setTimeout(() => setGymBookingSuccess(false), 2600);
                                  }}
                                  className={`w-full text-left p-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                                    gymSelectedClass === cls.label 
                                      ? 'bg-stone-950 text-white border-stone-950 shadow-xs' 
                                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-355'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">{cls.label}</span>
                                    <span className="text-[9px] font-mono text-stone-400 shrink-0">{cls.desc}</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <AnimatePresence>
                              {gymBookingSuccess && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs leading-normal flex items-center gap-2"
                                >
                                  <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                                  <span>Success! Coach AI has secured an invitation slot for: <strong className="font-bold">{gymSelectedClass}</strong>. Check notification logs.</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ==================================== REAL ESTATE AI ==================================== */}
                  {parsedOutcome.key === 'estate' && (
                    <motion.div 
                      key="estate"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="space-y-6"
                    >
                      {previewTab === 'landing' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6 text-left">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#B5915F] font-bold bg-[#FAF6EE] border border-[#ECD9BA] px-2.5 py-1 rounded">
                            Hearthstone AI
                          </span>
                          <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-serif leading-tight">
                            Sophisticated Property Stewardship.
                          </h2>
                          <p className="text-xs text-stone-500 leading-relaxed font-sans">
                            Continuous digital property administrators managing tenant screening checklists, invoice matches, and critical repairs automatically.
                          </p>
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                            <h4 className="text-xs font-bold text-stone-950">Active Managed Estates</h4>
                            <div className="text-[11px] text-stone-605 space-y-1 font-mono">
                              <p>• Metropolitan Luxury Flat A (98% tenant score)</p>
                              <p>• Downtown Penthouse Studio (lease active)</p>
                              <p>• Suburban Family Estate C (Repair desk linked)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'product' && (
                        <div className="bg-[#FAF9FA] text-stone-900 rounded-xl p-8 border border-stone-200 shadow-xs space-y-6">
                          <div className="flex justify-between items-center border-b border-stone-150 pb-4">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-stone-400">Ledger Auditing Desk</span>
                              <h3 className="text-base font-bold font-sans text-stone-950">Rent Ledger Dashboard</h3>
                            </div>
                            <span className="text-xs bg-stone-105 text-stone-900 border border-stone-200 px-2 py-0.5 rounded font-mono font-bold">Secure</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-stone-450 font-mono font-bold">
                              <span>Asset Class</span>
                              <span>Monthly Cashflow status</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between p-3 rounded-lg bg-white border border-stone-150">
                                <span className="font-bold text-stone-850">Metropolitan Luxury Flat</span>
                                <span className="text-emerald-700 font-bold font-mono">Paid (₹38,000)</span>
                              </div>
                              <div className="flex justify-between p-3 rounded-lg bg-white border border-stone-150">
                                <span className="font-bold text-stone-850">Downtown Penthouse Studio</span>
                                <span className="text-emerald-700 font-bold font-mono">Paid (₹42,500)</span>
                              </div>
                              <div className="flex justify-between p-3 rounded-lg bg-white border border-stone-150">
                                <span className="font-bold text-stone-850">Suburban Family Estate</span>
                                <span className="text-amber-800 font-semibold font-mono">Late warning sent</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'website' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-[#B5915F] font-bold">Tenant Portal Simulation</span>
                            <h3 className="text-lg font-bold text-stone-950 font-sans mt-0.5">Submit Tenant Maintenance Request</h3>
                            <p className="text-xs text-stone-500">Test the automated plumber/technician warning dispatch loop.</p>
                          </div>

                          <div className="bg-stone-50 p-5 rounded-lg border border-stone-150 space-y-4">
                            <span className="text-xs font-bold text-stone-800 block">Report an issue:</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                "Burst Plumbing emergencies",
                                "Elevator Key Faults",
                                "HVAC Air Filter Delay",
                                "Appliance Stove Replacement"
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setRealEstateSelectedHouse(item);
                                    setRealEstateIssueStatus(`${previewSupportName} coordinates dispatched. A repair ticket draft was saved to your workspace.`);
                                    onAddActivity(`Live Simulation: Tenant filed emergency repair alert for "${item}". Dispatching...`, 'System');
                                    setTimeout(() => setRealEstateIssueStatus(''), 4500);
                                  }}
                                  className="p-3 border bg-white rounded-xl text-[11px] font-semibold text-stone-700 text-center hover:border-stone-400 transition-all cursor-pointer"
                                >
                                  {item}
                                </button>
                              ))}
                            </div>

                            <AnimatePresence>
                              {realEstateIssueStatus && (
                                <motion.p 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-100 rounded-lg p-3 leading-normal"
                                >
                                  <strong>{previewSupportName}:</strong> {realEstateIssueStatus}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ==================================== CLOTHING BRAND ==================================== */}
                  {parsedOutcome.key === 'clothing' && (
                    <motion.div 
                      key="clothing"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="space-y-6"
                    >
                      {previewTab === 'landing' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6 text-center">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest font-mono text-stone-450 block">VELA KNITS</h4>
                          <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-sans leading-none mt-2">
                            Minimal Comfort Knitwear.
                          </h2>
                          <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                            Fine Australian merino knit articles coordinated autonomously by autonomous warehouse caretakers.
                          </p>

                          <div className="grid grid-cols-3 gap-3 text-left pt-4">
                            {[
                              { tag: "Merino Standard Tee", price: "₹2,450" },
                              { tag: "Essential Hoodie", price: "₹4,100" },
                              { tag: "Merino Trousers", price: "₹3,800" }
                            ].map((prod, idx) => (
                              <div key={idx} className="bg-[#FCFCFB] p-3 border border-stone-150 rounded-lg text-xs flex flex-col justify-between">
                                <span className="font-bold text-stone-800 text-[10px] leading-tight block">{prod.tag}</span>
                                <span className="font-mono text-stone-500 font-semibold block mt-3">{prod.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {previewTab === 'product' && (
                        <div className="bg-stone-950 text-white rounded-xl p-8 border border-stone-850 shadow-xs space-y-6 text-left">
                          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                            <div>
                              <span className="text-[10px] text-stone-400 font-mono tracking-wider block">Orders Dispatch List</span>
                              <h3 className="text-sm font-semibold">Active Dispatch Triage</h3>
                            </div>
                            <span className="text-[10px] font-mono text-[#00E575] bg-emerald-950/40 border border-[#00E575]/20 px-2 py-0.5 rounded font-bold uppercase">Online</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono text-stone-450 uppercase font-bold border-b border-stone-900 pb-2">
                              <span>Customer Order</span>
                              <span>Specialist Triage Status</span>
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                              <div className="flex justify-between p-2 rounded bg-stone-900 border border-stone-800">
                                <span>Order #2938 (M. Size Exchange)</span>
                                <span className="text-[#00E575] font-bold">{previewSupportName} Resolved</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-stone-900 border border-stone-800">
                                <span>Order #2937 (Heavyweight Parka)</span>
                                <span className="text-orange-400 font-bold">Factory Delay Alerted</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-stone-900 border border-stone-800">
                                <span>Order #2936 (Standard Wool Tee)</span>
                                <span className="text-stone-450 font-bold">Dispatched</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'website' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6">
                          <div className="text-center font-sans">
                            <span className="text-[10px] font-mono tracking-widest text-stone-450 block uppercase">Interactive Retail Playground</span>
                            <h3 className="text-lg font-bold text-stone-900 mt-1 font-serif">Simulated Customer Checkout</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Click clothing items below to see bag totals update live!</p>
                          </div>

                          <div className="bg-[#FAF9FB] p-5 rounded-lg border border-stone-150 space-y-4">
                            <div className="flex justify-between items-center border-b border-stone-150 pb-2">
                              <span className="text-xs font-bold text-stone-800">Available Garments:</span>
                              <div className="flex gap-1">
                                {['S', 'M', 'L', 'XL'].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setClothingCustomSize(s)}
                                    className={`w-6 h-6 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                      clothingCustomSize === s 
                                        ? 'bg-stone-950 text-white' 
                                        : 'bg-white border border-stone-200 text-stone-605 hover:border-stone-400'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-left">
                              {[
                                { name: "Merino Wool Beanie", price: 2100 },
                                { name: "Classic Knit Tee", price: 3450 },
                                { name: "Cashmere Turtleneck", price: 6800 },
                                { name: "Comfort Travel Jersey", price: 4200 }
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setClothingCart(prev => {
                                      const exists = prev.find(i => i.name === item.name);
                                      if (exists) {
                                        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
                                      }
                                      return [...prev, { name: item.name, price: item.price, qty: 1 }];
                                    });
                                    onAddActivity(`Live Simulation: Customer added "${item.name}" (Size: ${clothingCustomSize}) to cart.`, 'System');
                                  }}
                                  className="bg-white p-3 border border-stone-200 rounded-xl hover:border-stone-350 text-xs font-medium cursor-pointer flex flex-col justify-between h-[80px]"
                                >
                                  <span className="font-bold text-stone-850 leading-tight">{item.name}</span>
                                  <span className="text-stone-500 font-mono font-bold block mt-2">₹{item.price.toLocaleString()}</span>
                                </button>
                              ))}
                            </div>

                            {clothingCart.length > 0 && (
                              <div className="bg-white p-4 rounded-xl border border-stone-150 text-xs space-y-3 text-left">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                  <span className="font-bold text-stone-900">Your Checkout Bag</span>
                                  <button 
                                    onClick={() => setClothingCart([])}
                                    className="text-[10px] text-stone-400 hover:text-rose-600 font-bold font-mono transition-colors"
                                  >
                                    Clear Bag
                                  </button>
                                </div>
                                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                                  {clothingCart.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] text-stone-650">
                                      <span>• {c.name} (Size: {clothingCustomSize}) x{c.qty}</span>
                                      <span className="font-mono">₹{(c.price * c.qty).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-stone-100 pt-2.5 flex justify-between items-center font-bold text-stone-900">
                                  <span>Bag Total:</span>
                                  <span className="font-mono text-stone-950">
                                    ₹{clothingCart.reduce((acc, current) => acc + (current.price * current.qty), 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ==================================== CUSTOMER SUPPORT DESK ==================================== */}
                  {parsedOutcome.key === 'support' && (
                    <motion.div 
                      key="support"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="space-y-6"
                    >
                      {previewTab === 'landing' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6 text-left">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#0066FF] font-bold bg-[#EBF3FF] border border-[#C5DCFF] px-2.5 py-1 rounded">
                            OctoSupport
                          </span>
                          <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-sans leading-tight">
                            Annihilate customer backlog in seconds.
                          </h2>
                          <p className="text-xs text-stone-550 leading-relaxed font-sans mt-2">
                            Connect your workspace integrations so autonomous support agents can field tickets instantly and route validated refund approvals.
                          </p>
                          <div className="grid grid-cols-3 gap-3 pt-3">
                            {[
                              { label: "Inbox Triage", val: "100%" },
                              { label: "Reply speed", val: "120s" },
                              { label: "Security score", val: "100%" }
                            ].map((stat, i) => (
                              <div key={i} className="p-3 border border-stone-150/80 rounded-lg text-center bg-[#FCFCFB]">
                                <span className="font-mono text-stone-400 text-[9px] uppercase tracking-wider block">{stat.label}</span>
                                <span className="text-base font-bold font-sans text-stone-950 mt-1 block">{stat.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {previewTab === 'product' && (
                        <div className="bg-[#FCFCFB] text-stone-900 rounded-xl p-8 border border-stone-200 shadow-xs space-y-5 text-left">
                          <div className="flex justify-between items-center border-b border-stone-150 pb-3">
                            <div>
                              <span className="text-[10px] text-stone-400 font-mono block">Real-time Triage Console</span>
                              <h3 className="text-sm font-semibold text-stone-950">Active Ticket Sentinel Triage</h3>
                            </div>
                            <span className="text-xs bg-[#EBF3FF] text-[#0066FF] border border-[#C5DCFF] px-2 py-0.5 rounded font-mono font-bold uppercase">Online</span>
                          </div>

                          <div className="space-y-3">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 block">Recent Customer Threads</span>
                            <div className="space-y-2 text-xs">
                              <div className="p-3 bg-white border border-stone-150 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-stone-900">"Where is my ordered cargo?"</p>
                                  <p className="text-[10px] text-stone-450">Triage: Shipping Delayed | Agent draft ready</p>
                                </div>
                                <span className="text-[9px] font-mono text-orange-850 bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded-full font-bold">Medium</span>
                              </div>
                              <div className="p-3 bg-white border border-stone-150 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-stone-900">"The jeans are sized way too small"</p>
                                  <p className="text-[10px] text-stone-450">Triage: Exchanges | Sizing guidelines synced</p>
                                </div>
                                <span className="text-[9px] font-mono text-emerald-805 bg-emerald-50 border border-emerald-250/50 px-2 py-0.5 rounded-full font-bold">Neutral</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === 'website' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-[#0066FF] font-bold">Live Support Simulation</span>
                            <h3 className="text-lg font-bold text-stone-950 font-sans mt-0.5">Automated Customer Live Chat</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Type a question below (e.g. "I want a refund", "Where's my order?") and test your AI agent response time!</p>
                          </div>

                          <div className="bg-[#FAF9FB] rounded-xl border border-stone-150 p-4 space-y-4">
                            {/* Chat messages viewport */}
                            <div className="h-44 overflow-y-auto bg-white p-4 border border-stone-150 rounded-lg space-y-3 text-left">
                              {supportSimulatedChat.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-3 rounded-xl max-w-[85%] text-xs leading-normal font-sans ${
                                    msg.sender === 'user' 
                                      ? 'bg-stone-905 text-white bg-stone-900' 
                                      : 'bg-stone-50 text-stone-800 border border-stone-200/70'
                                  }`}>
                                    <p className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-1">
                                      {msg.sender === 'user' ? 'You' : 'Support Agent'}
                                    </p>
                                    <p>{msg.text}</p>
                                  </div>
                                </div>
                              ))}
                              
                              {supportTyping && (
                                <div className="flex justify-start">
                                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50 text-[11px] text-stone-400 font-mono">
                                    Support Agent typing response...
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Chat inputs */}
                            <form onSubmit={sendSupportChatMessage} className="flex gap-2">
                              <input
                                type="text"
                                value={supportInputMessage}
                                onChange={(e) => setSupportInputMessage(e.target.value)}
                                placeholder="Type complaint or click quick choice..."
                                className="flex-1 bg-white border border-stone-200 rounded-lg text-xs px-3 focus:outline-none focus:ring-1 focus:ring-stone-950"
                              />
                              <button
                                type="submit"
                                className="bg-stone-950 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-stone-850 cursor-pointer"
                              >
                                Send
                              </button>
                            </form>

                            {/* Quick tips list */}
                            <div className="flex gap-2">
                              {[
                                "Where is my ordered package?",
                                "Can I get a full refund?"
                              ].map((btnText, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setSupportInputMessage(btnText);
                                    onAddActivity(`Live Simulation: Customer selected quick check: "${btnText}".`, 'System');
                                  }}
                                  className="text-[10px] bg-white border border-stone-200 text-stone-600 hover:text-stone-950 hover:border-stone-400 px-2.5 py-1.5 rounded-lg cursor-pointer font-sans"
                                >
                                  {btnText}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ==================================== GENERAL DEFAULT SIMULATOR ==================================== */}
                  {parsedOutcome.key === 'general' && (
                    <motion.div 
                      key="general"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="space-y-6"
                    >
                      {previewTab === 'landing' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-6 text-left">
                          <span className="text-[10px] font-mono tracking-widest text-[#FF0075] uppercase bg-[#FFF0F5] border border-[#FFD5E5] px-2.5 py-1 rounded font-bold">
                            Swiss Modernist Block
                          </span>
                          <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-sans leading-none mt-2">
                            Sovereign Custom Sandbox.
                          </h2>
                          <p className="text-xs text-stone-500 leading-relaxed font-sans">
                            Enter any concept like 'gym owners', 'real estate', 'clothing brand', or 'customer support' into our active prompt field to review dynamically generated companies.
                          </p>
                          <div className="p-4 bg-[#FCFCFB] rounded-xl border border-stone-150/60 font-mono text-[10px] leading-relaxed text-stone-605">
                            <p className="font-bold text-stone-950 uppercase border-b border-stone-200 pb-1.5 mb-2 flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-stone-400" />
                              Sandbox Isolation
                            </p>
                            <p>No telemetry log output. No public metrics leak. All computational nodes are bound securely on port ingress.</p>
                          </div>
                        </div>
                      )}

                      {previewTab === 'product' && (
                        <div className="bg-stone-950 text-white rounded-xl p-8 border border-stone-850 shadow-xs space-y-5 text-left font-mono">
                          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                            <div>
                              <p className="text-[10px] text-stone-450 uppercase">Continuous Node Monitoring</p>
                              <p className="text-sm font-semibold">Active Operational Workspace</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-pulse" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                              <span className="text-stone-450 text-[10px]">Memory load</span>
                              <p className="text-base font-bold mt-1">14.8 MB / 20 GB</p>
                            </div>
                            <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                              <span className="text-stone-450 text-[10px]">Sandbox processes</span>
                              <p className="text-base font-bold mt-1">2 running</p>
                            </div>
                          </div>

                          <div className="p-3 bg-stone-900 border border-stone-850 rounded text-[10px] space-y-1 text-stone-400">
                            <p className="font-bold text-stone-200 border-b border-stone-800 pb-1">Activity logs:</p>
                            <p>• {previewSupportName} initial startup secure handshakes verified.</p>
                            <p>• Synchronizing document maps into vector vault...</p>
                          </div>
                        </div>
                      )}

                      {previewTab === 'website' && (
                        <div className="bg-white border border-stone-150 p-8 rounded-xl shadow-xs space-y-5 text-left">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-[#FF0075] font-bold">Standard Sandbox Playground</span>
                            <h3 className="text-lg font-bold text-stone-950 font-sans mt-0.5">Isolated Routine Dispatcher</h3>
                            <p className="text-xs text-stone-500">Test default sandboxed triggers</p>
                          </div>

                          <div className="bg-stone-50 rounded-xl p-5 border border-stone-150 space-y-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onAddActivity("Live Simulation: Checked custom handbook compliance.", 'System');
                                  alert("System checked. Sandbox index compiles with zero warning parameters.");
                                }}
                                className="flex-1 bg-stone-950 text-white p-3 rounded-lg text-xs font-bold font-sans hover:bg-stone-850 cursor-pointer text-center"
                              >
                                Test handbook vectors
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onAddActivity("Live Simulation: Re-queued pending spreadsheet.", 'System');
                                  alert("Simulating vector alignment cycle. Check transaction streams.");
                                }}
                                className="flex-1 bg-white border border-stone-200 hover:border-stone-450 p-3 rounded-lg text-xs font-bold font-sans text-stone-800 cursor-pointer text-center"
                              >
                                Re-queue spreadsheet
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Bottom deployment block inside preview device */}
              <div className="border-t border-stone-100 bg-[#FCFCFA] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-stone-400 font-mono">Status: Draft Verified OK</span>
                <button
                  type="button"
                  onClick={handleDeployBlueprints}
                  className="bg-stone-950 text-white font-bold px-4 py-2 rounded-lg text-[11px] hover:bg-stone-850 cursor-pointer transition-all"
                >
                  Deploy Sovereign Workspace
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
                             SECTION 4 — WHAT OCTO CAN BUILD
         ========================================================================= */}
      <section className="space-y-12" id="builder-capabilities-section">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Simple building capabilities
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Octo sets up complete, self-directing modules designed around your human explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            { title: 'AI Workers', desc: 'Expert staff that handle routine inbox triage & database checks continuously.' },
            { title: 'AI Teams', desc: 'Clusters of specialized workers that coordinate tasks and request feedback.' },
            { title: 'Customer Support', desc: 'Drafting emails, addressing issues, and filing status updates politely.' },
            { title: 'Finance Systems', desc: 'Auditing ledgers, reporting transaction entries, and matching sales records.' },
            { title: 'Marketing Teams', desc: 'Assembling outreach newsletters, formatting launch calendars, and scheduling copy.' },
            { title: 'Supplier Management', desc: 'Tracking product packages, emailing suppliers on delays, and updating spreadsheets.' },
            { title: 'Inventory Systems', desc: 'Updating low-stock notifications and managing records.' },
            { title: 'Automated Work', desc: 'Running recurring synchronization loops without human intervention.' },
            { title: 'Research Teams', desc: 'Gathering contextual data logs across indexed files.' },
            { title: 'Operations Teams', desc: 'Connecting multiple workflows and maintaining database files.' }
          ].map((block, i) => (
            <div 
              key={i} 
              className="p-8 border border-stone-150 rounded-2xl bg-white flex flex-col justify-between hover:border-stone-300 transition-all min-h-[160px]"
            >
              <span className="text-sm font-bold text-stone-950 tracking-tight font-sans block">
                {block.title}
              </span>
              <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                {block.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
                             SECTION 5 — CONNECT YOUR BUSINESS
         ========================================================================= */}
      <section className="space-y-12" id="builder-integration-grid">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Connect the tools your business already uses
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            AI workers utilize secure, read-write access to these tools to actually run your active company parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {localApps.map((app, i) => (
            <div 
              key={i} 
              className="p-6 border border-stone-150 rounded-2xl bg-white hover:border-stone-350 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/40 flex items-center justify-center">
                      <app.icon className="w-4 h-4 text-stone-900" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">{app.name}</span>
                  </div>
                  
                  {/* Styled simple switch toggle */}
                  <button
                    type="button"
                    onClick={() => handleAppToggle(app.name)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      app.checked ? 'bg-stone-950' : 'bg-stone-200'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        app.checked ? 'translate-x-4' : 'translate-x-0'
                      }`} 
                    />
                  </button>
                </div>
                <p className="text-xs text-stone-450 leading-relaxed min-h-[36px]">{app.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono">
                <span className="text-stone-400">Status:</span>
                <span className={app.checked ? "text-emerald-700 font-bold" : "text-stone-400"}>
                  {app.checked ? "Connected" : "Not Linked"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
                             SECTION 6 — COMPANY FILES (KNOWLEDGE BASE)
         ========================================================================= */}
      <section className="space-y-12" id="builder-file-uploader-panel">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Upload your company files
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            AI workers use these PDFs, spreadsheets, spreadsheets, or docs as background knowledge, return procedures, list databases, and standard operating procedures.
          </p>
        </div>

        {/* Spacious Upload Vault Box */}
        <div className="border border-stone-200 rounded-2xl bg-white p-8 md:p-12 space-y-8">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-150 hover:border-stone-950 hover:bg-stone-50/50 transition-all p-12 rounded-xl text-center cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleUploadFileSimulation}
              className="hidden" 
              accept=".xlsx,.xls,.pdf,.csv,.doc,.docx,.txt"
            />
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center mx-auto text-stone-450 group-hover:text-stone-900 group-hover:scale-105 transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-950">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-stone-450 mt-1.5 leading-normal">
                  Supported formats: spreadsheets (.xlsx, .csv), PDFs, spreadsheets, documents, datasets, company files, SOPs, pricing sheets, or inventory listings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-400 border-b border-stone-100 pb-6">
            <span className="flex items-center gap-1.5 leading-normal">
              <Lock className="w-3.5 h-3.5 text-stone-450 shrink-0" />
              Everything stays private and encrypted by default.
            </span>
            <span>20 GB absolute sandbox storage space included.</span>
          </div>

          {/* Uploaded Files Feed list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Uploaded Dossiers ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/20 text-xs text-stone-800"
                  >
                    <span className="flex items-center gap-2.5 font-bold">
                      <FileText className="w-4 h-4 text-stone-400" />
                      {file.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-stone-400">{file.size}</span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded font-bold">Indexed Vault</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
                             SECTION 7 — MINIMAL SPECTACULAR FOOTER
         ========================================================================= */}
      <footer className="pt-20 border-t border-stone-100 text-center space-y-4 text-xs font-mono text-stone-400" id="builder-minimalist-footer">
        <p>octo • human enterprise sandbox workspace • 2026</p>
        <p className="max-w-md mx-auto text-[10px] leading-relaxed">
          No external model training, zero data resale, zero telemetry logs published publicly. Workspace assets are isolated behind SOC3 architecture guidelines.
        </p>
      </footer>

    </div>
  );
}
