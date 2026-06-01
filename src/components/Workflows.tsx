"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, Plus, Sparkles, Check, Play, Pause, X, UploadCloud, FileText, 
  Trash2, Shield, Eye, ArrowRight, Layers, CreditCard, ExternalLink, HelpCircle
} from 'lucide-react';
import { MockFile } from '@/types';
import { useCompanyId } from '@/lib/use-company-id';
import { fetchWorkflows, type WorkflowRecord } from '@/lib/supabase/workflows';
import { fetchActivityLogs } from '@/lib/supabase/activity';

interface Workflow {
  id: string;
  name: string;
  description: string;
  workers: string[];
  apps: string[];
  status: 'Running' | 'Waiting' | 'Finished' | 'Needs Approval';
  humanWording: string;
  lastActivity: string;
  timeAgo: string;
  filesCount: number;
  approvalRule: string;
}

interface WorkflowsProps {
  workersList: any[];
  connectedApps: string[];
  companyFiles: MockFile[];
  onAddActivity: (message: string, workerName: string) => void;
  onSetActiveTab: (tab: 'dashboard' | 'builder' | 'workers' | 'workflows' | 'teams' | 'files' | 'marketplace' | 'billing' | 'settings') => void;
}

export default function Workflows({ 
  workersList, 
  connectedApps, 
  companyFiles,
  onAddActivity,
  onSetActiveTab
}: WorkflowsProps) {
  const { companyId } = useCompanyId();

  const mapWorkflow = (w: WorkflowRecord): Workflow => ({
    id: w.id,
    name: w.name,
    description: w.description ?? '',
    workers: w.workers,
    apps: w.apps,
    status: w.status,
    humanWording: w.humanWording,
    lastActivity: w.lastActivity,
    timeAgo: w.timeAgo,
    filesCount: w.filesCount,
    approvalRule: w.approvalRule,
  });

  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    if (!companyId) return;
    fetchWorkflows(companyId).then((rows) => setWorkflows(rows.map(mapWorkflow)));
  }, [companyId]);

  const [liveActivities, setLiveActivities] = useState<
    { id: string; text: string; time: string; workflow: string }[]
  >([]);

  useEffect(() => {
    if (!companyId) return;
    fetchActivityLogs(companyId, 10).then((logs) =>
      setLiveActivities(
        logs.map((l) => ({
          id: l.id,
          text: l.text,
          time: l.time,
          workflow: l.worker,
        }))
      )
    );
  }, [companyId]);

  // Workflow creation states
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedAppsList, setSelectedAppsList] = useState<string[]>([]);
  const [approvalRule, setApprovalRule] = useState('Auto-run allowed');

  useEffect(() => {
    if (selectedWorkers.length === 0 && workersList && workersList.length > 0) {
      setSelectedWorkers([workersList[0].name]);
    }
  }, [workersList]);

  useEffect(() => {
    if (selectedAppsList.length === 0 && connectedApps && connectedApps.length > 0) {
      setSelectedAppsList([connectedApps[0]]);
    }
  }, [connectedApps]);
  
  const [uploadedFiles, setUploadedFiles] = useState<MockFile[]>([]);

  useEffect(() => {
    setUploadedFiles(companyFiles);
  }, [companyFiles]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [creationMessage, setCreationMessage] = useState('');


  // Create new workflow action
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) {
      alert('Please define a workflow name.');
      return;
    }

    // Determine default status wording based on approval rules
    let initialStatus: 'Running' | 'Waiting' | 'Finished' | 'Needs Approval' = 'Running';
    let humanText = 'Running scheduled cycles automatically.';
    
    if (approvalRule === 'Needs human approval') {
      initialStatus = 'Needs Approval';
      humanText = 'Awaiting human consent before next loop.';
    } else {
      initialStatus = 'Running';
      humanText = 'Actively synchronizing operations in safe sandbox.';
    }

    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom business flow automated with cloud specialists.',
      workers: selectedWorkers,
      apps: selectedAppsList,
      status: initialStatus,
      humanWording: humanText,
      lastActivity: 'Workflow initialized and operating',
      timeAgo: 'Just now',
      filesCount: uploadedFiles.length,
      approvalRule: approvalRule === 'Needs human approval' ? 'Human Approval Required' : 'Complete Autonomy'
    };

    setWorkflows(prev => [newWorkflow, ...prev]);

    // Add activity log
    const connectedAppsStr = newWorkflow.apps.length > 0 ? newWorkflow.apps.join(', ') : 'None';
    const logText = `Created new workflow "${newWorkflow.name}" automatically. Connected apps: ${connectedAppsStr}.`;
    setLiveActivities(prev => [{
      id: `l-create-${Date.now()}`,
      text: logText,
      time: 'Just now',
      workflow: newWorkflow.name
    }, ...prev]);

    if (selectedWorkers.length > 0) {
      onAddActivity(logText, selectedWorkers[0]);
    }

    // Reset fields
    setNewWfName('');
    setNewWfDesc('');
    setSelectedWorkers(workersList && workersList.length > 0 ? [workersList[0].name] : []);
    setSelectedAppsList(connectedApps && connectedApps.length > 0 ? [connectedApps[0]] : []);
    setApprovalRule('Auto-run allowed');
    setUploadedFiles([]);
    setCreationMessage('Workflow created successfully!');

    setTimeout(() => {
      setCreationMessage('');
      // Scroll smoothly to active workflows
      const el = document.getElementById('section-2-workflows-list');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  };

  // Toggle workflow status (Resume/Pause button)
  const handleToggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const isPaused = w.status === 'Waiting';
        const nextStatus = isPaused ? 'Running' : 'Waiting';
        const humanText = isPaused ? 'Actively synchronizing operations in safe sandbox.' : 'Waiting for next scheduled window.';
        
        // Log action
        const msg = `Workflow "${w.name}" was ${isPaused ? 'resumed' : 'paused'} by owner.`;
        setLiveActivities(prevAct => [{
          id: `l-toggle-${Date.now()}`,
          text: msg,
          time: 'Just now',
          workflow: w.name
        }, ...prevAct]);

        return {
          ...w,
          status: nextStatus as any,
          humanWording: humanText,
          lastActivity: isPaused ? 'Listening for input events' : 'Paused by administrator'
        };
      }
      return w;
    }));
  };

  // Delete/Archive workflow
  const handleDeleteWorkflow = (id: string, name: string) => {
    if (confirm(`Are you sure you want to stop and archive "${name}"?`)) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
      
      setLiveActivities(prev => [{
        id: `l-[deleted]-${Date.now()}`,
        text: `Archived workflow "${name}" securely. Local files and states remain isolated.`,
        time: 'Just now',
        workflow: 'System'
      }, ...prev]);
    }
  };

  // File drag-and-drop
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
    
    if (e.dataTransfer.files) {
      const fileList = e.dataTransfer.files;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const newFile: MockFile = {
          name: file.name,
          size: `${sizeMb} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'Document',
          uploadedAt: 'Just now'
        };
        setUploadedFiles(prev => [newFile, ...prev]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = e.target.files;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const newFile: MockFile = {
          name: file.name,
          size: `${sizeMb} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'Document',
          uploadedAt: 'Just now'
        };
        setUploadedFiles(prev => [newFile, ...prev]);
      }
    }
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Status-informed style helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Running':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
      case 'Waiting':
        return 'text-stone-500 bg-stone-50 border-stone-200/50';
      case 'Finished':
        return 'text-blue-700 bg-blue-50 border-blue-200/60';
      case 'Needs Approval':
        return 'text-amber-800 bg-amber-50 border-amber-200/60';
      default:
        return 'text-stone-500 bg-[#FCFCFA] border-stone-200';
    }
  };

  return (
    <div className="font-sans text-stone-900 bg-white" id="octo-workflows-page">
      
      {/* =========================================================================
                                     SECTION 1 — HERO
          ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-stone-100/60 select-none" id="workflows-hero">
        <div className="max-w-4xl flex flex-col gap-6">
          <p className="text-[10px] font-mono tracking-[0.25em] text-stone-450 uppercase font-bold">
            Autonomous Business Loops
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-950">
            Your workflows.
          </h1>
          <p className="text-base sm:text-lg text-stone-500 font-light leading-relaxed max-w-2xl">
            Automate repetitive work using AI workers, connected apps, and simple business flows. There are no technical developer graphs, just seamless outcomes for real businesses.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <a
              href="#section-4-create-workflow"
              className="bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs px-8 py-4 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </a>

            <button
              type="button"
              onClick={() => onSetActiveTab('builder')}
              className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-semibold text-xs px-8 py-4 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Open Builder
            </button>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-stone-400 mt-4">
            <span className="flex items-center gap-1.5 font-semibold text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Private by default
            </span>
            <span>•</span>
            <span className="text-stone-500 font-semibold">Connected to your apps</span>
            <span>•</span>
            <span>Running automatically</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
                               SECTION 2 — ACTIVE WORKFLOWS
          ========================================================================= */}
      <section className="py-20 space-y-12" id="section-2-workflows-list">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">Active Business Automations</h2>
            <p className="text-xs text-stone-400 mt-1">Simple tasks mapped to your specialists running concurrently.</p>
          </div>
          <span className="text-xs font-mono font-medium text-stone-450 bg-stone-50 px-2.5 py-1 rounded border border-stone-100">
            {workflows.length} Workflows Operating
          </span>
        </div>

        <div className="space-y-6">
          {workflows.length === 0 ? (
            <div className="border border-stone-200 p-10 rounded-2xl text-center bg-white">
              <p className="text-sm font-bold text-stone-950">No workflows yet.</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">Create your first workflow below.</p>
            </div>
          ) : null}
          {workflows.map((wf) => (
            <div 
              key={wf.id} 
              className="border border-stone-200 rounded-2xl bg-white hover:border-stone-350 transition-all p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
            >
              {/* Left Column: Core Workflow Info */}
              <div className="space-y-4 max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold text-stone-950 font-sans">{wf.name}</h3>
                  
                  <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(wf.status)}`}>
                    {wf.status}
                  </span>
                </div>
                
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  {wf.description}
                </p>

                {/* Connected specialists & apps */}
                <div className="flex flex-wrap items-center gap-6 pt-1 text-xs select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Specialists:</span>
                    <div className="flex gap-1.5">
                      {wf.workers.map(worker => (
                        <span key={worker} className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-150 text-stone-700 font-semibold text-[11px]">
                          {worker}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Apps Connected:</span>
                    <div className="flex items-center gap-1 text-stone-500 font-mono text-[11px]">
                      {wf.apps.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Operational Outcomes / Interactive actions */}
              <div className="lg:border-l lg:border-stone-100 lg:pl-10 flex flex-col justify-between lg:min-h-[120px] lg:w-72 shrink-0 gap-6">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold block">CURRENT BUSINESS STATE</span>
                  <p className="text-[13px] font-semibold text-stone-900 leading-normal">
                    “{wf.humanWording}”
                  </p>
                  <p className="text-[11px] text-stone-400 leading-tight">
                    Last check: <span className="italic">{wf.lastActivity}</span> • <span className="font-mono text-[10px]">{wf.timeAgo}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1 select-none">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(wf.id)}
                      className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        wf.status === 'Waiting' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                      title={wf.status === 'Waiting' ? 'Resume flow' : 'Pause flow'}
                    >
                      {wf.status === 'Waiting' ? (
                        <>
                          <Play className="w-3 h-3 fill-emerald-800" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(wf.id)}
                      className="p-2 border border-stone-200 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer"
                      title="Trigger dynamic loop immediately"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWorkflow(wf.id, wf.name)}
                    className="p-2 text-stone-300 hover:text-red-700 transition-colors"
                    title="Stop & Archive Workflow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* =========================================================================
                              SECTION 3 — LIVE WORKFLOW ACTIVITY
          ========================================================================= */}
      <section className="py-12 bg-stone-50/40 border-y border-stone-100 -mx-14 md:-mx-20 px-14 md:px-20" id="section-3-live-feed">
        <div className="max-w-6xl mx-auto space-y-8 py-4">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold text-stone-950 font-sans tracking-tight">Active loop operations</h3>
            <p className="text-xs text-stone-450 mt-1">Self-run checks handled autonomously behind safe private channels.</p>
          </div>

          <div className="border border-stone-200 rounded-2xl bg-white divide-y divide-stone-100 overflow-hidden shadow-xs">
            {liveActivities.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-stone-950">No workflow activity yet.</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">Activity will appear as workflows run.</p>
              </div>
            ) : null}
            {liveActivities.slice(0, 5).map((l) => (
              <div key={l.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-950 shrink-0" />
                  <p className="text-stone-700 leading-relaxed font-sans">{l.text}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 font-mono text-[11px] text-stone-400 select-none">
                  <span className="font-semibold text-stone-450 bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">
                    {l.workflow}
                  </span>
                  <span>{l.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================================
                            SECTION 4 — CREATE NEW WORKFLOW
          ========================================================================= */}
      <section className="py-24 space-y-12" id="section-4-create-workflow">
        <div className="border-b border-stone-100 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">Setup Autonomous Workflow</h2>
          <p className="text-xs text-stone-400 mt-1 leading-normal">Deploy another continuous operational loop. Simply write what you need and Octo coordinates your specialists.</p>
        </div>

        {creationMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border border-emerald-200 bg-emerald-50 text-emerald-950 text-xs font-semibold rounded-xl"
          >
            ✓ {creationMessage}
          </motion.div>
        )}

        <form onSubmit={handleCreateWorkflow} className="space-y-10 max-w-3xl">
          
          {/* 1. Workflow Name */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-650 font-mono">
              1. Name of Workflow
            </label>
            <input 
              type="text" 
              required
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
              placeholder="e.g., Customer Support Workflow, Supplier Ledger sync, Weekly Finance Reports"
              className="w-full text-sm bg-stone-50/50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans"
            />
          </div>

          {/* 2. What should this workflow do (Textarea) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-650 font-mono">
              2. What task should be handled?
            </label>
            <p className="text-[11px] text-stone-400 -mt-1 font-sans">Describe the business automation objective in natural, human steps.</p>
            <textarea 
              rows={4}
              required
              value={newWfDesc}
              onChange={(e) => setNewWfDesc(e.target.value)}
              placeholder="e.g., Reply to customer emails, update support sheets, and notify Slack."
              className="w-full text-sm bg-stone-50/50 border border-stone-200 p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans"
            />
          </div>

          {/* 3. Select AI Workers & Connect Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 3.1 Select AI Workers (multiple) */}
            <div className="space-y-3 select-none">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-655 font-mono">
                3. Appoint AI Workers
              </label>
              <p className="text-[11px] text-stone-400 font-sans">Mark specialists that are authorized to fulfill this workflow (scroll to see more):</p>
              
              <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1 border border-stone-200/60 rounded-xl p-2 bg-stone-50/10">
                {workersList && workersList.length > 0 ? (
                  workersList.map(worker => {
                    const active = selectedWorkers.includes(worker.name);
                    return (
                      <button
                        key={worker.id}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setSelectedWorkers(prev => prev.filter(w => w !== worker.name));
                          } else {
                            setSelectedWorkers(prev => [...prev, worker.name]);
                          }
                        }}
                        className={`w-full text-left text-xs p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          active 
                            ? 'bg-stone-950/5 border-stone-400 text-stone-950 font-semibold' 
                            : 'bg-stone-50/40 border-stone-200 text-stone-500'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{worker.name}</span>
                          <span className="text-[10px] text-stone-450 font-light block">{worker.role || 'Specialist'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {active && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center p-6 text-stone-400 text-xs italic font-sans">
                    No active AI specialists found.
                  </div>
                )}
              </div>
            </div>

            {/* 3.2 Connect Apps */}
            <div className="space-y-3 select-none">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-655 font-mono">
                4. App Connections
              </label>
              <p className="text-[11px] text-stone-400 font-sans">Select active connections integrated from Composio (scroll to see more):</p>
              
              <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1 border border-stone-200/60 rounded-xl p-2 bg-stone-50/10">
                {connectedApps && connectedApps.length > 0 ? (
                  connectedApps.map(app => {
                    const active = selectedAppsList.includes(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setSelectedAppsList(prev => prev.filter(a => a !== app));
                          } else {
                            setSelectedAppsList(prev => [...prev, app]);
                          }
                        }}
                        className={`w-full text-left text-xs p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          active 
                            ? 'bg-stone-950/5 border-stone-400 text-stone-950 font-semibold' 
                            : 'bg-stone-50/40 border-stone-200 text-stone-500'
                        }`}
                      >
                        <span className="font-semibold truncate">{app} Connection</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {active && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center p-6 text-stone-400 text-xs italic font-sans text-stone-505">
                    No active connections found. Authorize portals in Dashboard or Settings first.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 5. Drag and Drop Files block */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-650 font-mono">
              5. Ingest Guidelines or Files (SOPs, sheets, catalogs)
            </label>
            <p className="text-[11px] text-stone-400 -mt-1">Drag company-specific procedures here. Files are parsed inside isolated secure vaults.</p>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed p-8 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver ? 'border-stone-950 bg-stone-50' : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-stone-400" />
              <div>
                <p className="text-xs font-semibold text-stone-950">Drag SOP PDFs or spreadsheet files here</p>
                <p className="text-[11px] text-stone-400 mt-1 font-sans">or click to browse local files manually</p>
              </div>
              <input 
                type="file" 
                multiple 
                onChange={handleFileSelect} 
                className="hidden" 
                id="workflow-file-uploader"
              />
              <label 
                htmlFor="workflow-file-uploader" 
                className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-[11px] px-4 py-2 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                Choose files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="border border-stone-150 rounded-xl max-h-40 overflow-y-auto divide-y divide-stone-100 bg-white mt-3">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-800 truncate max-w-sm">{file.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(idx)}
                      className="text-stone-300 hover:text-red-500 font-semibold p-1 text-[10px]"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Approval Rules (Radio Choices) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-650 font-mono">
              6. Operational Control Rules
            </label>
            <p className="text-[11px] text-stone-400 -mt-1">Define security check thresholds for autonomous dispatch elements:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 select-none">
              {[
                { id: 'Auto-run allowed', label: 'Complete Autonomy', desc: 'Full speed. Octo acts entirely self-sufficiently on continuous background loops.' },
                { id: 'Needs human approval', label: 'Human Approval', desc: 'Gated execution. Hold all drafts and critical workflows for human verification.' }
              ].map((rule) => {
                const active = approvalRule === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => setApprovalRule(rule.id)}
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      active 
                        ? 'bg-stone-950 text-white border-stone-950 shadow-xs' 
                        : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 text-stone-850'
                    }`}
                  >
                    <span className="text-xs font-bold block">{rule.label}</span>
                    <span className={`text-[10px] leading-relaxed block ${active ? 'text-stone-300' : 'text-stone-450'}`}>
                      {rule.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-stone-950 hover:bg-stone-850 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>

        </form>
      </section>


      {/* =========================================================================
                              SECTION 5 — WORKFLOWS RUNNING NOW
          ========================================================================= */}
      <section className="py-20 border-t border-stone-100" id="section-5-operational-overview">
        <div className="space-y-8">
          <div className="border-b border-stone-100 pb-5">
            <h3 className="text-xl font-bold tracking-tight text-stone-950 font-sans">Workflows running now</h3>
            <p className="text-xs text-stone-400 mt-1">Overview of business work handled automatically across active operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-stone-150 rounded-xl bg-stone-50/50 space-y-3">
              <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Active Cycle
              </span>
              <h4 className="text-sm font-bold text-stone-900 font-sans">Support workflow handling customer emails</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                Monitoring customer support inboxes on standard cycles and coordinating replies with verified company SOP structures.
              </p>
            </div>

            <div className="p-6 border border-stone-150 rounded-xl bg-stone-50/50 space-y-3">
              <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Active Cycle
              </span>
              <h4 className="text-sm font-bold text-stone-900 font-sans">Finance workflow generating reports</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                Downloading raw deposit ledgers, checking discrepancies locally, and updating secure spreadsheets.
              </p>
            </div>

            <div className="p-6 border border-stone-150 rounded-xl bg-stone-50/50 space-y-3">
              <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Active Cycle
              </span>
              <h4 className="text-sm font-bold text-stone-900 font-sans">Marketing workflow scheduling content</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                Preparing custom brand newsletters, updating calendar postings, and dispatching layout approvals for human checking.
              </p>
            </div>

            <div className="p-6 border border-stone-150 rounded-xl bg-stone-50/50 space-y-3">
              <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Active Cycle
              </span>
              <h4 className="text-sm font-bold text-stone-900 font-sans">Inventory workflow updating spreadsheets</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                Scanning delivery backlog data blocks, compiling status briefings, and flagging delayed supplier shipping accounts.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
                               SECTION 6 — CONNECTED APPS
          ========================================================================= */}
      <section className="py-20 border-t border-stone-100/80" id="section-6-connected-apps-row">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-stone-950 font-sans">Apps your workflows can use</h3>
            <p className="text-xs text-stone-400 mt-1">Easily authorize corporate portals securely. Connections operate fully isolated.</p>
          </div>

          <div className="border border-stone-150 rounded-2xl bg-white divide-y divide-stone-100 overflow-hidden">
            {connectedApps.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-stone-950">No connected apps yet.</p>
                <p className="text-xs text-stone-400 mt-1">Connect integrations in Settings.</p>
              </div>
            ) : (
            connectedApps.map((appId) => {
              const matched = selectedAppsList.includes(appId);
              return (
                <div key={appId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-stone-50/20 transition-all text-xs">
                  <div className="flex items-center gap-4 max-w-xl">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                      <span className="font-mono text-stone-900 font-bold select-none text-[10px]">{appId.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{appId} Portal Connection</h4>
                      <p className="text-xs text-stone-400 leading-relaxed mt-1 font-sans">Connected integration for workflow automation.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${matched ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                      <span className={`text-[11px] font-mono font-bold ${matched ? "text-emerald-700" : "text-stone-400"}`}>
                        {matched ? "Access Enabled" : "Access Not Linked"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }))
            }
          </div>
        </div>
      </section>


      {/* =========================================================================
                                     SECTION 7 — FOOTER
          ========================================================================= */}
      <footer className="py-12 border-t border-stone-100 text-xs font-mono text-stone-400 select-none flex flex-col sm:flex-row items-center justify-between gap-4" id="section-7-footer">
        <div>
          <span>© Octo Workspace. Standalone business automation engine.</span>
        </div>
        <div className="flex gap-6">
          <span>Private by default</span>
          <span>Manual publishing only</span>
          <span>Encryption Verified</span>
        </div>
      </footer>

    </div>
  );
}
