"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Plus, Check, FileText, RefreshCw, Cpu, 
  CheckCircle2, AlertCircle, Terminal, Lock, UploadCloud, 
  Sparkles, Database, Shield, Globe, CircleDot, Layers, HelpCircle
} from 'lucide-react';
import { AIWorker, TaskLog, MockFile, IntegrationApp } from '@/types';
import { useCompanyId } from '@/lib/use-company-id';
import { fetchAgents } from '@/lib/supabase/agents';
import { fetchFiles } from '@/lib/supabase/files';
import { fetchConnectedApps } from '@/lib/supabase/dashboard';

export default function OSSimulator() {
  const { companyId } = useCompanyId();
  const [activeTab, setActiveTab] = useState<'workflows' | 'files' | 'integrations' | 'terminal'>('workflows');
  
  const [apps, setApps] = useState<IntegrationApp[]>([]);
  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [files, setFiles] = useState<MockFile[]>([]);

  useEffect(() => {
    if (!companyId) return;
    Promise.all([
      fetchConnectedApps(companyId),
      fetchAgents(companyId),
      fetchFiles(companyId),
    ]).then(([integrations, agentList, fileList]) => {
      setApps(
        integrations.map((app, i) => ({
          id: `app-${i}`,
          name: app.name,
          connected: app.connected,
          category: 'Integration',
        }))
      );
      setWorkers(agentList);
      setFiles(fileList);
    });
  }, [companyId]);

  // Logs stream representing current task output
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePipeline, setActivePipeline] = useState<string | null>(null);

  // New Builder Form State
  const [showBuilder, setShowBuilder] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<'Finance' | 'Operations' | 'Support' | 'Research' | 'Marketing' | 'Legal'>('Finance');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [customDuty, setCustomDuty] = useState('');

  // Drag State for File Upload Simulation
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Terminal Logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Toggle app connectors
  const handleToggleApp = (appId: string) => {
    setApps(apps.map(app => app.id === appId ? { ...app, connected: !app.connected } : app));
    const app = apps.find(a => a.id === appId);
    if (app) {
      addSystemLog(`Integration ${app.name} was ${!app.connected ? 'activated' : 'deactivated'} manually.`, 'system');
    }
  };

  // Log Dispatcher Helper
  const addSystemLog = (message: string, type: 'info' | 'success' | 'alert' | 'system' = 'info', worker: string = 'System') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { timestamp, workerName: worker, message, type }]);
  };

  // Simulation Worker Execution Engine
  const runSOPPipeline = async (type: 'audit' | 'support' | 'legal' | 'custom', customName?: string, dutyText?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLogs([]);
    setActiveTab('workflows');

    const financeWorker = workers.find((w) => w.role === 'Finance') ?? workers[0];
    const supportWorker = workers.find((w) => w.role === 'Support') ?? workers[0];

    if (type === 'audit') {
      if (!financeWorker) {
        addSystemLog('No finance worker available. Create an agent first.', 'alert');
        setIsProcessing(false);
        return;
      }
      setActivePipeline('Financial Record Midnight Sync');
      setWorkers(prev => prev.map(w => w.id === financeWorker.id ? { ...w, status: 'running' } : w));
      
      const steps = [
        { msg: `${financeWorker.name} initialized. Synchronizing encryption tunnels...`, delay: 200 },
        { msg: 'Mounting source files from company vault.', delay: 700 },
        { msg: 'Polling raw events from payment integrations...', delay: 1200 },
        { msg: 'Transaction match: Found events to audit.', delay: 1800 },
        { msg: 'Cross-analyzing transactions, verifying ledger hashes...', delay: 2400 },
        { msg: 'Reconciling general ledger balance parameters...', delay: 4400 },
        { msg: 'Midnight reconciliation compiled successfully.', type: 'success' as const, delay: 5000 },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay - (logs.length * 10)));
        addSystemLog(step.msg, step.type || 'info', `${financeWorker.name} (Finance)`);
      }

      setWorkers(prev => prev.map(w => w.id === financeWorker.id ? { ...w, status: 'completed', tasksCount: w.tasksCount + 1 } : w));

    } else if (type === 'support') {
      if (!supportWorker) {
        addSystemLog('No support worker available. Create an agent first.', 'alert');
        setIsProcessing(false);
        return;
      }
      setActivePipeline('Autonomous Support Return Resolution');
      setWorkers(prev => prev.map(w => w.id === supportWorker.id ? { ...w, status: 'running' } : w));

      const steps = [
        { msg: `${supportWorker.name} initialized. Accessing support queue.`, delay: 200 },
        { msg: 'Unread email parsed from customer.', delay: 800 },
        { msg: 'Consulting order records...', delay: 1400 },
        { msg: 'SOP protocol matched for delayed shipment.', delay: 3200 },
        { msg: 'Drafting response: Refund notice generated.', type: 'success' as const, delay: 5200 },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay - (logs.length * 10)));
        addSystemLog(step.msg, step.type || 'info', `${supportWorker.name} (Support)`);
      }

      setWorkers(prev => prev.map(w => w.id === supportWorker.id ? { ...w, status: 'completed', tasksCount: w.tasksCount + 1 } : w));

    } else if (type === 'legal') {
      const legalWorker = workers.find((w) => w.role === 'Legal') ?? workers[0];
      if (!legalWorker) {
        addSystemLog('No legal worker available. Create an agent first.', 'alert');
        setIsProcessing(false);
        return;
      }
      setActivePipeline('Outbound Master Services Agreement Scraper');
      setWorkers(prev => prev.map(w => w.id === legalWorker.id ? { ...w, status: 'running' } : w));

      const steps = [
        { msg: `${legalWorker.name} initialized. Accessing uploaded documents.`, delay: 200 },
        { msg: 'Parsing documents from company vault.', delay: 900 },
        { msg: 'Extracting key-value liabilities list against compliance rules...', delay: 1600 },
        { msg: 'Liability check: Standard indemnification clause intact.', type: 'success' as const, delay: 2400 },
        { msg: 'Drafting document rewrite to operations vault...', delay: 4700 },
        { msg: 'Completed document generation. Security signature token pinned.', type: 'success' as const, delay: 5400 },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay - (logs.length * 10)));
        addSystemLog(step.msg, step.type || 'info', `${legalWorker.name} (Legal)`);
      }

      setWorkers(prev => prev.map(w => w.id === legalWorker.id ? { ...w, status: 'completed', tasksCount: w.tasksCount + 1 } : w));

    } else if (type === 'custom' && customName) {
      setActivePipeline(`Custom Flow: ${customName}`);
      setWorkers(prev => prev.map(w => w.name === customName ? { ...w, status: 'running' } : w));

      const steps = [
        { msg: `Speculating custom duty core: "${dutyText || 'Continuous maintenance'}"`, delay: 200 },
        { msg: `Spawning sandboxed virtual AI core. Appending keys: ${selectedApps.length > 0 ? selectedApps.join(', ') : 'None'}.`, delay: 1000 },
        { msg: `Ingesting corporate memory... Scanning connected documents.`, delay: 1800 },
        { msg: `Executing active duty: "${dutyText || 'Parsing general queries'}"...`, delay: 2600 },
        { msg: `Processing inputs autonomously using real-time policy filters.`, delay: 3400 },
        { msg: `Execution finalized. Clean run completed. Pipeline status logged to vault.`, type: 'success' as const, delay: 4200 },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay - (logs.length * 10)));
        addSystemLog(step.msg, step.type || 'info', `${customName} (${newWorkerRole})`);
      }

      setWorkers(prev => prev.map(w => w.name === customName ? { ...w, status: 'completed', tasksCount: w.tasksCount + 1 } : w));
    }

    setIsProcessing(false);
    setActivePipeline(null);
    
    // Automatically revert running statuses back to idle after short delay
    setTimeout(() => {
      setWorkers(prev => prev.map(w => w.status === 'completed' ? { ...w, status: 'idle' } : w));
    }, 4000);
  };

  // Create Worker Action
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    const colors = [
      'bg-purple-600',
      'bg-cyan-600',
      'bg-pink-600',
      'bg-teal-600',
      'bg-indigo-600'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: AIWorker = {
      id: String(workers.length + 1),
      name: newWorkerName,
      role: newWorkerRole,
      status: 'idle',
      avatarColor: randomColor,
      connectedApps: selectedApps.length > 0 ? selectedApps : ['None'],
      tasksCount: 0,
    };

    setWorkers([...workers, created]);
    setShowBuilder(false);
    addSystemLog(`Deployed new specialist: ${newWorkerName} assigned to ${newWorkerRole} cluster.`, 'success');

    // Run custom workflow right after creating!
    setTimeout(() => {
      runSOPPipeline('custom', newWorkerName, customDuty);
    }, 600);

    // Reset inputs
    setNewWorkerName('');
    setCustomDuty('');
    setSelectedApps([]);
  };

  // Toggle selecting applications for new worker
  const toggleAppSelection = (name: string) => {
    setSelectedApps(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  // File drag & drop simulator events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Simulate File Uploading animation
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            // Add custom mock file
            const newFile: MockFile = {
              name: 'uploaded_corporate_compliance.pdf',
              size: '1.8 MB',
              type: 'PDF',
              uploadedAt: 'Just now'
            };
            setFiles(prevFiles => [newFile, ...prevFiles]);
            addSystemLog('File "uploaded_corporate_compliance.pdf" uploaded to secure vault storage.', 'success');
          }, 500);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Simple Manual File Select Simulate
  const handleManualUpload = () => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            const newFile: MockFile = {
              name: 'operations_audit_log_2026.csv',
              size: '3.1 MB',
              type: 'CSV',
              uploadedAt: 'Just now'
            };
            setFiles(prevFiles => [newFile, ...prevFiles]);
            addSystemLog('Structured log "operations_audit_log_2026.csv" ingested successfully.', 'success');
          }, 500);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div 
      className="w-full bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-100/40 overflow-hidden flex flex-col h-[540px] md:h-[620px] font-sans"
      id="octo-cloud-os-sim"
    >
      {/* OS Sim Window Chrome Frame */}
      <div className="bg-stone-50 border-b border-stone-100 px-4 py-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-stone-300" />
          <div className="w-3 h-3 rounded-full bg-stone-300" />
          <div className="w-3 h-3 rounded-full bg-stone-300" />
          <span className="text-xs text-stone-400 font-medium ml-3 font-mono">
            workspace_os_standalone.sh
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-200/50 border border-stone-250">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-stone-600 font-medium tracking-wide">
              RUNNING_NODE: 0x889F
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">
            <Lock className="w-2.5 h-2.5 text-stone-400" />
            <span className="text-[10px] text-stone-500 font-mono">
              SECURE
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Drawer Dashboard: Workers Directory */}
        <div className="w-56 border-r border-stone-100 bg-stone-50/10 p-4 flex flex-col gap-4 select-none overflow-y-auto shrink-0 select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-stone-400 font-medium uppercase">
              AI Workers ({workers.length})
            </span>
            <button 
              type="button"
              onClick={() => {
                setShowBuilder(!showBuilder);
                if (!showBuilder) setActiveTab('workflows');
              }}
              className="text-stone-900 bg-stone-100 hover:bg-stone-200 rounded p-1 transition-colors relative cursor-pointer"
              title="Spawn Custom Worker"
              id="worker-spawn-btn"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Workers list */}
          <div className="flex flex-col gap-2">
            {workers.length === 0 && (
              <p className="text-[11px] text-stone-500 leading-snug px-1">
                No AI workers yet. Create your first AI worker.
              </p>
            )}
            {workers.map((worker) => (
              <div 
                key={worker.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  worker.status === 'running' 
                    ? 'border-emerald-250 bg-emerald-50/20 shadow-sm' 
                    : 'border-transparent hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${worker.avatarColor}`} />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {worker.name}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {worker.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {worker.status === 'running' ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-400 font-mono mt-0.5">
                      {worker.tasksCount} runs
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-stone-100">
            <div className="bg-stone-100/50 p-2.5 rounded-lg border border-stone-200/50 text-[10px] text-stone-500 font-serif leading-normal select-text">
              <span className="font-mono text-[9px] text-stone-400 uppercase tracking-wide block mb-1">
                SYSTEM GUARANTEE
              </span>
              Octo operates privately. Only you can access files or processes. Manual marketplace releases only.
            </div>
          </div>
        </div>

        {/* Right workspace: tabs and viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {/* Workspace Tabs Navbar */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/20 px-4 pt-1 shrink-0 select-none">
            <div className="flex gap-1">
              {[
                { id: 'workflows', label: 'Active Workflows', icon: Cpu },
                { id: 'files', label: 'Corporate Vault', icon: FileText },
                { id: 'integrations', label: 'App Connectors', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setShowBuilder(false);
                    }}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                      activeTab === tab.id && !showBuilder
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            {/* Quick status details */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-stone-400 font-mono">
              <span>ACTIVE PIPELINE: {isProcessing ? '1' : '0'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">STABLE</span>
            </div>
          </div>

          {/* Interactive workspace contents */}
          <div className="flex-1 p-5 overflow-y-auto relative min-h-0">
            <AnimatePresence mode="wait">
              {/* SPAWNED BUILDER PANEL */}
              {showBuilder && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 p-6 flex flex-col"
                >
                  <form onSubmit={handleCreateWorker} className="max-w-xl mx-auto w-full flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-stone-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-stone-950 animate-bounce" />
                        Assemble Specialist AI Worker
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Configure a secure agent instance with standard company duties and software authorization.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wide text-stone-400 mb-1.5">
                          Worker Code Name
                        </label>
                        <input 
                          type="text" 
                          required
                          value={newWorkerName}
                          onChange={(e) => setNewWorkerName(e.target.value)}
                          placeholder="e.g. Ledger Agent"
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-950"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wide text-stone-400 mb-1.5">
                          Functional Cluster
                        </label>
                        <select 
                          value={newWorkerRole}
                          onChange={(e) => setNewWorkerRole(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-950"
                        >
                          <option value="Finance">Finance / Accounting</option>
                          <option value="Operations">Operations / Logistics</option>
                          <option value="Support">Customer Success</option>
                          <option value="Legal">Legal & Compliance</option>
                          <option value="Research">Research & Planning</option>
                          <option value="Marketing">Growth & Copywriting</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wide text-stone-400 mb-1.5">
                        Operational Mandate & SOP Instructions
                      </label>
                      <textarea
                        value={customDuty}
                        onChange={(e) => setCustomDuty(e.target.value)}
                        placeholder="e.g., Cross-audit invoices from connected payment apps, match with bank transactions, and flag deviations automatically."
                        rows={2}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-stone-950 font-mono resize-none"
                      />
                    </div>

                    {/* Integrated App Checkbox Pill System */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wide text-stone-400 mb-1.5 animate-pulse">
                        Authorize API Connectors
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {apps.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => toggleAppSelection(app.name)}
                            className={`px-2.5 py-1.5 rounded-md text-[10px] border font-mono transition-all flex items-center gap-1 cursor-pointer ${
                              selectedApps.includes(app.name)
                                ? 'bg-stone-950 border-stone-950 text-white'
                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {selectedApps.includes(app.name) && <Check className="w-2.5 h-2.5 text-white" />}
                            {app.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 mt-auto border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setShowBuilder(false)}
                        className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-950 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold bg-stone-950 hover:bg-stone-850 active:scale-95 text-white rounded-lg transition-all shadow-sm"
                      >
                        Deploy Worker & Test Flow
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* VIEW: WORKFLOWS SIMULATION LIST */}
              {activeTab === 'workflows' && !showBuilder && (
                <motion.div
                  key="workflows-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full gap-4"
                >
                  <div className="flex justify-between items-start shrink-0">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-950">
                        Operational Pipelines
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Trigger automated SOP tasks. Standard procedures run privately in secure environments.
                      </p>
                    </div>
                  </div>

                  {/* Standard Run Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                    {/* Run Card 1 */}
                    <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between bg-stone-50/10 hover:border-stone-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            FINANCE AUDIT
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        </div>
                        <h5 className="text-xs font-bold text-stone-950">Midnight Ledger Reconciliation</h5>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal font-sans">
                          Runs nightly at midnight. Parses daily payment receipts against compliance sheets.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => runSOPPipeline('audit')}
                        disabled={isProcessing}
                        className={`w-full mt-4 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          isProcessing 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                            : 'bg-stone-950 hover:bg-stone-850 active:scale-95 text-white cursor-pointer'
                        }`}
                        id="run-audit-btn"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Run SOP Sync
                      </button>
                    </div>

                    {/* Run Card 2 */}
                    <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between bg-stone-50/10 hover:border-stone-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono bg-amber-50 border border-amber-150 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                            LOGISTICS SOP
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        </div>
                        <h5 className="text-xs font-bold text-stone-950">Instant Support Returns Resolution</h5>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal font-sans">
                          Trigger refund flows dynamically when delays occur on customer orders.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => runSOPPipeline('support')}
                        disabled={isProcessing}
                        className={`w-full mt-4 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          isProcessing 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                            : 'bg-stone-950 hover:bg-stone-850 active:scale-95 text-white cursor-pointer'
                        }`}
                        id="run-support-btn"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Run Support SOP
                      </button>
                    </div>

                    {/* Run Card 3 */}
                    <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between bg-stone-50/10 hover:border-stone-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono bg-rose-50 border border-rose-150 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                            LEGAL SCRAPER
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        </div>
                        <h5 className="text-xs font-bold text-stone-950">Agreement Outbound compliance audit</h5>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal font-sans">
                          Scrape external corporate PDF agreements. Match clauses, flag liabilities.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => runSOPPipeline('legal')}
                        disabled={isProcessing}
                        className={`w-full mt-4 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          isProcessing 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                            : 'bg-stone-950 hover:bg-stone-850 active:scale-95 text-white cursor-pointer'
                        }`}
                        id="run-legal-btn"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Audit Agreements
                      </button>
                    </div>
                  </div>

                  {/* Terminal Log Output Window */}
                  <div className="flex-1 min-h-[140px] md:min-h-[180px] border border-stone-950/15 bg-stone-950 rounded-xl flex flex-col overflow-hidden shadow-inner selection:bg-stone-800 selection:text-emerald-400">
                    <div className="bg-stone-900 px-4 py-2 border-b border-stone-950/25 flex items-center justify-between select-none shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-[10px] font-mono text-stone-400 tracking-wide uppercase font-semibold">
                          Active SOP Console Output
                        </span>
                      </div>
                      {isProcessing && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>running pipeline...</span>
                        </div>
                      )}
                    </div>

                    {/* Console list output */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed">
                      {logs.length === 0 ? (
                        <div className="text-stone-500 h-full flex flex-col items-center justify-center gap-2 select-none text-center">
                          <Terminal className="w-6 h-6 text-stone-600" />
                          <p>Ready to deploy. Trigger a process flow from above to watch AI Workers run.</p>
                        </div>
                      ) : (
                        logs.map((log, index) => (
                          <div key={index} className="flex items-start gap-4 hover:bg-stone-900/50 transition-colors py-0.5">
                            <span className="text-stone-600 select-none shrink-0 tracking-tighter">
                              [{log.timestamp}]
                            </span>
                            <span className="text-stone-400 font-semibold shrink-0 select-none min-w-[130px] border-r border-stone-800 pr-2">
                              {log.workerName}:
                            </span>
                            <span className={`break-words ${
                              log.type === 'success' 
                                ? 'text-emerald-400' 
                                : log.type === 'alert' 
                                  ? 'text-rose-400' 
                                  : log.type === 'system'
                                    ? 'text-cyan-400'
                                    : 'text-stone-300'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW: CORPORATE VAULT FILES LIST & Simulated Drag Drop */}
              {activeTab === 'files' && !showBuilder && (
                <motion.div
                  key="files-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full gap-4"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-stone-950 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      Encrypted Knowledge base Storage
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Uploaded files are completely private. Workers construct vectors and analyze policies without exposure.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-[220px]">
                    {/* Drag and Drop Zone Simulator */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`md:col-span-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                        isDragOver 
                          ? 'border-stone-950 bg-stone-50/10' 
                          : 'border-stone-250 hover:border-stone-400 bg-stone-50/30'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-stone-400 mb-2.5" />
                      
                      {uploadProgress !== null ? (
                        <div className="w-full max-w-[160px] flex flex-col items-center gap-2">
                          <p className="text-xs text-stone-950 font-mono">Parsing file ({uploadProgress}%)</p>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-stone-950 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-stone-950">Drag corporate docs here</p>
                          <p className="text-[10px] text-stone-400 mt-1">SOP books, contracts, finance ledgers, rules (PDF, xlsx, docx)</p>
                          <button
                            type="button"
                            onClick={handleManualUpload}
                            className="text-xs font-semibold border border-stone-200 bg-white hover:bg-stone-50 text-stone-950 rounded-lg px-3 py-1.5 mt-3.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            Browse Files
                          </button>
                        </>
                      )}
                    </div>

                    {/* Files Directory */}
                    <div className="md:col-span-7 flex flex-col gap-2 overflow-y-auto pr-1">
                      <span className="text-[10px] font-mono tracking-wider text-stone-400 font-medium uppercase mb-1">
                        Active Database Sources ({files.length})
                      </span>
                      {files.map((file, i) => (
                        <div 
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors hover:shadow-xs group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 font-mono text-[10px] font-bold">
                              {file.type}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-950 truncate max-w-[210px] sm:max-w-xs">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {file.size} • Ingested {file.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              Ready for AI Core
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW: INTEGRATIONS DIRECTORY */}
              {activeTab === 'integrations' && !showBuilder && (
                <motion.div
                  key="integrations-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full gap-4"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-stone-950">
                      App Connectors & APIs
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Instruct AI workers to hook securely into external tools. Connectors remain strictly scoped to credentials locally cached.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-[220px]">
                    {apps.map((app) => (
                      <div 
                        key={app.id}
                        className={`p-4 border rounded-xl flex flex-col justify-between transition-all ${
                          app.connected 
                            ? 'border-emerald-200 bg-emerald-50/10' 
                            : 'border-stone-200 bg-stone-50/5 hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wide">
                              {app.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${app.connected ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                              <span className="text-[10px] font-mono text-stone-500">
                                {app.connected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          </div>
                          <h5 className="text-xs font-bold text-stone-950">
                            {app.name}
                          </h5>
                          <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                            Authorize workers to read schedules or issue operations through {app.name} systems.
                          </p>
                        </div>

                        {/* Interactive toggle block */}
                        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-mono">
                            API Active Layer
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleApp(app.id)}
                            className={`p-1 pl-3 pr-3 text-[10px] border font-bold rounded-lg transition-all active:scale-95 cursor-pointer ${
                              app.connected
                                ? 'bg-stone-100 font-semibold border-stone-200 text-stone-600 hover:bg-stone-200'
                                : 'bg-stone-950 font-bold border-stone-950 text-white hover:bg-stone-850'
                            }`}
                          >
                            {app.connected ? 'Disconnect' : 'Connect API'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
