"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Check, Upload, Play, Pause, FileText, Plus, 
  Layers, Lock, Sparkles, FileDown, ShieldAlert, CheckCircle, Clock,
  Volume2, Mic, Send, Trash2, HelpCircle, Briefcase, RefreshCw, 
  Mail, MessageSquare, ShoppingCart, DollarSign, Database, FolderGit, 
  Calendar as CalendarIcon, ArrowRight, CheckCircle2, Sliders, PlayCircle,
  ChevronRight
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';
import { useCompanyId } from '@/lib/use-company-id';
import { fetchTeams, type TeamRecord } from '@/lib/supabase/teams';
import { fetchActivityLogs } from '@/lib/supabase/activity';
import { fetchWorkflows } from '@/lib/supabase/workflows';

interface TeamsProps {
  workersList: AIWorker[];
  connectedApps: string[];
  companyFiles: MockFile[];
  onAddActivity: (text: string, workerName: string) => void;
  onSetActiveTab: (tab: any) => void;
}

interface TeamWorkerItem {
  name: string;
  role: string;
  responsibilities: string;
}

interface TeamItem {
  id: string;
  name: string;
  description: string;
  workers: TeamWorkerItem[];
  apps: string[];
  files: string[];
  status: 'Working' | 'Waiting' | 'Finished' | 'Needs Approval';
  approvalRule: string;
  currentWork: string;
  tasks: string[];
}

interface TeamWorkflowItem {
  id: string;
  name: string;
  steps: string[];
  isActive: boolean;
}

export default function Teams({ 
  workersList, 
  connectedApps, 
  companyFiles, 
  onAddActivity,
  onSetActiveTab 
}: TeamsProps) {
  const { companyId } = useCompanyId();

  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeamIdForWorkers, setSelectedTeamIdForWorkers] = useState<string>('');
  const [selectedTeamIdForWorkflows, setSelectedTeamIdForWorkflows] = useState<string>('');

  useEffect(() => {
    if (!companyId) return;
    fetchTeams(companyId).then((rows: TeamRecord[]) => {
      const mapped: TeamItem[] = rows.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        workers: t.workers,
        apps: t.apps,
        files: t.files,
        status: t.status,
        approvalRule: t.approvalRule,
        currentWork: t.currentWork,
        tasks: t.tasks,
      }));
      setTeams(mapped);
      if (mapped.length > 0) {
        setSelectedTeamIdForWorkers(mapped[0].id);
        setSelectedTeamIdForWorkflows(mapped[0].id);
      }
    });
  }, [companyId]);

  const [logsList, setLogsList] = useState<
    { id: string; text: string; time: string; dept: string }[]
  >([]);

  useEffect(() => {
    if (!companyId) return;
    fetchActivityLogs(companyId, 10).then((logs) =>
      setLogsList(
        logs.map((l) => ({
          id: l.id,
          text: l.text,
          time: l.time,
          dept: l.worker,
        }))
      )
    );
  }, [companyId]);

  // SECTION 1 — TEAM BUILDER CHAT
  const [chatInput, setChatInput] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceFinished, setVoiceFinished] = useState(false);
  const [draftedTeam, setDraftedTeam] = useState<any | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState('');
  const [localFiles, setLocalFiles] = useState<MockFile[]>([]);

  useEffect(() => {
    setLocalFiles(companyFiles);
  }, [companyFiles]);

  const [chooseExistingWorker, setChooseExistingWorker] = useState<string>(
    workersList && workersList.length > 0 ? workersList[0].name : ''
  );

  useEffect(() => {
    if (workersList.length > 0 && !chooseExistingWorker) {
      setChooseExistingWorker(workersList[0].name);
    }
  }, [workersList, chooseExistingWorker]);
  const [existingWorkerRole, setExistingWorkerRole] = useState('');
  const [existingWorkerResponsible, setExistingWorkerResponsible] = useState('');

  // Create worker form
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('Support');
  const [newWorkerResponsible, setNewWorkerResponsible] = useState('');

  // SECTION 4 — WORKFLOW TESTING SIMULATION
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'step1' | 'step2' | 'step3' | 'step4' | 'success'>('idle');
  const [testingWorkflowId, setTestingWorkflowId] = useState<string>('');
  const [teamWorkflows, setTeamWorkflows] = useState<
    {
      id: string;
      trigger: string;
      goal: string;
      steps: { label: string; detail: string; worker: string }[];
    }[]
  >([]);

  useEffect(() => {
    if (!companyId) return;
    fetchWorkflows(companyId).then((rows) => {
      const stepLabels = ['Triage', 'Process', 'Review', 'Complete'];
      setTeamWorkflows(
        rows.map((w) => {
          const assignees =
            w.workers.length >= 4
              ? w.workers.slice(0, 4)
              : [
                  ...w.workers,
                  ...Array(Math.max(0, 4 - w.workers.length)).fill('Workspace'),
                ];
          return {
            id: w.id,
            trigger: w.description || w.humanWording || w.name,
            goal: w.humanWording || w.name,
            steps: assignees.map((worker, i) => ({
              label: stepLabels[i] ?? `Step ${i + 1}`,
              detail: w.description || 'Execute workflow step',
              worker,
            })),
          };
        })
      );
    });
  }, [companyId]);

  // Action messages
  const [successMsg, setSuccessMsg] = useState('');

  // File dropzone text
  const [fileDropText, setFileDropText] = useState('Attach specific department rules (SOPs, PDF)');

  // Preset plans analyzer
  const handleChatPresetClick = (promptText: string) => {
    setChatInput(promptText);
    computeDraftState(promptText);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    computeDraftState(chatInput);
  };

  // Helper function: analyze prompt inputs for presets
  const computeDraftState = (input: string) => {
    const text = input.toLowerCase();
    
    let result: any = null;

    if (text.includes('support') || text.includes('customer')) {
      result = {
        name: "Customer Support Team",
        description: "Assists customer requests, verifies payments, coordinates billing issues, and updates customer-facing sheets.",
        workers: [
          { name: "Support Specialist", role: "Replies to customers", responsibilities: "drafts polite, accurate responses to common product issues" },
          { name: "Refund Specialist", role: "Verifies checkout payments", responsibilities: "checks transaction list before refunding carts" },
          { name: "Escalation Specialist", role: "Handles complex exceptions", responsibilities: "moves challenging inquiries immediately to owner dashboard" }
        ],
        apps: connectedApps.length > 0 ? connectedApps : [],
        files: companyFiles.map((f) => f.name).slice(0, 3),
        approvals: [
          "Ask before sending product refunds",
          "Ask before sending custom price offer replies"
        ],
        tasks: ["Reply to customers", "Escalate complaints", "Draft refund responses", "Update support sheet"]
      };
    } else if (text.includes('finance') || text.includes('bill') || text.includes('report') || text.includes('invoice')) {
      result = {
        name: "Finance Department Team",
        description: "Reconciles balances, tracks customer payout receipts, and compiles compliant business tables.",
        workers: [
          { name: "Ledger Worker", role: "Payout log checker", responsibilities: "scans recent payment receipts for oddities" },
          { name: "Spreadsheet Specialist", role: "Accounting formatter", responsibilities: "enters balanced data lines inside Google Sheets sheets" },
          { name: "Compliance Assistant", role: "Audit evaluator", responsibilities: "validates company guidelines against standard receipts" }
        ],
        apps: connectedApps.length > 0 ? connectedApps : [],
        files: companyFiles.map((f) => f.name).slice(0, 3),
        approvals: [
          "Ask before modifying core accounting files",
          "Ask before posting logs if totals mismatch sheet values"
        ],
        tasks: ["Tally payment receipts", "Verify ledger notes", "Flag spreadsheet exceptions", "Archive audit folders"]
      };
    } else if (text.includes('supplier') || text.includes('inventory') || text.includes('logistics')) {
      result = {
        name: "Supplier Logistics Team",
        description: "Audits supply chain parameters, tracks route backlogs, and writes professional updates to shipping depots.",
        workers: [
          { name: "Logistics Specialist", role: "Transit reviewer", responsibilities: "audits delays and coordinates warehouse cargo files" },
          { name: "Supplier Liaison", role: "Depot communications", responsibilities: "emails suppliers on package arrival updates and backlog items" },
          { name: "Operations Coordinator", role: "Database updates", responsibilities: "logs updated container lists inside company database templates" }
        ],
        apps: connectedApps.length > 0 ? connectedApps : [],
        files: companyFiles.map((f) => f.name).slice(0, 3),
        approvals: [
          "Request approval before labeling supplier dispatch as late",
          "Alert owner on critical freight delay alerts"
        ],
        tasks: ["Query supplier directories", "Draft backlog email replies", "Coordinate delays", "Maintain stock databases"]
      };
    } else if (text.includes('marketing') || text.includes('content') || text.includes('post')) {
      result = {
        name: "Marketing & Brand Team",
        description: "Creates helpful brand promotion copy, outlines monthly calendars, and schedules Slack newsletters.",
        workers: [
          { name: "Brand Copywriter", role: "Copy writing", responsibilities: "composes warm messaging templates for news letters" },
          { name: "Editor Specialist", role: "Guidelines checker", responsibilities: "reviews copy drafts for brand style alignment" },
          { name: "Publisher Specialist", role: "Notification scheduler", responsibilities: "places final briefs and schedules alerts" }
        ],
        apps: connectedApps.length > 0 ? connectedApps : [],
        files: companyFiles.map((f) => f.name).slice(0, 3),
        approvals: [
          "Request authorization before firing public bulletins",
          "Approve custom timeline scheduling dates"
        ],
        tasks: ["Draft email bulletins", "Tally campaign logs", "Format layout assets"]
      };
    } else {
      // Dynamic fallback custom team name
      const cleanName = input.trim().length > 3 ? input.trim() : "Custom Operations";
      const actualName = cleanName.toLowerCase().endsWith('team') ? cleanName : `${cleanName} Team`;
      result = {
        name: actualName,
        description: "AI department trained to handle custom business files, tasks, and communication flows.",
        workers: [
          { name: "Team Lead Assistant", role: "Operations coordinator", responsibilities: "coordinates shared assets and flags notifications" },
          { name: "Data Specialist", role: "File logger assistant", responsibilities: "archives reports, updates sheets, and fills invoices" }
        ],
        apps: connectedApps.length > 0 ? connectedApps : [],
        files: companyFiles.map((f) => f.name).slice(0, 3),
        approvals: ["Get permission before making crucial spreadsheet updates"],
        tasks: ["Evaluate incoming reports", "Draft project logs", "Sync team files"]
      };
    }

    setDraftedTeam(result);
  };

  // voice simulation
  const handleVoiceBuildToggle = () => {
    if (voiceActive) return;
    setVoiceActive(true);
    setVoiceFinished(false);
    
    // Simulate speaking audio stream
    setTimeout(() => {
      setChatInput("Create a supplier team to handle emails and inventory.");
      setVoiceActive(false);
      setVoiceFinished(true);
      computeDraftState("Create a supplier team to handle emails and inventory.");
    }, 3000);
  };

  // Form Team and deploy
  const handleDeployDraftedTeam = () => {
    if (!draftedTeam) return;

    const newTeam: TeamItem = {
      id: `team-manual-${Date.now()}`,
      name: draftedTeam.name,
      description: draftedTeam.description,
      workers: draftedTeam.workers.map((w: any) => ({
        name: w.name,
        role: w.role,
        responsibilities: w.responsibilities
      })),
      apps: draftedTeam.apps,
      files: draftedTeam.files,
      status: 'Working',
      approvalRule: draftedTeam.approvals[0] || 'Human approval required on actions',
      currentWork: `${draftedTeam.name} initiated operations within workspace containers.`,
      tasks: draftedTeam.tasks
    };

    setTeams(prev => [newTeam, ...prev]);
    onAddActivity(`Formed and deployed new AI Team: "${newTeam.name}"`, 'Owner');
    
    // Update live log lists
    setLogsList(prev => [
      { id: `log-${Date.now()}`, text: `${newTeam.name} fully built and started business routines`, time: 'Just now', dept: newTeam.name.split(' ')[0] },
      ...prev
    ]);

    setSuccessMsg(`"${newTeam.name}" formed and deployed successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // reset builder state
    setDraftedTeam(null);
    setChatInput('');
    setVoiceFinished(false);
  };

  // Add existing worker to a team
  const handleAddExistingWorkerToTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingWorkerRole.trim() || !existingWorkerResponsible.trim()) {
      alert("Please fill out Role and Responsibility fields.");
      return;
    }

    setTeams(prev => prev.map(t => {
      if (t.id === selectedTeamIdForWorkers) {
        const updatedWorkers = [
          ...t.workers,
          {
            name: chooseExistingWorker,
            role: existingWorkerRole,
            responsibilities: existingWorkerResponsible
          }
        ];
        
        onAddActivity(`Connected worker "${chooseExistingWorker}" to team "${t.name}" as "${existingWorkerRole}"`, 'Owner');
        
        return {
          ...t,
          workers: updatedWorkers
        };
      }
      return t;
    }));

    setExistingWorkerRole('');
    setExistingWorkerResponsible('');
    setSuccessMsg(`Added worker to designated team!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Create a brand new worker inside the team
  const handleCreateNewWorkerInTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerResponsible.trim()) {
      alert("Please enter Name and Responsibilities.");
      return;
    }

    setTeams(prev => prev.map(t => {
      if (t.id === selectedTeamIdForWorkers) {
        const updatedWorkers = [
          ...t.workers,
          {
            name: newWorkerName,
            role: `${newWorkerRole} Assistant`,
            responsibilities: newWorkerResponsible
          }
        ];

        onAddActivity(`Constructed custom AI Worker "${newWorkerName}" inside "${t.name}"`, 'Owner');

        return {
          ...t,
          workers: updatedWorkers
        };
      }
      return t;
    }));

    setNewWorkerName('');
    setNewWorkerResponsible('');
    setSuccessMsg(`Constructed and joined new AI Worker!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Workflow simulation trigger
  const handleTestWorkflow = (workflowId: string, teamName: string, goal: string) => {
    setTestingWorkflowId(workflowId);
    setWorkflowStatus('step1');

    setTimeout(() => setWorkflowStatus('step2'), 1000);
    setTimeout(() => setWorkflowStatus('step3'), 2000);
    setTimeout(() => setWorkflowStatus('step4'), 3000);
    
    setTimeout(() => {
      setWorkflowStatus('success');
      
      // Post activity logs and updates
      onAddActivity(`Executed test run for ${teamName} pipeline. All steps verified.`, 'System');
      
      setLogsList(prev => [
        { id: `log-${Date.now()}`, text: `${teamName} successfully processed: ${goal}`, time: 'Just now', dept: teamName.split(' ')[0] },
        ...prev
      ]);
      
      setTimeout(() => setWorkflowStatus('idle'), 4000);
    }, 4000);
  };

  // Handle local File upload dropzone
  const handleFileDropUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    const sizeStr = f.size > 1024 * 1024 
      ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (f.size / 1024).toFixed(1) + ' KB';

    const newF: MockFile = {
      name: f.name,
      size: sizeStr,
      type: f.name.split('.').pop()?.toUpperCase() || 'PDF',
      uploadedAt: 'Just now'
    };

    setLocalFiles(prev => [newF, ...prev]);
    setFileDropText(`Uploaded: ${f.name}`);
    
    setUploadFeedback(`Parsed and localized guidelines from "${f.name}" safely!`);
    setTimeout(() => setUploadFeedback(''), 4000);
  };

  // Active Team state controls
  const handleApproveAction = (teamId: string, teamName: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        onAddActivity(`Approved active operations for ${teamName}. Work started.`, 'Owner');
        return {
          ...t,
          status: 'Working',
          currentWork: `${teamName} completed human consent checkpoint and resumed automated dispatches.`
        };
      }
      return t;
    }));
  };

  const handlePauseRestoreTeam = (teamId: string, currentStatus: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const nextStatus = currentStatus === 'Working' ? 'Waiting' : 'Working';
        onAddActivity(`Switched execution status of ${t.name} to "${nextStatus}"`, 'Owner');
        return {
          ...t,
          status: nextStatus,
          currentWork: nextStatus === 'Waiting' 
            ? 'Department standing by. Background loops paused.' 
            : `${t.name} resumed background operational procedures.`
        };
      }
      return t;
    }));
  };

  const handleDeleteTeam = (teamId: string, name: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    onAddActivity(`Decommissioned and deleted AI team "${name}"`, 'Owner');
  };

  // Select team helper for workflows
  const activeWorkflowTeam = teams.find(t => t.id === selectedTeamIdForWorkflows) ?? teams[0];

  return (
    <div className="space-y-24 py-4" id="ai-departments-main-module">
      
      {/* PAGE HEADER */}
      <section className="space-y-6 max-w-4xl" id="teams-page-hero">
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold">
            Octo Department Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-950 font-sans">
            Your AI teams.
          </h1>
        </div>
        
        <p className="text-base text-stone-500 font-light leading-relaxed max-w-2xl">
          Build groups of AI workers that work together like departments inside your business. Connect workers, assign responsibilities, and link files to keep workflows entirely secure.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="#chat-team-builder-section"
            className="bg-stone-950 hover:bg-stone-805 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Build Team
          </a>
          <button
            onClick={() => onSetActiveTab('builder')}
            className="bg-[#FCFCFA] border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-900 font-semibold text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer"
          >
            Open Builder
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-stone-400 select-none pt-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" /> Private by default
          </span>
          <span>•</span>
          <span>Connected securely</span>
          <span>•</span>
          <span>Manual publishing only</span>
        </div>
      </section>

      {/* FEEDBACK BANNER */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-stone-950 text-white rounded-xl border border-stone-800 text-xs font-bold text-center fixed top-28 right-8 z-50 shadow-md flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* SECTION 1 — TEAM BUILDER CHAT */}
      <section className="space-y-8 scroll-mt-24" id="chat-team-builder-section">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">1. Team Builder Chat</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
            Draft a completely custom AI department. Explain who you want or select a quick-click preset strategy below.
          </p>
        </div>

        <div className="border border-stone-200 bg-white p-8 rounded-3xl space-y-8">
          
          {/* Quick Preset Buttons */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-450 font-mono">
              Select a Preset Strategy to Draft Immediately
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                {
                  label: "Build me a customer support team.",
                  desc: "Assigns 3 workers for responses, checkout verification, and support queues."
                },
                {
                  label: "Create a finance team for reports and invoices.",
                  desc: "Builds a dedicated billing division linking payment logs and ledgers."
                },
                {
                  label: "Build a supplier team to handle emails and inventory.",
                  desc: "Assembles logistics workers tracking transit delays and emails."
                },
                {
                  label: "Create a marketing team for content and posts.",
                  desc: "Unites copywriters and checkers scheduling news drafts."
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChatPresetClick(preset.label)}
                  className={`p-4 text-left border rounded-xl transition-all cursor-pointer select-none flex flex-col gap-1 items-start ${
                    chatInput === preset.label 
                      ? 'bg-stone-950 border-stone-950 text-white' 
                      : 'bg-stone-50/70 border-stone-150 hover:border-stone-300 text-stone-802'
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{preset.label}</span>
                  <span className={`text-[10px] leading-tight ${chatInput === preset.label ? 'text-stone-300' : 'text-stone-450'}`}>
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Form */}
          <form onSubmit={handleManualSearchSubmit} className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask specifically: e.g. Create a customer support team to reply to refunds..."
                  className="w-full text-sm bg-stone-50 border border-stone-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-sans"
                />
                
                {chatInput && (
                  <button 
                    type="button" 
                    onClick={() => { setChatInput(''); setDraftedTeam(null); setVoiceFinished(false); }}
                    className="absolute right-4 top-4 hover:text-stone-950 text-stone-400 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* VOICE MIC SIMULATION */}
              <button
                type="button"
                onClick={handleVoiceBuildToggle}
                className={`px-5 py-3.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-xs font-semibold ${
                  voiceActive 
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                    : voiceFinished
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-[#FCFCFA] border-stone-200 hover:border-stone-455 text-stone-802'
                }`}
                title="Speak to build"
              >
                <Mic className={`w-4 h-4 ${voiceActive ? 'animate-bounce text-red-600' : ''}`} />
                <span>{voiceActive ? 'Listening...' : voiceFinished ? 'Spoken' : 'Voice'}</span>
              </button>

              <button
                type="submit"
                className="bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Live Audio wave feedback overlay during speaking */}
            {voiceActive && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center gap-3 text-xs text-stone-500 font-mono"
              >
                <div className="flex gap-0.5 items-center justify-center py-1">
                  <span className="w-0.5 h-3 bg-red-600 rounded animate-bounce [animation-delay:0.1s]" />
                  <span className="w-0.5 h-5 bg-red-600 rounded animate-bounce [animation-delay:0.2s]" />
                  <span className="w-0.5 h-4 bg-red-600 rounded animate-bounce [animation-delay:0.3s]" />
                  <span className="w-0.5 h-2 bg-red-600 rounded animate-bounce [animation-delay:0.15s]" />
                  <span className="w-0.5 h-6 bg-red-600 rounded animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Listening to criteria... "Create a supplier team to handle emails and inventory..."</span>
              </motion.div>
            )}
          </form>

        </div>
      </section>

      {/* SECTION 2 — LIVE TEAM PLAN */}
      <AnimatePresence mode="wait">
        {draftedTeam && (
          <motion.section 
            key="drafted-plan"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 scroll-mt-24"
            id="live-team-proposal-display"
          >
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[10px] font-mono tracking-widest text-[#9D8055] font-bold block uppercase">Drafting Sandbox Proposal</span>
              <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">2. Live Team Plan</h2>
              <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
                Review how Octo will assemble your new AI department inside secure containers.
              </p>
            </div>

            <div className="border border-stone-300 bg-[#FCFCFA] p-8 md:p-10 rounded-3xl space-y-8 shadow-sm">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase font-bold tracking-wider">PROPOSED DEPARTMENT NAME</span>
                <h3 className="text-2xl font-bold text-stone-950 tracking-tight">{draftedTeam.name}</h3>
                <p className="text-sm text-stone-500 font-sans leading-relaxed">{draftedTeam.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
                {/* Proposed Workers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-stone-600 focus:outline-none" />
                    <span className="text-xs font-bold font-mono tracking-wider text-stone-600 uppercase">AI Workers Assigned</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {draftedTeam.workers.map((worker: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-stone-950">{worker.name}</span>
                          <span className="text-[10px] font-mono text-[#9D8055] bg-stone-100/50 px-2.5 py-0.5 rounded-full font-medium">
                            Role: {worker.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-normal">
                          Responsible for: {worker.responsibilities}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed connections policies and checklists */}
                <div className="space-y-6">
                  {/* Connected Portals */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">Connected Apps For Team Use</span>
                    <div className="flex flex-wrap gap-1.5">
                      {draftedTeam.apps.map((app: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-704">
                          {app} Connection
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Proposed Files */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">Shared Policy & Guidelines Files</span>
                    <div className="space-y-1.5">
                      {draftedTeam.files.map((file: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-605">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-mono">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approval Rules */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">Required Security Approval Barriers</span>
                    <div className="space-y-1 rounded-xl bg-white p-3 border border-stone-150">
                      {draftedTeam.approvals.map((appr: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0" />
                          <span>{appr}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Tasks */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">Initial Focus Tasks</span>
                    <div className="flex flex-wrap gap-1.5">
                      {draftedTeam.tasks.map((task: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded text-[11px] font-sans">
                          ✓ {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION CALL */}
              <div className="pt-6 border-t border-stone-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-900 leading-snug">Private Isolated Instance Guarantee</p>
                  <p className="text-[11px] text-stone-450 leading-relaxed font-sans">
                    Deployment maps these AI Workers exclusively within secure private containers.
                  </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setDraftedTeam(null)}
                    className="flex-1 md:flex-none border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 text-xs font-semibold px-5 py-3.5 rounded-xl cursor-pointer"
                  >
                    Reject Proposal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeployDraftedTeam}
                    className="flex-1 md:flex-none bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs px-8 py-3.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>✨ Form this AI Department</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 3 — CONNECT AI WORKERS */}
      <section className="space-y-8" id="connect-ai-workers-section">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">3. Connect AI Workers</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
            Add existing specialists to active departments, or construct completely new specialized workers inside folders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Target Selection panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 border border-stone-200 bg-white rounded-2xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-705 font-mono">
                Select Department To Configure
              </label>
              <p className="text-[11px] text-stone-450 leading-relaxed">
                Choose the business division you want to wire AI Workers to:
              </p>

              <div className="space-y-2">
                {teams.map((item) => {
                  const active = selectedTeamIdForWorkers === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTeamIdForWorkers(item.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        active 
                          ? 'bg-stone-950 border-stone-950 text-white font-bold' 
                          : 'bg-stone-50 border-stone-150 text-stone-704 hover:border-stone-300'
                      }`}
                    >
                      <div className="truncate">
                        <span>{item.name}</span>
                        <span className={`text-[9px] block ${active ? 'text-stone-300' : 'text-stone-450'}`}>
                          {item.workers.length} specialists active
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action panels */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Form A: Link Existing Worker */}
            <div className="p-6 md:p-8 border border-stone-200 bg-white rounded-2xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-950">Link Existing AI Worker</h4>
                <p className="text-[11px] text-stone-450 leading-tight">Add an idle constructed worker into the selected department checklist.</p>
              </div>

              <form onSubmit={handleAddExistingWorkerToTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    Select Constructed Worker
                  </label>
                  <select
                    value={chooseExistingWorker}
                    onChange={(e) => setChooseExistingWorker(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none"
                  >
                    {workersList && workersList.length > 0 ? (
                      workersList.map((w) => (
                        <option key={w.id} value={w.name}>{w.name} ({w.role})</option>
                      ))
                    ) : (
                      <option value="">No workers available</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    Specific Role inside Team
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refund processor, Logistics Manager"
                    value={existingWorkerRole}
                    onChange={(e) => setExistingWorkerRole(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none text-stone-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    Responsibility description
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="What specific tasks are they responsible for?"
                    value={existingWorkerResponsible}
                    onChange={(e) => setExistingWorkerResponsible(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none text-stone-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-center bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-3 rounded-lg cursor-pointer transition-all active:scale-97"
                >
                  Wire Worker Connect
                </button>
              </form>
            </div>

            {/* Form B: Create New Worker Inside Team */}
            <div className="p-6 md:p-8 border border-stone-200 bg-white rounded-2xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">Create New Worker inside Team</h4>
                <p className="text-[11px] text-stone-450 leading-tight font-sans">Build and deploy a brand new AI Worker directly into this department context.</p>
              </div>

              <form onSubmit={handleCreateNewWorkerInTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    New AI Worker Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audit Assist, Cargo Runner"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none text-stone-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    Business Role Category
                  </label>
                  <select
                    value={newWorkerRole}
                    onChange={(e) => setNewWorkerRole(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none"
                  >
                    <option value="Support">Support Specialist</option>
                    <option value="Finance">Finance Assistant</option>
                    <option value="Marketing">Marketing Coordinator</option>
                    <option value="Operations">Operations Manager</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-450">
                    Responsibilities
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Reply to common cargo backlog inquiry emails autonomously"
                    value={newWorkerResponsible}
                    onChange={(e) => setNewWorkerResponsible(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none text-stone-901 resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-center bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-3 rounded-lg cursor-pointer transition-all active:scale-97"
                >
                  Create & Join Team
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 — TEAM WORKFLOWS */}
      <section className="space-y-8" id="team-workflows-section">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">4. Team Workflows</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
            Review simple multi-step workflows. Business events automatically move tasks across AI specialists step-by-step.
          </p>
        </div>

        <div className="border border-stone-200 bg-white p-8 md:p-10 rounded-3xl space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-stone-900 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-stone-400 uppercase font-mono block">RUNNING INTEGRATED TRIGGERS</span>
                <span className="text-sm font-bold text-stone-950">
                  Active Workflows{activeWorkflowTeam ? ` for ${activeWorkflowTeam.name}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-450">Select team:</span>
              <select
                value={selectedTeamIdForWorkflows}
                onChange={(e) => {
                  setSelectedTeamIdForWorkflows(e.target.value);
                  setWorkflowStatus('idle');
                }}
                className="text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg font-semibold focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Workflow Step Diagrams */}
          <div className="space-y-8">
            {teamWorkflows.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <p className="text-sm font-bold text-stone-950">No workflows yet.</p>
                <p className="text-xs text-stone-500 mt-1">Create your first workflow to see execution steps here.</p>
              </div>
            ) : (
            <div className="block space-y-6">
              {teamWorkflows.map((flow, num) => {
                const isActiveTesting = testingWorkflowId === flow.id;
                return (
                  <div key={flow.id} className="p-6 border border-stone-250 bg-[#FCFCFA] rounded-2xl space-y-4 transition-all hover:border-stone-400">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                          {num + 1}
                        </span>
                        <div className="text-left leading-none">
                          <span className="text-[10.5px] font-mono text-stone-450 uppercase block font-bold">Workflow Trigger: "{flow.trigger}"</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTestWorkflow(flow.id, activeWorkflowTeam?.name ?? 'Team', flow.goal)}
                        disabled={workflowStatus !== 'idle' || !activeWorkflowTeam}
                        className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer select-none border transition-all ${
                          isActiveTesting
                            ? 'bg-[#FCFAF2] border-amber-300 text-amber-800'
                            : 'bg-stone-950 text-white border-stone-950 hover:bg-stone-850'
                        }`}
                      >
                        {isActiveTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Executing Step Checklist...</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Test Execution Flow</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step layout dots progress wrapper */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                      {flow.steps.map((st, sIdx) => {
                        let stepActive = false;
                        let stepDone = false;

                        if (isActiveTesting) {
                          if (workflowStatus === 'step1' && sIdx === 0) stepActive = true;
                          if (workflowStatus === 'step2') {
                            if (sIdx < 1) stepDone = true;
                            if (sIdx === 1) stepActive = true;
                          }
                          if (workflowStatus === 'step3') {
                            if (sIdx < 2) stepDone = true;
                            if (sIdx === 2) stepActive = true;
                          }
                          if (workflowStatus === 'step4') {
                            if (sIdx < 3) stepDone = true;
                            if (sIdx === 3) stepActive = true;
                          }
                          if (workflowStatus === 'success') stepDone = true;
                        }

                        return (
                          <div 
                            key={sIdx} 
                            className={`p-3.5 rounded-xl border transition-all ${
                              stepActive 
                                ? 'bg-[#FCFAF2] border-amber-400 ring-2 ring-amber-100' 
                                : stepDone 
                                ? 'bg-emerald-50 border-emerald-250' 
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9.5px] uppercase font-mono tracking-wider text-stone-400 font-bold">
                                Step {sIdx + 1}: {st.label}
                              </span>
                              
                              {stepDone ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : stepActive ? (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mt-1 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1 shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-[11.5px] font-semibold text-stone-900 leading-tight">
                              {st.detail}
                            </p>
                            <p className="text-[9.5px] font-mono text-stone-450 mt-1 text-right">
                              ↳ {st.worker}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step Complete animation log */}
                    {isActiveTesting && workflowStatus === 'success' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>All steps executed successfully for "{flow.goal}"! Log created.</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>

        </div>
      </section>

      {/* SECTION 5 — SHARED APPS */}
      <section className="space-y-8" id="shared-apps-directory">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">5. Shared Apps</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans text-stone-500">
            Teams use connected apps to do real work inside of isolations.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {connectedApps.length === 0 ? (
            <div className="col-span-full border border-stone-200 p-8 rounded-2xl text-center bg-white">
              <p className="text-sm font-bold text-stone-950">No connected apps yet.</p>
              <p className="text-xs text-stone-400 mt-1">Connect integrations in Settings.</p>
            </div>
          ) : (
          connectedApps.map((appName) => (
            <div 
              key={appName} 
              className="p-4 bg-white border border-stone-200 rounded-xl space-y-3.5 text-center flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="mx-auto w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-704">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-stone-950 block">{appName}</span>
                <span className="text-[10px] text-stone-450 leading-tight block truncate">
                  Connected integration
                </span>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">
                  Connected
                </span>
              </div>
            </div>
          ))
          )}
        </div>
      </section>

      {/* SECTION 6 — SHARED FILES */}
      <section className="space-y-8" id="shared-company-files-policy">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">6. Shared Files</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
            Reference lists, operational folders, and company SOPs embedded securely for AI worker analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* File Upload zone */}
          <div className="lg:col-span-5 border border-stone-200 bg-white p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block">DEPOSIT COMPLIANCE SOURCE FILINGS</span>
              <h4 className="text-sm font-bold text-stone-950">Add Guidelines & Policy SOPs</h4>
              <p className="text-xs text-stone-500 leading-normal font-sans">
                Upload PDFs, spreadsheets, documents, datasets, Sops, pricing sheets, or inventory listings safely. AI workers use files as context limits.
              </p>
            </div>

            {/* Draggables Input Zone */}
            <div className="border border-dashed border-stone-250 hover:border-stone-950 transition-all p-7 rounded-xl text-center relative cursor-className select-none flex flex-col items-center justify-center gap-2">
              <input
                type="file"
                onChange={handleFileDropUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".pdf,.xlsx,.csv,.docx,.txt"
              />
              <Upload className="w-5 h-5 text-stone-400 shrink-0" />
              <span className="text-xs font-bold text-stone-900">{fileDropText}</span>
              <span className="text-[10px] text-stone-400">Click or drag files up to 64MB securely</span>
            </div>

            {uploadFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-[11px] font-bold text-center">
                {uploadFeedback}
              </div>
            )}

            <div className="flex items-center gap-2 text-[10.5px] font-mono text-stone-450 select-none pb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Everything stays private by default.</span>
            </div>
          </div>

          {/* Directory Files List */}
          <div className="lg:col-span-7 border border-stone-200 bg-white p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-stone-955 tracking-tight font-sans">Department File Cabinet</span>
                <span className="text-[10.5px] text-stone-400 font-mono font-bold">{localFiles.length} files localized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2">
                {localFiles.map((file, idx) => (
                  <div key={idx} className="p-3.5 border border-stone-150 rounded-xl bg-[#FCFCFA] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-stone-205 flex items-center justify-center text-stone-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="text-xs font-bold text-stone-950 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          {file.size} • {file.type}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setLocalFiles(prev => prev.filter(f => f.name !== file.name))}
                      className="text-stone-300 hover:text-red-600 transition-colors cursor-pointer"
                      title="De-link file context safely"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center text-xs font-mono text-stone-400 flex items-center justify-center gap-2">
              <span>All uploads stay secure inside container boundaries. No outer logs leaking paths.</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — ACTIVE TEAMS */}
      <section className="space-y-8" id="active-teams-section">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">7. Active AI Departments</h2>
          <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
            Your existing AI Teams autonomously completing continuous procedural business tasks securely.
          </p>
        </div>

        <div className="space-y-8">
          {teams.length === 0 ? (
            <div className="p-12 border border-stone-200 bg-white text-center rounded-2xl font-sans">
              <p className="text-sm font-bold text-stone-950">No teams yet.</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">Create your first team using the builder above.</p>
            </div>
          ) : (
            teams.map((team) => {
              const hasApprovalGate = team.status === 'Needs Approval';
              return (
                <div 
                  key={team.id}
                  className="p-8 md:p-10 border border-stone-250 bg-white rounded-2xl flex flex-col lg:flex-row lg:items-start justify-between gap-8 transition-all hover:border-stone-400"
                >
                  {/* Left core credentials */}
                  <div className="space-y-6 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-stone-950 tracking-tight font-sans">{team.name}</h3>
                      
                      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-50 border border-stone-200 rounded-lg select-none text-[9.5px] font-mono text-stone-500 font-bold">
                        <span>RULES: {team.approvalRule}</span>
                      </div>

                      {/* STATUS CHIP */}
                      <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider select-none ${
                        team.status === 'Working' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' :
                        team.status === 'Needs Approval' ? 'bg-[#FCFAF2] text-amber-802 border border-amber-300 animate-pulse' :
                        team.status === 'Finished' ? 'bg-stone-50 text-stone-500 border border-stone-200' :
                        'bg-stone-50 text-stone-403 border border-stone-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          team.status === 'Working' ? 'bg-emerald-500' :
                          team.status === 'Needs Approval' ? 'bg-amber-500' :
                          'bg-stone-400'
                        }`} />
                        <span>{team.status === 'Working' ? 'Running' : team.status === 'Needs Approval' ? 'Pending Approval' : team.status}</span>
                      </div>
                    </div>

                    <p className="text-sm text-stone-500 font-sans leading-relaxed max-w-2xl">{team.description}</p>

                    {/* Assigned Cooperating AI Specialists and roles */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400">Cooperating Specialists & Roles</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {team.workers.map((w, idx) => (
                          <div key={idx} className="p-3 bg-stone-50/60 border border-stone-200/70 rounded-xl leading-tight">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shrink-0" />
                              <span className="text-xs font-bold text-stone-950">{w.name}</span>
                            </div>
                            <p className="text-[10px] text-stone-450 mt-1 font-mono font-semibold">Role: {w.role}</p>
                            <p className="text-[10px] text-stone-500 leading-snug mt-1 italic font-sans">
                              "{w.responsibilities}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTIVE WORK STREAM */}
                    <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span>Current Task & Work Happening</span>
                      </div>
                      <p className="text-xs text-stone-605 font-sans leading-normal">
                        "{team.currentWork}"
                      </p>
                    </div>

                    {/* App connections & shared folders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-stone-405 font-bold">Connected Portals</span>
                        <div className="flex flex-wrap gap-2">
                          {team.apps.map(app => (
                            <span key={app} className="text-[11px] font-mono text-stone-600 bg-stone-100/60 px-2.5 py-1 rounded">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-stone-405 font-bold">Guidelines SOPs Context</span>
                        <div className="flex flex-wrap gap-2">
                          {team.files.map(f => (
                            <div key={f} className="flex items-center gap-1.5 bg-stone-100/50 border border-stone-150 rounded px-2.5 py-0.5 text-[10.5px] font-mono text-stone-800">
                              <FileText className="w-3 h-3 text-stone-400" />
                              <span className="truncate max-w-[140px]">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTROLS COLUMN */}
                  <div className="flex flex-col gap-2 shrink-0 lg:w-48 xl:w-52">
                    {hasApprovalGate ? (
                      <div className="p-4 bg-[#FCFAF2] border border-amber-250 rounded-xl space-y-3.5">
                        <p className="text-[10.5px] text-amber-800 font-semibold leading-relaxed flex items-start gap-1.5 font-sans">
                          <ShieldAlert className="w-4 h-4 shrink-0 -mt-0.5 text-amber-600" />
                          <span>Needs human approval to execute replying steps.</span>
                        </p>
                        <button
                          onClick={() => handleApproveAction(team.id, team.name)}
                          className="w-full text-center bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-all cursor-pointer active:scale-[0.97]"
                        >
                          Approve Team Flow
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePauseRestoreTeam(team.id, team.status)}
                          className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer select-none ${
                            team.status === 'Working' 
                              ? 'bg-stone-50 border-stone-205 text-stone-800 hover:bg-stone-100' 
                              : 'bg-stone-950 border-stone-950 text-white hover:bg-stone-850'
                          }`}
                        >
                          {team.status === 'Working' ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-stone-500" /> Paused Loops
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Resume Loops
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="w-full text-center bg-white border border-stone-150 hover:bg-[#FCF5F5] hover:text-red-700 hover:border-red-200 transition-colors text-[11px] font-semibold text-stone-400 py-2 rounded-xl cursor-pointer"
                        >
                          Decommission Team
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECTION 8 — TEAM ACTIVITY */}
      <section className="space-y-8" id="team-activity-section">
        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-stone-950 tracking-tight font-sans">8. Live Team Activity</h2>
            <p className="text-xs text-stone-450 mt-1 leading-normal font-sans">
              Real-time audit records showing work happening across localized sandbox departments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const items = [
                { id: `log-${Date.now()}`, text: 'Support Team drafted 3 auto-responses to shipping delay emails', dept: 'Customer Support' },
                { id: `log-${Date.now() + 1}`, text: 'Finance Team balanced ledger entries with row checkpoints', dept: 'Finance' },
                { id: `log-${Date.now() + 2}`, text: 'Supplier Team initialized transit queue polling', dept: 'Supplier' },
                { id: `log-${Date.now() + 3}`, text: 'Marketing Team finalized newsletter brief layout drafts', dept: 'Marketing' },
                { id: `log-${Date.now() + 4}`, text: 'Operations Team matched order inventory volumes', dept: 'Operations' }
              ];
              const rand = items[Math.floor(Math.random() * items.length)];
              setLogsList(prev => [
                { id: rand.id, text: rand.text, time: 'Just now', dept: rand.dept },
                ...prev
              ]);
              onAddActivity(`Simulated task: ${rand.text}`, rand.dept);
            }}
            className="text-[10px] font-mono bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 border border-stone-200 px-3.5 py-1.5 rounded-lg font-bold transition-all"
          >
            + Simulate Work Happening
          </button>
        </div>

        <div className="border border-stone-200 rounded-3xl bg-white p-6 md:p-8 space-y-4 max-h-[340px] overflow-y-auto pr-3">
          <div className="space-y-4">
            {logsList.map((log) => (
              <div key={log.id} className="flex items-start gap-4 text-xs border-b border-stone-50 pb-3 last:border-0 last:pb-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.dept.includes('Support') ? 'bg-sky-500' :
                  log.dept.includes('Finance') ? 'bg-emerald-550 bg-emerald-500' :
                  log.dept.includes('Supplier') ? 'bg-amber-500' :
                  log.dept.includes('Marketing') ? 'bg-fuchsia-500' :
                  'bg-stone-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-bold text-stone-950 truncate max-w-[500px]">
                      {log.text}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono font-medium tracking-wide uppercase mt-0.5">
                    ↳ Department: {log.dept}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-100 pt-10 pb-4 text-center space-y-2">
        <p className="text-[10.5px] font-mono text-stone-400 select-none">
          Everything is private by default. Nothing is public. Depleted actions require absolute consent limits.
        </p>
        <p className="text-[10px] font-mono text-stone-300 select-none uppercase tracking-widest">
          Octo Workspaces • Enterprise Safe Sandbox
        </p>
      </footer>

    </div>
  );
}
