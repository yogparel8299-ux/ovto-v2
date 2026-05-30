"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Sparkles, Briefcase, RefreshCw, Users, FileText, Settings,
  ArrowRight, Shield, Lock, CheckCircle2, Download, Eye, User,
  Plus, X, FileSpreadsheet, BookOpen, Clock, CheckCircle, Database,
  DollarSign, TrendingUp, Layers, HelpCircle, Activity, Globe, Wifi, Check
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';

interface MarketplaceProps {
  companyFiles: MockFile[];
  onSetCompanyFiles: React.Dispatch<React.SetStateAction<MockFile[]>>;
  workersList: AIWorker[];
  onSetWorkersList: React.Dispatch<React.SetStateAction<AIWorker[]>>;
  onAddActivity: (activityText: string, workerName: string) => void;
  onSetActiveTab: (tab: any) => void;
}

// Structured Interfaces
interface AgentListing {
  id: string;
  name: string;
  role: 'Finance' | 'Operations' | 'Support' | 'Research' | 'Marketing' | 'Legal';
  author: string;
  description: string;
  price: number;
  avatarColor: string;
  connectedApps: string[];
  capabilities: string[];
  saves: number;
  featured: boolean;
}

interface SkillListing {
  id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  targetRole: string;
  saves: number;
}

interface DatasetListing {
  id: string;
  name: string;
  size: string;
  type: string;
  description: string;
  author: string;
  price: number;
  saves: number;
}

interface RentalFeedUpdate {
  timeAgo: string;
  message: string;
  bytesText: string;
}

interface RentalListing {
  id: string;
  title: string;
  description: string;
  author: string;
  rentPrice: number; // recurring fee
  category: string;
  saves: number;
  liveUpdates: RentalFeedUpdate[];
}

export default function Marketplace({
  companyFiles,
  onSetCompanyFiles,
  workersList,
  onSetWorkersList,
  onAddActivity,
  onSetActiveTab
}: MarketplaceProps) {

  // 1. DYNAMIC SYSTEM STATS & WALLET
  const [walletBalance, setWalletBalance] = useState<number>(450.00);
  const [successBanner, setSuccessBanner] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTabSub, setActiveTabSub] = useState<'all' | 'agents' | 'skills' | 'datasets' | 'rentals' | 'creators'>('all');

  // Purchased items states (to prevent double purchases and trigger direct installation)
  const [purchasedAgentIds, setPurchasedAgentIds] = useState<string[]>([]);
  const [purchasedSkillIds, setPurchasedSkillIds] = useState<string[]>([]);
  const [purchasedDatasetIds, setPurchasedDatasetIds] = useState<string[]>([]);
  
  // Rented feeds states
  const [rentedFeedIds, setRentedFeedIds] = useState<string[]>([]);

  // Simulation state for incoming live streaming ticks
  const [simulatedLiveTicks, setSimulatedLiveTicks] = useState<Record<string, RentalFeedUpdate[]>>({});

  // Publish form state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pubType, setPubType] = useState<'agent' | 'skill' | 'dataset' | 'rental'>('agent');
  const [pubTitle, setPubTitle] = useState('');
  const [pubDescription, setPubDescription] = useState('');
  const [pubPrice, setPubPrice] = useState<number>(25.00);
  const [pubCategory, setPubCategory] = useState('Operations');
  const [pubCreatorHandle, setPubCreatorHandle] = useState('@operator_prime');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // 1. DYNAMIC LIST OF SHAREABLE AGENTS FOR SALE
  const [agents, setAgents] = useState<AgentListing[]>([
    {
      id: 'agent-1',
      name: 'Clara Support Pro',
      role: 'Support',
      author: '@clara_operator',
      description: 'An autonomous customer triage and support dispatch system designed to answer billing inquiries, process refunds safely using internal refund sheets, and route complex enterprise violations.',
      price: 120.00,
      avatarColor: 'bg-indigo-950 border border-indigo-700 text-white',
      connectedApps: ['Stripe', 'Zendesk', 'HubSpot', 'Slack'],
      capabilities: ['Fast customer replies', 'Automatic ticket sorting', 'Refund validation auditing'],
      saves: 342,
      featured: true
    },
    {
      id: 'agent-2',
      name: 'Valkyrie Tax Forensics Agent',
      role: 'Finance',
      author: '@valk_operator',
      description: 'A bulletproof corporate finance flow that parses Stripe payouts weekly, extracts physical item invoices, reconciles tax values, and updates structured company CSV balances.',
      price: 145.00,
      avatarColor: 'bg-emerald-950 border border-emerald-700 text-white',
      connectedApps: ['Stripe', 'QuickBooks', 'Google Sheets'],
      capabilities: ['Stripe ledger reconciliation', 'Automated margin calculation', 'Tax audit logs preservation'],
      saves: 289,
      featured: true
    },
    {
      id: 'agent-3',
      name: 'Atlas Cargo Dispatch specialist',
      role: 'Operations',
      author: '@atlas_logistics',
      description: 'Monitors international suppliers stock thresholds, validates shipping compliance documents, predicts warehouse cargo transit delays, and generates custom replenishment orders automatically.',
      price: 160.00,
      avatarColor: 'bg-amber-950 border border-amber-700 text-white',
      connectedApps: ['Shopify', 'Airtable', 'Google Drive'],
      capabilities: ['Replenishment scheduling', 'Supplier transit tracking', 'Stock depletion warning alerts'],
      saves: 194,
      featured: true
    },
    {
      id: 'agent-4',
      name: 'Synthesizer copy loop Special Agent',
      role: 'Marketing',
      author: '@synth_expert',
      description: 'A campaign creation system that scans community news folders, drafts brand-compliant newsletters based on reference guidelines, and schedules segmented broadcasts directly.',
      price: 90.00,
      avatarColor: 'bg-purple-950 border border-purple-700 text-white',
      connectedApps: ['Mailchimp', 'Substack', 'Google Docs', 'Slack'],
      capabilities: ['High-conversion copywriting', 'Scraping reference content guidelines', 'Segmented news layouts preparation'],
      saves: 415,
      featured: false
    }
  ]);

  // 2. DYNAMIC LIST OF SHAREABLE SKILLS FOR SALE
  const [skills, setSkills] = useState<SkillListing[]>([
    {
      id: 'skill-1',
      title: 'Zendesk Ticket Auto-Router',
      description: 'Advanced routing algorithms which categorize client queries by urgency rating, sentiment analysis, and contractual SLA terms.',
      author: '@clara_operator',
      price: 19.00,
      targetRole: 'Support Specialist Role',
      saves: 521
    },
    {
      id: 'skill-2',
      title: 'QuickBooks Ledger Matcher Plugin',
      description: 'Deep ledger scanner that detects discrepancy patterns, matches foreign currency transaction rates, and triggers audit flags.',
      author: '@valk_operator',
      price: 25.00,
      targetRole: 'Finance Specialist Role',
      saves: 342
    },
    {
      id: 'skill-3',
      title: 'Competitor Pricing Scraper Pipeline',
      description: 'Real-time scraper routing scripts that monitor Shopify storefront variables and alert on pricing drops of predefined items.',
      author: '@ecom_architect',
      price: 34.00,
      targetRole: 'Marketing and Research Role',
      saves: 498
    },
    {
      id: 'skill-4',
      title: 'Global Carrier Delay Predictor Model',
      description: 'Machine learning routine that processes historical transit metrics to adjust delivery ETA margins across active ocean lanes.',
      author: '@atlas_logistics',
      price: 45.00,
      targetRole: 'Operations Sourcing Role',
      saves: 184
    }
  ]);

  // 3. DYNAMIC LIST OF CURATED DATASETS FOR SALE
  const [datasets, setDatasets] = useState<DatasetListing[]>([
    {
      id: 'ds-1',
      name: 'parts_supplier_master_inventory_2026.xlsx',
      size: '1.8 MB',
      type: 'xlsx',
      description: 'Structured master index of trusted parts suppliers, transit lead times, freight carriers, and pricing structures.',
      author: '@atlas_logistics',
      price: 55.00,
      saves: 429
    },
    {
      id: 'ds-2',
      name: 'refund_processing_framework_guide.pdf',
      size: '2.4 MB',
      type: 'pdf',
      description: 'Complete operational directives for handling micro-refund limits, escalation procedures, and customer trust tiers.',
      author: '@clara_operator',
      price: 20.00,
      saves: 502
    },
    {
      id: 'ds-3',
      name: 'newsletter_lifecycle_swipes_2026.csv',
      size: '4.1 MB',
      type: 'csv',
      description: 'Strategic branding guidelines, copywriting tones, formatting specs, and template parameters for AI newsletter engines.',
      author: '@synth_expert',
      price: 35.00,
      saves: 310
    },
    {
      id: 'ds-4',
      name: 'global_delay_scenarios_v2.json',
      size: '640 KB',
      type: 'json',
      description: 'Anonymized dataset documenting historical e-commerce stock delays, cargo transit buffers, and backorder scenarios.',
      author: '@ecom_architect',
      price: 29.00,
      saves: 184
    }
  ]);

  // 4. DATA RENTAL SECTION - Live feeds that get constantly updated by the seller
  const [rentals, setRentals] = useState<RentalListing[]>([
    {
      id: 'rent-1',
      title: 'Live Global Ocean Cargo Delay Tracker',
      description: 'Comprehensive tracking feed monitoring delayed arrivals across 8 critical shipping lanes. The seller pushes constant real-time telemetry updates as weather systems adjust.',
      author: '@atlas_logistics',
      rentPrice: 29.00,
      category: 'Suppliers',
      saves: 620,
      liveUpdates: [
        { timeAgo: 'Just now', message: 'Vessel EVER-GIVEN telemetry updated. Delayed 4h at Suez channel.', bytesText: '450B payload' },
        { timeAgo: '4 min ago', message: 'Shanghai port status adjusted. Heavy fog cleared, throughput back to 98%.', bytesText: '1.1KB payload' },
        { timeAgo: '15 min ago', message: 'Vessel MAERSK-VALLEY adjusted ETA for Rotterdam arrival.', bytesText: '320B payload' }
      ]
    },
    {
      id: 'rent-2',
      title: 'Stripe Refund Rate Real-Time Index',
      description: 'Real-time benchmark index highlighting refund rates across 15 SaaS categories, giving automated agents pricing indicators. Seller adds daily transaction updates.',
      author: '@valk_operator',
      rentPrice: 19.00,
      category: 'Finance',
      saves: 395,
      liveUpdates: [
        { timeAgo: 'Just now', message: 'AI Productivity Sector refund rate ticked up to 2.45%.', bytesText: '230B payload' },
        { timeAgo: '12 min ago', message: 'Subscription billing disputes decreased by 0.12% across Stripe.', bytesText: '110B payload' }
      ]
    },
    {
      id: 'rent-3',
      title: 'Trending Social Copysheet Stream',
      description: 'Constant flow of viral social copy hooks generated from real high-conversion ads. The seller pushes updates twice hourly.',
      author: '@synth_expert',
      rentPrice: 15.00,
      category: 'Marketing',
      saves: 840,
      liveUpdates: [
        { timeAgo: 'Just now', message: 'Social hook #415 verified: "98% of SaaS companies miss this compliance audit..."', bytesText: '1.4KB payload' },
        { timeAgo: '20 min ago', message: 'New visual style guidelines pushed for Twitter/LinkedIn loops.', bytesText: '2.1KB payload' }
      ]
    }
  ]);

  // Creators index list
  const creators = [
    { name: '@clara_operator', verified: true, role: 'Operations Architect', saves: 844, itemsCount: 4, avatar: 'bg-indigo-50 text-indigo-950', category: 'Customer Support' },
    { name: '@valk_operator', verified: true, role: 'Financial Engineer', saves: 626, itemsCount: 4, avatar: 'bg-emerald-50 text-emerald-950', category: 'Finance' },
    { name: '@atlas_logistics', verified: true, role: 'Sourcing Director', saves: 1421, itemsCount: 5, avatar: 'bg-amber-50 text-amber-950', category: 'Suppliers' },
    { name: '@synth_expert', verified: true, role: 'Audience Strategy Advisor', saves: 1565, itemsCount: 3, avatar: 'bg-purple-50 text-purple-950', category: 'Marketing' },
    { name: '@ecom_architect', verified: true, role: 'SaaS Logistics Lead', saves: 682, itemsCount: 3, avatar: 'bg-rose-50 text-rose-950', category: 'Ecommerce' }
  ];

  // Simulated constant updates for rent feeds to verify seller is constantly updating them!
  useEffect(() => {
    // Keep appending updates randomly to rented streams to make it feel super alive and dynamic
    const timer = setInterval(() => {
      setRentals(prevRentals => 
        prevRentals.map(rent => {
          // If rented, let's simulate seller pushing updates constantly!
          if (rentedFeedIds.includes(rent.id)) {
            const randomUpdates = [
              "Seller @atlas_logistics pushed fresh metadata payloads to global sync node.",
              "Seller @valk_operator reconciled a new batch of 45 Stripe telemetry indexes.",
              "Seller alert: Live variables audited. Checked configuration schemas safely.",
              "New benchmark log arrived: Transmitted from source sandbox safely.",
              "Stream synced: Regional databases successfully compiled parameters."
            ];
            const chosenMsg = randomUpdates[Math.floor(Math.random() * randomUpdates.length)];
            const timeVal = "Just now (Seller Live Push)";
            const newTick: RentalFeedUpdate = {
              timeAgo: timeVal,
              message: chosenMsg,
              bytesText: `${Math.floor(Math.random() * 800) + 100}B payload`
            };
            return {
              ...rent,
              liveUpdates: [newTick, ...rent.liveUpdates.slice(0, 4)]
            };
          }
          return rent;
        })
      );
    }, 9000);

    return () => clearInterval(timer);
  }, [rentedFeedIds]);

  // 2. CORE TRANS-ACTIONS

  // Simulation: Add funds
  const handleAddFunds = () => {
    setWalletBalance(prev => prev + 100);
    setSuccessBanner("Successfully credited +$100.00 to your secure local wallet!");
    setTimeout(() => setSuccessBanner(''), 3000);
  };

  // 2.1 BUYING SPECIALIZED AGENTS
  const handleBuyAgent = (agent: AgentListing) => {
    if (purchasedAgentIds.includes(agent.id)) {
      setSuccessBanner(`"${agent.name}" is already purchased and active in your workspace.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    if (walletBalance < agent.price) {
      setSuccessBanner(`Insufficient funds to purchase "${agent.name}". Please Add Funds!`);
      setTimeout(() => setSuccessBanner(''), 3500);
      return;
    }

    // Deduct
    setWalletBalance(prev => prev - agent.price);
    setPurchasedAgentIds(prev => [...prev, agent.id]);

    // Install Agent (Add to system-wide active employee list)
    const newWorker: AIWorker = {
      id: `worker-bought-${agent.id}-${Date.now()}`,
      name: agent.name,
      role: agent.role,
      status: 'idle',
      avatarColor: agent.avatarColor,
      connectedApps: agent.connectedApps,
      tasksCount: 0
    };

    onSetWorkersList(prev => [...prev, newWorker]);
    onAddActivity(`SaaS Transaction: Purchased and deployed AI Agent "${agent.name}" by ${agent.author} for $${agent.price.toFixed(2)}.`, agent.name);

    setSuccessBanner(`Core Activated: Purchased "${agent.name}"! Node added directly to your AI Workers list.`);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // 2.2 BUYING CAPABILITIES & SKILLS
  const handleBuySkill = (skill: SkillListing) => {
    if (purchasedSkillIds.includes(skill.id)) {
      setSuccessBanner(`"${skill.title}" is already installed.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    if (walletBalance < skill.price) {
      setSuccessBanner(`Insufficient funds to purchase "${skill.title}". Please Add Funds.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    // Deduct
    setWalletBalance(prev => prev - skill.price);
    setPurchasedSkillIds(prev => [...prev, skill.id]);

    onAddActivity(`Workspace upgraded: Purchased modular routine "${skill.title}" (${skill.targetRole}) for $${skill.price.toFixed(2)}.`, 'System');
    setSuccessBanner(`Capability Loaded: Purchased and installed "${skill.title}" directly to agent tools!`);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // 2.3 BUYING CURATED DATASETS
  const handleBuyDataset = (ds: DatasetListing) => {
    if (purchasedDatasetIds.includes(ds.id)) {
      setSuccessBanner(`"${ds.name}" was already bought.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    if (walletBalance < ds.price) {
      setSuccessBanner(`Insufficient balance to import "${ds.name}". Please Add Funds.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    // Deduct
    setWalletBalance(prev => prev - ds.price);
    setPurchasedDatasetIds(prev => [...prev, ds.id]);

    // Construct raw file inside workspace Files vault
    const newFile: MockFile = {
      name: ds.name,
      size: ds.size,
      type: ds.type.toUpperCase(),
      uploadedAt: 'Just now (Purchased from Hub)'
    };

    onSetCompanyFiles(prev => [newFile, ...prev]);
    onAddActivity(`Purchased high-fidelity dataset ${ds.name} from ${ds.author} for $${ds.price.toFixed(2)}.`, 'System');

    setSuccessBanner(`File unlocked: Successfully imported "${ds.name}" into your secure Files vault.`);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // 2.4 RENTING REAL-TIME DATA FREQUENCIES
  const handleRentFeed = (rent: RentalListing) => {
    if (rentedFeedIds.includes(rent.id)) {
      setSuccessBanner(`"${rent.title}" is currently active under monthly contract.`);
      setTimeout(() => setSuccessBanner(''), 3000);
      return;
    }

    if (walletBalance < rent.rentPrice) {
      setSuccessBanner(`Insufficient funds to rent "${rent.title}" ($${rent.rentPrice.toFixed(2)}/mo).`);
      setTimeout(() => setSuccessBanner(''), 3050);
      return;
    }

    // Deduct
    setWalletBalance(prev => prev - rent.rentPrice);
    setRentedFeedIds(prev => [...prev, rent.id]);

    onAddActivity(`Data stream leased: Activated real-time subscription for "${rent.title}" at $${rent.rentPrice.toFixed(2)}/mo.`, 'System');
    setSuccessBanner(`Stream linked: Real-time channel established! Seller is pushed constant updates.`);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // 2.5 MANUALLY TRIGGER THE SELLER UPDATING THE INCOMING FEED INSTANTLY
  const handleForceUpdateBySeller = (feedId: string, feedAuthor: string) => {
    // Generate custom live entries
    const updateLogs = [
      "Seller verified data pipelines. Uploaded 12 fresh tracking arrays.",
      "Re-indexed live feed parameter schema instantly to adjust latency.",
      "Hot-patch deployed by author: verified 100% data integrity.",
      "Live data audited: Reconciled global variable delays successfully.",
      "Pushed payload block: Sync speed adjusted to 15ms safely."
    ];
    const chosenText = updateLogs[Math.floor(Math.random() * updateLogs.length)];
    const randomPayload = `${Math.floor(Math.random() * 950) + 50}B payload`;

    setRentals(prev => 
      prev.map(item => {
        if (item.id === feedId) {
          const freshTick: RentalFeedUpdate = {
            timeAgo: 'Just now (Seller updated)',
            message: `[Seller ${feedAuthor} PUSH] ${chosenText}`,
            bytesText: randomPayload
          };
          return {
            ...item,
            liveUpdates: [freshTick, ...item.liveUpdates.slice(0, 4)]
          };
        }
        return item;
      })
    );

    setSuccessBanner(`Seller ${feedAuthor} compiled and pushed a live data update successfully!`);
    setTimeout(() => setSuccessBanner(''), 3000);
  };

  // 3. SELLER PUBLISH FLOW
  const handlePublishListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubDescription.trim()) return;

    const formattedPrice = Number(pubPrice) || 0;
    const itemUuid = `user-published-${Date.now()}`;

    if (pubType === 'agent') {
      const newAgent: AgentListing = {
        id: itemUuid,
        name: pubTitle,
        role: 'Operations',
        author: pubCreatorHandle || '@private_client',
        description: pubDescription,
        price: formattedPrice,
        avatarColor: 'bg-stone-950 border text-white',
        connectedApps: ['Slack', 'EmailGateway'],
        capabilities: ['Custom routines execution', 'API query trigger', 'Operational checks'],
        saves: 0,
        featured: true
      };
      setAgents(prev => [newAgent, ...prev]);
    } else if (pubType === 'skill') {
      const newSkill: SkillListing = {
        id: itemUuid,
        title: pubTitle,
        description: pubDescription,
        author: pubCreatorHandle || '@private_client',
        price: formattedPrice,
        targetRole: 'General Automated Team',
        saves: 0
      };
      setSkills(prev => [newSkill, ...prev]);
    } else if (pubType === 'dataset') {
      const newDs: DatasetListing = {
        id: itemUuid,
        name: pubTitle.toLowerCase().replace(/\s+/g, '_') + '.csv',
        size: '1.2 MB',
        type: 'csv',
        description: pubDescription,
        author: pubCreatorHandle || '@private_client',
        price: formattedPrice,
        saves: 0
      };
      setDatasets(prev => [newDs, ...prev]);
    } else if (pubType === 'rental') {
      const newRent: RentalListing = {
        id: itemUuid,
        title: pubTitle,
        description: pubDescription,
        author: pubCreatorHandle || '@private_client',
        rentPrice: formattedPrice,
        category: pubCategory,
        saves: 0,
        liveUpdates: [
          { timeAgo: 'Just now', message: 'Channel initialized by creator. Streaming is active.', bytesText: '102B payload' }
        ]
      };
      setRentals(prev => [newRent, ...prev]);
    }

    onAddActivity(`You listed an asset for sale: "${pubTitle}" with pricing set at $${formattedPrice.toFixed(2)}.`, 'System');

    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setShowPublishModal(false);
      setPubTitle('');
      setPubDescription('');
      setPubPrice(25.0);
    }, 2000);
  };

  // 4. SEARCH / FILTER FILTERS
  const filteredAgents = agents.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSkills = skills.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredDatasets = datasets.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredRentals = rentals.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-24 py-6 font-sans relative" id="marketplace-page-module-container">
      
      {/* SUCCESS POP BANNER */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-stone-950 text-white rounded-xl border border-stone-850 text-xs font-semibold text-center fixed top-24 right-12 z-50 shadow-lg flex items-center gap-2 max-w-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#9D8055] shrink-0 animating-pulse" />
            <span>{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — HERO SECTION */}
      <section className="bg-white border border-stone-150 rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8" id="marketplace-hero-block">
        <div className="space-y-4 text-left max-w-3xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9D8055] font-bold block">
            The Octo Hub & Commercial Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Acquire specialized intelligence nodes & datasets.
          </h1>
          <h2 className="text-xs text-stone-500 font-light leading-relaxed max-w-2xl pt-2">
            Explore commercial listings built by operations engineers. Securely purchase professional AI employees, deploy target machine-learning capabilities, buy structured offline data catalogs, or establish live monthly subscriptions to stream dynamic, seller-populated real-time telemetry.
          </h2>

          {/* Trust points */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10.5px] font-mono text-stone-400 select-none pt-2">
            <span className="flex items-center gap-1.5 font-medium text-stone-900">
              <Shield className="w-3.5 h-3.5" /> Immutable ledger paths
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Zero-exposure sandbox keying
            </span>
          </div>
        </div>

        {/* List Asset Control */}
        <div className="shrink-0 animate-fade-in">
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-3 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>List Asset ($)</span>
          </button>
        </div>
      </section>

      {/* FILTER SEARCH AND CATEGORY BAR */}
      <section className="space-y-8" id="search-filter-controls">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Intelligent Navigation</span>
            <h3 className="text-sm font-bold text-stone-900 font-mono">Curated Exploration</h3>
          </div>
          {searchQuery && (
            <span className="text-xs font-mono text-stone-400">
              Filtering by: "{searchQuery}"
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" id="marketplace-filter-options">
          {/* Quick sub tabs navigation */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'agents', label: 'AI Agents' },
              { id: 'skills', label: 'Agent Skills' },
              { id: 'datasets', label: 'Datasets ($)' },
              { id: 'rentals', label: 'Data Rentals (Live)' },
              { id: 'creators', label: 'Top Builders' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabSub(tab.id as any);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  activeTabSub === tab.id
                    ? 'bg-stone-950 text-white font-semibold'
                    : 'bg-[#FCFCFA] text-stone-605 border border-stone-150 hover:border-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search query box */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search priced agents, skills, logs, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-stone-200 pl-10 pr-9 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 placeholder-stone-400 text-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-950"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: AI AGENTS DIRECTORY FOR SALE ================= */}
      {(activeTabSub === 'all' || activeTabSub === 'agents') && (
        <section className="space-y-8" id="agents-sales-category">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono bg-stone-950 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">Specialized Employees</span>
              <h3 className="text-xl font-bold text-stone-950 font-sans">Specialist AI Agents Marketplace</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">Premium Deployment Nodes</span>
          </div>

          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Acquire full-time digital employees configured for direct sandbox execution. Purchasing links the employee directly with your active team roster instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {filteredAgents.length === 0 ? (
              <div className="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 col-span-2">
                No Agents matches your search query.
              </div>
            ) : (
              filteredAgents.map(agent => {
                const isBought = purchasedAgentIds.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 hover:border-stone-400 transition-all flex flex-col justify-between space-y-6 text-left relative"
                  >
                    {/* Upper Line */}
                    <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${agent.avatarColor} flex items-center justify-center font-mono text-sm font-bold shadow-3xs`}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#111]">{agent.name}</span>
                            <span className="px-2 py-0.5 text-[8.5px] font-mono tracking-widest bg-stone-50 border rounded uppercase text-stone-500">{agent.role}</span>
                          </div>
                          <p className="text-[10px] font-mono text-stone-400">Engineered by <span className="text-[#9D8055] font-semibold">{agent.author}</span></p>
                        </div>
                      </div>

                      {/* Explicit Pricing Badge */}
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">One-time price</span>
                        <span className="text-lg font-mono font-bold text-[#9D8055] block">
                          ${agent.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Middle description */}
                    <p className="text-xs text-stone-500 leading-relaxed font-light">
                      {agent.description}
                    </p>

                    {/* App compatibility list */}
                    <div className="space-y-2">
                      <span className="text-[9.5px] uppercase font-mono tracking-wider text-stone-400 font-bold block">Connected Applications & Endpoints</span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.connectedApps.map((app, appIdx) => (
                          <span key={appIdx} className="px-2 py-0.5 bg-stone-50 border border-stone-150 rounded text-[9.5px] font-mono text-stone-605">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Core metrics & purchase actions */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                      <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Ordered <strong>{agent.saves}</strong> times
                      </span>

                      <button
                        onClick={() => handleBuyAgent(agent)}
                        disabled={isBought}
                        className={`text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                          isBought 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-150 cursor-not-allowed'
                            : 'bg-stone-950 hover:bg-stone-850 text-white shadow-xs'
                        }`}
                      >
                        {isBought ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active in Workspace</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buy Agent & Deploy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ================= SECTION 3: AGENT SKILLS FOR SALE ================= */}
      {(activeTabSub === 'all' || activeTabSub === 'skills') && (
        <section className="space-y-8" id="skills-sales-category">
          <div className="border-b border-stone-105 pb-3 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono bg-[#9D8055] text-white px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">Routine Intelligence</span>
              <h3 className="text-xl font-bold text-stone-950 font-sans">Capabilities & Skills Market</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">Enhancement Modules</span>
          </div>

          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Purchase reusable capability skills and custom triggers to upgrade your existing workers layout. These templates inject advanced processing algorithms directly onto your active nodes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {filteredSkills.length === 0 ? (
              <div className="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 col-span-4">
                No custom Skill structures match criteria.
              </div>
            ) : (
              filteredSkills.map(skill => {
                const isBought = purchasedSkillIds.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    className="bg-[#FCFCFA] border border-stone-200/80 p-6 rounded-2xl hover:border-stone-400 transition-all text-left flex flex-col justify-between h-[280px]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-[9.5px] font-mono font-bold text-stone-400 uppercase tracking-widest">{skill.targetRole}</span>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#9D8055] block">${skill.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-stone-950 font-sans block leading-tight">{skill.title}</span>
                      <p className="text-[11px] text-stone-500 leading-normal font-light line-clamp-4">{skill.description}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-stone-400">By {skill.author}</span>
                      <button
                        onClick={() => handleBuySkill(skill)}
                        disabled={isBought}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBought
                            ? 'bg-emerald-50 text-emerald-800 cursor-not-allowed'
                            : 'bg-stone-950 hover:bg-stone-850 text-white'
                        }`}
                      >
                        {isBought ? 'Installed' : 'Buy Skill'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ================= SECTION 4: DATASET SELLING & LISTING ================= */}
      {(activeTabSub === 'all' || activeTabSub === 'datasets') && (
        <section className="space-y-8" id="datasets-sales-category">
          <div className="border-b border-stone-105 pb-3 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono bg-stone-900 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">Encrypted Directories</span>
              <h3 className="text-xl font-bold text-stone-950 font-sans">Curated Datasets for Sale</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">Reference Knowledge Files</span>
          </div>

          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            AI employee nodes need accurate static values to resolve complex operations. Buy verified directories containing supplier contacts, refund guides, and swipe archives to populate your vault files repository.
          </p>

          <div className="border border-stone-200 bg-white rounded-3xl overflow-hidden shadow-3xs max-w-5xl" id="datasets-table">
            <div className="p-4 bg-stone-50 border-b border-stone-205 text-[10px] font-semibold text-stone-400 font-mono grid grid-cols-12 gap-4 hidden sm:grid">
              <div className="col-span-5">CLASSIFED DATASET FILE / AUTHOR</div>
              <div className="col-span-3">DESCRIPTION</div>
              <div className="col-span-1 text-center">SIZE</div>
              <div className="col-span-1 text-center font-bold">PRICE</div>
              <div className="col-span-2 text-right">ACTION IMPORT</div>
            </div>

            <div className="divide-y divide-stone-100">
              {filteredDatasets.length === 0 ? (
                <div className="p-12 text-center text-xs text-stone-400">
                  No databases match catalog query.
                </div>
              ) : (
                filteredDatasets.map(ds => {
                  const isBought = purchasedDatasetIds.includes(ds.id);
                  return (
                    <div
                      key={ds.id}
                      className="p-6 hover:bg-stone-50/20 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs text-stone-850 text-left"
                    >
                      {/* Name & format info */}
                      <div className="col-span-12 sm:col-span-5 flex items-start gap-3">
                        <div className="w-10 h-10 border border-stone-150 bg-stone-50 rounded-xl flex items-center justify-center text-stone-950 shrink-0 shadow-3xs">
                          <FileSpreadsheet className="w-4 h-4 text-[#9D8055]" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-stone-950 truncate max-w-xs">{ds.name}</p>
                          <p className="text-[9.5px] text-stone-400 font-mono">Compiled by <strong className="text-stone-700">{ds.author}</strong> • {ds.saves} saves</p>
                        </div>
                      </div>

                      {/* Brief description */}
                      <div className="col-span-12 sm:col-span-3 text-stone-500 text-[11px] leading-relaxed font-light">
                        {ds.description}
                      </div>

                      {/* Size */}
                      <div className="col-span-12 sm:col-span-1 sm:text-center text-stone-400 font-mono text-[11px]">
                        {ds.size}
                      </div>

                      {/* Price tag */}
                      <div className="col-span-12 sm:col-span-1 sm:text-center text-[#9D8055] font-mono font-bold text-xs select-none">
                        ${ds.price.toFixed(2)}
                      </div>

                      {/* Buy Action */}
                      <div className="col-span-12 sm:col-span-2 text-right">
                        <button
                          onClick={() => handleBuyDataset(ds)}
                          disabled={isBought}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center border ${
                            isBought
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100 cursor-not-allowed'
                              : 'bg-stone-950 hover:bg-stone-850 text-white border-stone-950'
                          }`}
                        >
                          {isBought ? 'Imported' : 'Buy Dataset'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 5: DATA RENTAL MARKETPLACE (REAL-TIME CONSTANT UPDATES) ================= */}
      {(activeTabSub === 'all' || activeTabSub === 'rentals') && (
        <section className="space-y-8 animate-fade-in" id="rentals-sales-category">
          <div className="border-b border-stone-105 pb-3 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono bg-amber-950 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">Subscribed Telemetry channels</span>
              <h3 className="text-xl font-bold text-stone-950 font-sans">Real-Time Data Streams & Rentals</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">Dynamic Live Updates</span>
          </div>

          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Rent ongoing dynamic records maintained live. The original seller constantly pushes structured parameter fixes as variables shift. Renting mounts a live stream component directly to monitor variables.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-2">
            
            {/* List block */}
            <div className="xl:col-span-7 space-y-6">
              {filteredRentals.length === 0 ? (
                <div className="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                  No rentable streams fit parameters.
                </div>
              ) : (
                filteredRentals.map(feed => {
                  const isRented = rentedFeedIds.includes(feed.id);
                  return (
                    <div
                      key={feed.id}
                      className="bg-white border border-stone-200 p-6 rounded-3xl flex flex-col justify-between space-y-4 text-left hover:border-stone-400 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 tracking-wider">ACTIVE FEED RENTAL</span>
                          <h4 className="text-base font-bold text-stone-950 tracking-tight">{feed.title}</h4>
                          <p className="text-[10px] text-stone-400 font-mono">Pushed constantly by <strong className="text-stone-700">{feed.author}</strong></p>
                        </div>

                        <div className="text-right">
                          <span className="text-[9.5px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Lease Fee</span>
                          <span className="text-lg font-mono font-extrabold text-[#9D8055] block">
                            ${feed.rentPrice.toFixed(2)}<span className="text-[10px] font-light text-stone-400">/mo</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed font-light">{feed.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Stream signal status */}
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isRented ? 'bg-emerald-500 animate-ping' : 'bg-stone-300'}`} />
                          <span className="text-[10px] font-mono font-semibold text-stone-550 flex items-center gap-1">
                            {isRented ? (
                              <>
                                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live Stream Connecting
                              </>
                            ) : (
                              'Standby / Offline'
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isRented && (
                            <button
                              onClick={() => handleForceUpdateBySeller(feed.id, feed.author)}
                              className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 text-stone-880 text-[10px] font-semibold rounded-lg cursor-pointer transition-colors"
                              title="Instruct seller node to compile and stream new metrics instantly"
                            >
                              Force Seller Push update
                            </button>
                          )}

                          <button
                            onClick={() => handleRentFeed(feed)}
                            disabled={isRented}
                            className={`px-4 py-2 font-bold text-xs rounded-lg cursor-pointer border transition-all ${
                              isRented
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-150 cursor-not-allowed'
                                : 'bg-stone-950 hover:bg-stone-850 text-white border-stone-950'
                            }`}
                          >
                            {isRented ? '✓ Feed Active' : 'Lease Feed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Interactive Live Monitor Dashboard Column for Rented channels (to constantly show updates) */}
            <div className="xl:col-span-5 bg-stone-950 text-white rounded-3xl p-6 space-y-4 border border-stone-850 shadow-lg text-left">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-stone-400 tracking-widest font-bold uppercase">Dynamic Socket Matrix</span>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#9D8055]" />
                    <span>Rented Stream Monitor</span>
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-stone-400 uppercase">Authenticated</span>
                </div>
              </div>

              {rentedFeedIds.length === 0 ? (
                <div className="p-10 text-center space-y-4">
                  <Clock className="w-8 h-8 text-stone-600 mx-auto animate-pulse" />
                  <p className="text-xs text-stone-400 leading-relaxed font-light font-sans">
                    No active Rent-Data feeds leased. Landlord-tenant nodes will stream compiled telemetry log ticks once you activate a dynamic channel.
                  </p>
                  <p className="text-[10px] text-stone-500 italic font-mono">
                    Rentals are constantly updated by original authors in the background.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active rented streams selection */}
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#9D8055] font-bold block">Leased Channels Listening:</span>
                    <div className="flex flex-wrap gap-1">
                      {rentedFeedIds.map(fid => {
                        const targetRent = rentals.find(r => r.id === fid);
                        return (
                          <span key={fid} className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded font-mono text-[9px] text-stone-300">
                            ✓ {targetRent?.title.split(' ')[2] || 'Global feed'} Active
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incoming Logs Flow Terminal (Where they can see updates constamment!) */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase text-stone-405 block">Real-Time Data Feed Streams (Updated hourly or push manually):</span>
                    
                    <div className="bg-[#0e0e0f] rounded-xl p-4 border border-stone-850 font-mono text-[10px] space-y-3 h-[250px] overflow-y-auto scrollbar-thin">
                      
                      {rentals
                        .filter(f => rentedFeedIds.includes(f.id))
                        .map(activeFeed => (
                          <div key={activeFeed.id} className="space-y-2 border-b border-stone-900 pb-2">
                            <span className="text-stone-402 uppercase font-bold text-[8.5px] tracking-wider text-[#9D8055]">
                              {activeFeed.title.toUpperCase()} • PUSHED LOGS:
                            </span>

                            {activeFeed.liveUpdates.map((tick, tIdx) => (
                              <div key={tIdx} className="space-y-0.5 text-left border-l border-stone-800 pl-2 ml-1">
                                <div className="flex items-center justify-between text-[8px] text-stone-400">
                                  <span>{tick.timeAgo}</span>
                                  <span>{tick.bytesText}</span>
                                </div>
                                <p className="text-white text-[10.5px] leading-relaxed break-words font-sans">{tick.message}</p>
                              </div>
                            ))}
                          </div>
                      ))}

                    </div>
                  </div>

                  {/* Feedback explanation of how it constantly updates */}
                  <div className="p-3 bg-stone-900 rounded-lg text-[10px] text-stone-400 leading-normal text-left font-light">
                    <strong>Autonomous Link:</strong> The provider nodes are continuously listening. New records generate automatically or whenever creators run analytics triggers on their sandboxes.
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>
      )}

      {/* ================= SECTION 6: CATEGORY TAXONOMY INDEX ================= */}
      {selectedCategory === 'All' && activeTabSub === 'all' && (
        <section className="space-y-10" id="marketplace-categories-section">
          <div className="border-b border-stone-100 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Categorical Taxonomy</span>
            <h3 className="text-sm font-bold text-stone-900 font-mono">Browse Specialties</h3>
          </div>

          <p className="text-xs text-stone-500 max-w-xl leading-relaxed font-sans font-light">
            Locate compiled frameworks instantly. Filter directories aligned to specific departments within your business block.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {[
              { id: 'Customer Support', desc: 'Auto dispatcher setups, refund guidelines, and feedback validators.', icon: Users, bg: 'hover:border-indigo-400' },
              { id: 'Finance', desc: 'Stripe balance checkers, monthly tax ledger builders, and cash trackers.', icon: FileSpreadsheet, bg: 'hover:border-emerald-400' },
              { id: 'Marketing', desc: 'High-conversion copy tools, news scrapers, and brand voice guidelines.', icon: Sparkles, bg: 'hover:border-purple-400' },
              { id: 'Operations', desc: 'Task delegation logic nodes, security compliance logs, and SOP monitors.', icon: Settings, bg: 'hover:border-stone-800' }
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSearchQuery(cat.id);
                    const target = document.getElementById('search-filter-controls');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`bg-white border border-stone-200/80 p-6 rounded-2xl text-left space-y-4 cursor-pointer transition-all ${cat.bg}`}
                >
                  <div className="w-10 h-10 border border-stone-100 bg-stone-50 rounded-xl flex items-center justify-center text-stone-950 shadow-3xs">
                    <Icon className="w-5 h-5 text-stone-900" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-950 font-sans block">{cat.id}</span>
                    <p className="text-[11px] text-stone-450 leading-relaxed font-light">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= SECTION 7: EXPERT CREATOR SHOWCASE ================= */}
      {activeTabSub !== 'creators' && (
        <section className="space-y-10" id="creators-showcase-section">
          <div className="border-b border-stone-100 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">The Operators</span>
            <h3 className="text-sm font-bold text-stone-900 font-mono">Expert Creator Showcase</h3>
          </div>

          <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
            Discover verified operators on Octo. No social distraction—only highly rated workflows, real assets, and operational excellence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-4">
            {creators.map((c, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl ${c.avatar} flex items-center justify-center font-mono text-xs font-bold shrink-0`}>
                    {c.name.charAt(1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-950 block truncate">{c.name}</span>
                    <span className="text-[9.5px] text-[#9D8055] font-mono">{c.role}</span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 font-mono flex items-center justify-between pt-2 border-t border-stone-50">
                  <span>{c.itemsCount} templates</span>
                  <span>{c.saves} global saves</span>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery(c.name);
                    const target = document.getElementById('search-filter-controls');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-center py-2 bg-stone-50 hover:bg-stone-100 border border-stone-150 text-stone-900 text-[10.5px] rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  View Listings
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= SECTION 8: CUSTOM AGENT & DATA PUBLISHING ENGINE ================= */}
      <section className="space-y-8 animate-fade-in" id="publishing-intake-banner">
        <div className="border-b border-stone-200 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Autonomous Integrity</span>
          <h3 className="text-sm font-bold text-stone-900 font-mono">Publish Your Work with Custom Pricing</h3>
        </div>

        <div className="bg-[#FCFCFB] border border-stone-200 rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl">
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-[9.5px] font-mono bg-stone-950 text-white px-3 py-1 rounded-sm uppercase tracking-widest font-bold">Manual Listing Controls Only</span>
            <h4 className="text-3xl font-bold text-stone-950 font-sans tracking-tight">Do you have an automated asset worth monetizing?</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-sans max-w-xl font-light">
              Submit custom AI employees for purchase, list specialized routine configurations, compile structured guidelines datasets, or organize dynamic rentable telemetry streams. Choose your custom pricing model. Listings start 100% private to Octo Workspace boundaries.
            </p>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <button
              onClick={() => {
                setPubType('agent');
                setShowPublishModal(true);
              }}
              className="bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs px-8 py-4 rounded-xl transition-all cursor-pointer shadow-md w-full lg:w-auto text-center"
            >
              List Digital Asset
            </button>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE PUBLISHING MODAL ================= */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-stone-900/10 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 lg:p-8 rounded-3xl border border-stone-200 max-w-lg w-full space-y-6 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#9D8055] font-bold uppercase tracking-wider block">Local Node Registry Hub</span>
                <span className="text-base font-bold text-stone-950">Publish Asset Listing with Pricing</span>
              </div>
              <button
                onClick={() => { setShowPublishModal(false); setPublishedSuccess(false); }}
                className="text-stone-400 hover:text-stone-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishedSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-stone-950 text-white rounded-full flex items-center justify-center mx-auto shadow-sm pb-0.5">
                  ✓
                </div>
                <h5 className="text-sm font-bold text-stone-950">Asset Registered Successfully!</h5>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  Your custom business module is now indexed and immediately available for rent or purchase inside the local community sandbox. Real credential bindings are safeguarded offline.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublishListingSubmit} className="space-y-4">
                
                {/* Choose Asset Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-450 uppercase font-semibold">Choose Asset Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'agent', label: 'AI Agent' },
                      { id: 'skill', label: 'Skill Module' },
                      { id: 'dataset', label: 'Dataset File' },
                      { id: 'rental', label: 'Live Rental' }
                    ].map(typeOpt => (
                      <button
                        key={typeOpt.id}
                        type="button"
                        onClick={() => setPubType(typeOpt.id as any)}
                        className={`py-2 px-1 text-[10.5px] rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                          pubType === typeOpt.id
                            ? 'bg-stone-950 text-white font-bold border-stone-950'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {typeOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-450 uppercase font-semibold">Asset / Title name</label>
                  <input
                    type="text"
                    required
                    placeholder={pubType === 'dataset' ? 'e.g. parts_supplier_contacts' : 'e.g. Sentinel Operations Compliance Expert'}
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-450 uppercase font-semibold">Asset functional representation</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly state which applications are connected, parameters involved, and what tasks is handled autonomously..."
                    value={pubDescription}
                    onChange={(e) => setPubDescription(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none placeholder-stone-400 text-stone-900"
                  />
                </div>

                {/* CUSTOM PRICING INPUT */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-mono text-[#9D8055] uppercase font-bold text-left block">Custom Pricing ($)</label>
                     <div className="relative">
                       <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-mono font-bold">$</span>
                       <input
                         type="number"
                         min="1"
                         max="1000"
                         required
                         value={pubPrice}
                         onChange={(e) => setPubPrice(Number(e.target.value))}
                         className="w-full text-xs pl-7 pr-3 py-2.5 bg-stone-50 border border-[#9D8055]/50 hover:border-[#9D8055] rounded-xl font-mono font-bold focus:outline-none text-stone-900"
                       />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-mono text-stone-450 uppercase font-semibold text-left block">Category Focus</label>
                     <select
                       value={pubCategory}
                       onChange={(e) => setPubCategory(e.target.value)}
                       className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none text-stone-900"
                     >
                       <option value="Customer Support">Customer Support</option>
                       <option value="Finance">Finance</option>
                       <option value="Marketing">Marketing</option>
                       <option value="Operations">Operations</option>
                       <option value="Suppliers">Suppliers</option>
                       <option value="Ecommerce">Ecommerce</option>
                     </select>
                  </div>
                </div>

                {/* Creator Signature / Handle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-400 uppercase font-semibold">Creator Signature Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="@operator_handle"
                    value={pubCreatorHandle}
                    onChange={(e) => setPubCreatorHandle(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none text-stone-900"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between text-[10.5px] text-stone-450">
                  <span className="flex items-center gap-1.5 leading-tight max-w-[200px]">
                    <Lock className="w-4 h-4 text-stone-900 shrink-0" /> Real credential bindings are stripped of keys before indexing on Octo.
                  </span>
                  
                  <button
                    type="submit"
                    className="bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs px-6 py-3 rounded-lg transition-all cursor-pointer"
                  >
                    Confirm & Publish Listing
                  </button>
                </div>

              </form>
            )}

          </motion.div>
        </div>
      )}

      {/* SECTION 9 — FOOTER (Extremely minimal) */}
      <footer className="pt-12 border-t border-stone-100/80 text-[10.5px] font-mono text-stone-400 font-medium" id="marketplace-footer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <p className="text-stone-950 font-bold tracking-tight">octo. Shared Systems & Commercial Datasets Hub</p>
            <p className="leading-relaxed">A fully authenticated decentralized network. Everything operates isolated inside secure sandboxes.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-right">
            <span>Privately protected by default</span>
            <span>•</span>
            <span>Manual listings only</span>
            <span>•</span>
            <span>Decentralized architecture secure</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
