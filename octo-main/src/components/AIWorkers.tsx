"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, FileText, Lock, ArrowRight, RefreshCw, Users, ShieldCheck, Mail, Database, Check, Upload,
  Briefcase, Activity, Plus, Play, Pause, AlertCircle, X, ChevronDown, CheckCircle2, Eye, EyeOff
} from 'lucide-react';

interface AIWorkerItem {
  id: string;
  name: string;
  role: string;
  model: string;
  apiKeySet: boolean;
  instructions: string;
  skills: string[];
  connectedApps: string[];
  filesInUse: string[];
  permissions: string[];
  status: 'Working' | 'Waiting' | 'Finished' | 'Needs Approval';
  currentTask: string;
  approvalsNeeded?: string;
  avatarColor: string;
}

interface AIWorkersProps {
  onSetActiveTab: (tab: 'dashboard' | 'builder' | 'workers' | 'workflows' | 'teams' | 'files' | 'marketplace' | 'billing' | 'settings') => void;
  workersList: any[];
  onAddWorkers: (newWorkers: any[]) => void;
  onAddActivity: (activityText: string, workerName: string) => void;
  connectedApps?: string[];
  companyFiles?: any[];
  onAddFile?: (newFile: any) => void;
}

export default function AIWorkers({ 
  onSetActiveTab, 
  workersList, 
  onAddWorkers, 
  onAddActivity,
  connectedApps = ['Gmail', 'Slack', 'Shopify', 'Stripe', 'Notion'],
  companyFiles = [],
  onAddFile
}: AIWorkersProps) {
  
  const fileInputRefLocally = useRef<HTMLInputElement>(null);
  const workerFormFileInputRef = useRef<HTMLInputElement>(null);
  const skillFileInputRef = useRef<HTMLInputElement>(null);

  // Core realistic active employees state using HUMAN wording (no tech jargon)
  const [localWorkers, setLocalWorkers] = useState<AIWorkerItem[]>([
    {
      id: 'worker-act-1',
      name: 'Clara',
      role: 'Support Worker',
      model: 'Gemini',
      apiKeySet: true,
      instructions: 'You help reply to order inquiries, sizes, and refunds.',
      skills: ['customer support'],
      connectedApps: ['Gmail', 'Shopify'],
      filesInUse: ['size_guidelines.pdf', 'refund_policy_manual.docx'],
      permissions: ['Can send emails', 'Needs approval before posting'],
      status: 'Working',
      currentTask: 'Replying to customer emails regarding order sizes and fabric materials.',
      avatarColor: 'bg-stone-100 text-stone-905 border-stone-200'
    },
    {
      id: 'worker-act-2',
      name: 'Valkyrie',
      role: 'Finance Worker',
      model: 'GPT-4o',
      apiKeySet: true,
      instructions: 'Review monthly balance sheets and audit stripe transaction lists.',
      skills: ['finance'],
      connectedApps: ['Stripe', 'Notion'],
      filesInUse: ['balance_sheet_q1.xlsx'],
      permissions: ['Can edit spreadsheets'],
      status: 'Finished',
      currentTask: 'Generating weekly transaction ledger reconciliation Excel reports.',
      avatarColor: 'bg-stone-50 text-stone-705 border-stone-200/50'
    },
    {
      id: 'worker-act-3',
      name: 'Atlas',
      role: 'Supplier Worker',
      model: 'Claude',
      apiKeySet: true,
      instructions: 'Track logistic counts and draft fabric alert notifications for delayed shipments.',
      skills: ['supplier handling'],
      connectedApps: ['Slack', 'Gmail'],
      filesInUse: ['supplier_manifest.csv'],
      permissions: ['Needs approval before posting'],
      status: 'Needs Approval',
      currentTask: 'Updating inventory listings and awaiting confirmation to draft delay warnings.',
      approvalsNeeded: 'Confirming delay warning letter to Garment Factory #4',
      avatarColor: 'bg-stone-100 text-stone-950 border-stone-250'
    },
    {
      id: 'worker-act-4',
      name: 'Elena',
      role: 'Marketing Worker',
      model: 'Gemini',
      apiKeySet: true,
      instructions: 'Draft brand campaign newsletters and update content calendar in Notion files.',
      skills: ['marketing'],
      connectedApps: ['Notion', 'Gmail'],
      filesInUse: ['brand_voice_dictionary.docx'],
      permissions: ['Read-only access'],
      status: 'Finished',
      currentTask: 'Drafting three custom promotional product campaign briefs.',
      avatarColor: 'bg-stone-50 text-stone-605 border-stone-150'
    },
    {
      id: 'worker-act-5',
      name: 'Vega',
      role: 'Research Worker',
      model: 'Claude',
      apiKeySet: true,
      instructions: 'Research trends on competitor sizing, fabric materials, and pricing standards.',
      skills: ['research'],
      connectedApps: ['Google Drive', 'Notion'],
      filesInUse: ['target_demographics.pdf'],
      permissions: ['Read-only access'],
      status: 'Waiting',
      currentTask: 'Standing by. Awaiting new information parameters to study.',
      avatarColor: 'bg-stone-100 text-stone-800 border-stone-200'
    }
  ]);

  // Live work log items - alive, human, real business activities
  const [liveActivityLogs, setLiveActivityLogs] = useState([
    { id: 'log-1', worker: 'Clara', type: 'Customer replies sent', text: 'Sent sizing response regarding active fashion SKU #3820', time: '2 mins ago' },
    { id: 'log-2', worker: 'Valkyrie', type: 'Weekly report completed', text: 'Reconciled 142 outstanding Stripe balance sheets successfully', time: '14 mins ago' },
    { id: 'log-3', worker: 'Atlas', type: 'Supplier message drafted', text: 'Drafted shipping follow-up regarding fabric shipment delay', time: '55 mins ago' },
    { id: 'log-4', worker: 'Elena', type: 'Marketing posts scheduled', text: 'Scheduled automated product announcement newsletter copy', time: '2 hours ago' },
    { id: 'log-5', worker: 'Vega', type: 'Inventory sheet updated', text: 'Updated current Shopify catalog lists across localized Excel tables', time: '4 hours ago' }
  ]);

  // Form State for Adding New Worker
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Support Worker');
  const [formModel, setFormModel] = useState('Gemini');
  const [formApiKey, setFormApiKey] = useState('');
  const [formShowApiKey, setFormShowApiKey] = useState(false);
  const [formInstructions, setFormInstructions] = useState('');
  
  // Skill file upload state & handlers
  const [uploadedSkillFiles, setUploadedSkillFiles] = useState<{name: string, size: string}[]>([
    { name: 'customer_support_spec.json', size: '12 KB' }
  ]);

  const handleSkillFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';
    
    const newFileObj = { name: file.name, size: sizeStr };
    setUploadedSkillFiles(prev => [...prev, newFileObj]);
    
    const skillName = file.name.replace(/\.[^/.]+$/, '').replace(/_|-/g, ' ');
    setSelectedSkills(prev => {
      if (!prev.includes(skillName)) {
        return [...prev, skillName];
      }
      return prev;
    });

    onAddActivity(`Uploaded custom skill specification document "${file.name}".`, 'System');
  };

  const handleRemoveSkillFile = (idx: number) => {
    const removedFile = uploadedSkillFiles[idx];
    setUploadedSkillFiles(prev => prev.filter((_, i) => i !== idx));
    if (removedFile) {
      const skillName = removedFile.name.replace(/\.[^/.]+$/, '').replace(/_|-/g, ' ');
      setSelectedSkills(prev => prev.filter(s => s !== skillName));
    }
  };

  // Custom connected app input state
  const [customAppInput, setCustomAppInput] = useState('');

  // Multi-select lists
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['customer support spec']);
  const [selectedApps, setSelectedApps] = useState<string[]>(['Gmail', 'Shopify']);
  const [uploadedFormFiles, setUploadedFormFiles] = useState<{name: string, size: string}[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['Needs approval before posting']);

  // Creation animation / simulation states
  const [isCreatingWorker, setIsCreatingWorker] = useState(false);
  const [creationMessage, setCreationMessage] = useState('');

  // Dynamic connected apps state - we show extensive list by default, and user can link custom ones too!
  const [allApps, setAllApps] = useState([
    { id: 'Gmail', label: 'Gmail' },
    { id: 'Slack', label: 'Slack' },
    { id: 'Shopify', label: 'Shopify' },
    { id: 'Stripe', label: 'Stripe' },
    { id: 'Notion', label: 'Notion' },
    { id: 'Google Drive', label: 'Google Drive' },
    { id: 'GitHub', label: 'GitHub' },
    { id: 'HubSpot', label: 'HubSpot' },
    { id: 'Zendesk', label: 'Zendesk' },
    { id: 'Airtable', label: 'Airtable' },
    { id: 'Intercom', label: 'Intercom' },
    { id: 'QuickBooks', label: 'QuickBooks' },
    { id: 'Discord', label: 'Discord' },
    { id: 'Salesforce', label: 'Salesforce' },
    { id: 'Typeform', label: 'Typeform' }
  ]);

  const availablePermissions = [
    { id: 'Can send emails', label: 'Can send emails' },
    { id: 'Needs approval before posting', label: 'Needs approval before posting' },
    { id: 'Can edit spreadsheets', label: 'Can edit spreadsheets' },
    { id: 'Read-only access', label: 'Read-only access' }
  ];

  // Global vault files list for Section 6
  const [localDossiers, setLocalDossiers] = useState([
    { name: 'refund_processing_policy_2026.pdf', size: '1.4 MB' },
    { name: 'supplier_contacts_shipping.xlsx', size: '18.2 MB' },
    { name: 'company_branding_guidelines.docx', size: '2.1 MB' }
  ]);

  // Skill presets to auto-fill instructions, name, and role for premium UX
  const applyPreset = (presetType: 'support' | 'finance' | 'marketing') => {
    if (presetType === 'support') {
      setFormName('Customer Success Helpdesk');
      setFormRole('Support Worker');
      setFormInstructions('You are a friendly customer success specialist. Read incoming inbox orders, check sizing guidelines, and prepare courteous drafts to clients.');
      setSelectedSkills(['customer support skill']);
      setUploadedSkillFiles([{ name: 'customer_support_skill.json', size: '8.4 KB' }]);
      setSelectedApps(['Gmail', 'Shopify']);
      setSelectedPermissions(['Needs approval before posting']);
    } else if (presetType === 'finance') {
      setFormName('Ledger Audit Worker');
      setFormRole('Finance Worker');
      setFormInstructions('Review internal reports from Stripe and automate ledger row entries in Notion sheets. Point out any balance gaps or refunds immediately.');
      setSelectedSkills(['finance audit skill']);
      setUploadedSkillFiles([{ name: 'finance_audit_skill.json', size: '12.5 KB' }]);
      setSelectedApps(['Stripe', 'Notion']);
      setSelectedPermissions(['Can edit spreadsheets']);
    } else if (presetType === 'marketing') {
      setFormName('Pulse Content Writer');
      setFormRole('Marketing Worker');
      setFormInstructions('Draft high-quality, elegant brand newsletters based on corporate announcements and post summaries to Slack rooms.');
      setSelectedSkills(['marketing content skill']);
      setUploadedSkillFiles([{ name: 'marketing_content_skill.json', size: '9.2 KB' }]);
      setSelectedApps(['Slack', 'Notion']);
      setSelectedPermissions(['Can send emails']);
    }
  };

  // Toggle multi-select utility
  const handleToggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleToggleApp = (id: string) => {
    setSelectedApps(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleTogglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Handle Form File Uploads
  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    const newFileObj = { name: file.name, size: sizeStr };
    setUploadedFormFiles(prev => [...prev, newFileObj]);
    
    // Also add to global list
    setLocalDossiers(prev => [...prev, newFileObj]);
    if (onAddFile) {
      onAddFile({
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        uploadedAt: 'Just now'
      });
    }
    onAddActivity(`Uploaded reference document "${file.name}" to knowledge files vault.`, 'System');
  };

  // Handle global vault upload inside Section 6
  const handleGlobalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    const newFileObj = { name: file.name, size: sizeStr };
    setLocalDossiers(prev => [...prev, newFileObj]);
    
    if (onAddFile) {
      onAddFile({
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        uploadedAt: 'Just now'
      });
    }
    
    onAddActivity(`Indexed business dossier "${file.name}" for employee parameters.`, 'System');
  };

  // Create Worker Form Submit Handler
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please provide a name for your AI worker.");
      return;
    }

    setIsCreatingWorker(true);
    setCreationMessage("Onboarding new employee...");

    // Smooth sequence of onboarding animations
    setTimeout(() => {
      setCreationMessage("Syncing tools credentials securely...");
      setTimeout(() => {
        setCreationMessage("Testing access permissions...");
        setTimeout(() => {
          // Worker successfully instantiated
          const placeholderTasksByRole: {[key: string]: string} = {
            'Support Worker': 'Awaiting new client emails to draft replies.',
            'Finance Worker': 'Awaiting recent Stripe log feeds to audit.',
            'Marketing Worker': 'Polishing social brief drafts in Notion workspace.',
            'Supplier Worker': 'Analyzing stock inventory thresholds.',
            'Research Worker': 'Standing by for search trends instruction.',
            'Operations Worker': 'Monitoring workflow logs for discrepancies.'
          };

          const matchedTask = placeholderTasksByRole[formRole] || 'Ready and listening for active workspace parameters.';

          const newEmployee: AIWorkerItem = {
            id: `worker-custom-${Date.now()}`,
            name: formName,
            role: formRole,
            model: formModel,
            apiKeySet: formApiKey.length > 0,
            instructions: formInstructions || 'Perform corporate task guidelines with maximum care.',
            skills: selectedSkills,
            connectedApps: selectedApps,
            filesInUse: uploadedFormFiles.map(f => f.name).length > 0 
              ? uploadedFormFiles.map(f => f.name) 
              : ['company_policy_handbook.pdf'],
            permissions: selectedPermissions,
            status: 'Waiting',
            currentTask: matchedTask,
            avatarColor: 'bg-stone-950 text-white font-bold border-stone-900'
          };

          // Append locally
          setLocalWorkers(prev => [newEmployee, ...prev]);

          // Notify dashboard / parent logger
          onAddActivity(`Hired expert AI worker "${newEmployee.name}" (${newEmployee.role}) run by ${newEmployee.model}.`, newEmployee.name);
          
          onAddWorkers([{
            id: newEmployee.id,
            name: newEmployee.name,
            role: newEmployee.role,
            status: 'idle',
            avatarColor: 'bg-stone-100 text-stone-900 border-stone-200',
            connectedApps: newEmployee.connectedApps,
            tasksCount: 0
          }]);

          // Write live logs action
          setLiveActivityLogs(prev => [
            {
              id: `log-new-${Date.now()}`,
              worker: newEmployee.name,
              type: 'Employee Onboarded',
              text: `Onboarded standalone AI employee running ${newEmployee.model} for ${newEmployee.role} duties.`,
              time: 'Just now'
            },
            ...prev
          ]);

          // Clean up forms
          setFormName('');
          setFormInstructions('');
          setFormApiKey('');
          setUploadedFormFiles([]);
          setUploadedSkillFiles([{ name: 'customer_support_spec.json', size: '12 KB' }]);
          setSelectedSkills(['customer support spec']);
          setIsCreatingWorker(false);

          // Scroll to Section 2 (Active Workers) to show the new employee
          const activeSec = document.getElementById('active-employees-section');
          activeSec?.scrollIntoView({ behavior: 'smooth' });

        }, 1100);
      }, 1000);
    }, 800);
  };

  // Local approval handler
  const handleConfirmApprovalLocally = (workerId: string, name: string) => {
    setLocalWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          status: 'Finished',
          currentTask: 'Approved delay warning letters dispatch. Monitoring responses.',
          approvalsNeeded: undefined
        };
      }
      return w;
    }));

    setLiveActivityLogs(prev => [
      {
        id: `log-app-${Date.now()}`,
        worker: name,
        type: 'Approval Dispatch Sent',
        text: 'Human verification completed. Sent verified files dispatch securely.',
        time: 'Just now'
      },
      ...prev
    ]);

    onAddActivity(`Human signature confirmed. Approved action queue for ${name}.`, 'System');
  };

  return (
    <div className="space-y-36 pb-36 px-4 md:px-0" id="ai-workers-page-view">
      
      {/* =========================================================================
                             SECTION 1 — HERO
         ========================================================================= */}
      <section className="text-left pt-6 pb-4" id="workers-hero-panel">
        <div className="max-w-4xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 font-sans leading-none"
          >
            Your AI workers.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-stone-500 font-light max-w-2xl leading-relaxed"
          >
            AI workers helping run your business, handle customers, manage suppliers, create reports, organize tasks, and automate everyday work.
          </motion.p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                const element = document.getElementById('add-new-worker-creation-area');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs px-8 py-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none"
            >
              Add AI Worker
            </button>
            <button
              type="button"
              onClick={() => onSetActiveTab('builder')}
              className="bg-white border border-stone-250 hover:bg-stone-50 font-semibold text-xs px-8 py-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none"
            >
              Open Builder
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-6 text-xs font-mono text-stone-400 select-none">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-300" /> Private by default
            </span>
            <span>•</span>
            <span>Connected to your apps</span>
            <span>•</span>
            <span>Running 24/7</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
                             SECTION 2 — ACTIVE AI WORKERS
         ========================================================================= */}
      <section className="space-y-10" id="active-employees-section">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Active AI Workers ({localWorkers.length})
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Your employees are autonomously handling tasks. View their current objectives and statuses live.
          </p>
        </div>

        {/* Dense visual cards without colorful gradients or useless lines */}
        <div className="space-y-6">
          {localWorkers.map((worker) => (
            <div 
              key={worker.id}
              className="border border-stone-200 rounded-2xl bg-white p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-stone-350"
            >
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-mono text-[10px] font-bold uppercase text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                    {worker.role}
                  </div>
                  <span className="text-stone-300">•</span>
                  <p className="text-xs text-stone-400 font-mono">Assigned name: <span className="font-bold text-stone-600">{worker.name}</span></p>
                  <span className="text-stone-300">•</span>
                  <div className="text-[10px] text-stone-400 font-mono bg-stone-50 border border-stone-100 px-2 py-0.5 rounded font-bold">
                    Powered by {worker.model}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase text-stone-400 tracking-wider font-mono">Current Activity</div>
                  <p className="text-base text-stone-850 leading-relaxed font-sans">
                    “{worker.currentTask}”
                  </p>
                </div>

                {/* File references showing in active loops */}
                {worker.filesInUse.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px] font-mono text-stone-400">
                    <span>Reference knowledge:</span>
                    {worker.filesInUse.map((doc, idx) => (
                      <span key={idx} className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-600 font-bold select-none">
                        {doc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status control column */}
              <div className="lg:text-right space-y-4 shrink-0 lg:min-w-[240px] flex flex-col lg:items-end justify-between">
                
                {/* Custom Employee Status Tags */}
                <div className="flex items-center gap-2 lg:justify-end">
                  <span className={`w-2 h-2 rounded-full ${
                    worker.status === 'Working' ? 'bg-emerald-500 animate-pulse' :
                    worker.status === 'Needs Approval' ? 'bg-amber-500 animate-bounce' :
                    worker.status === 'Finished' ? 'bg-stone-300' :
                    'bg-sky-400 animate-pulse'
                  }`} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                    {worker.status}
                  </span>
                </div>

                {/* Secondary tools display */}
                <div className="flex flex-wrap gap-1.5 lg:justify-end">
                  {worker.connectedApps.length === 0 ? (
                    <span className="text-[10px] font-mono text-stone-400 italic">No apps linked</span>
                  ) : (
                    worker.connectedApps.map((a, i) => (
                      <span key={i} className="text-[10px] font-mono text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded">
                        {a}
                      </span>
                    ))
                  )}
                </div>

                {/* Handlers for Pending Approval task */}
                {worker.status === 'Needs Approval' && worker.approvalsNeeded && (
                  <div className="pt-2 w-full max-w-xs space-y-2">
                    <p className="text-[10px] font-mono text-amber-800 leading-normal bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                      Review required: {worker.approvalsNeeded}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleConfirmApprovalLocally(worker.id, worker.name)}
                      className="w-full bg-stone-90s hover:bg-stone-850 bg-stone-950 text-white font-semibold text-[10px] uppercase py-2.5 rounded-lg tracking-wide transition-all cursor-pointer outline-none"
                    >
                      Authorize Action
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
                             SECTION 3 — LIVE WORK VIEW
         ========================================================================= */}
      <section className="space-y-10" id="live-employees-log-panel">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Live Work View
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Continuous activity feed representing completed customer emails and internal document audits.
          </p>
        </div>

        <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden">
          <div className="divide-y divide-stone-100">
            {liveActivityLogs.map((log) => (
              <div key={log.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-stone-50/20 transition-all">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase select-none">
                      {log.type}
                    </span>
                    <span className="text-stone-300 text-xs font-mono">•</span>
                    <span className="text-xs text-stone-400 font-mono">accomplished by <span className="font-bold text-stone-605">{log.worker}</span></span>
                  </div>
                  <p className="text-sm font-medium text-stone-900 leading-normal font-sans">{log.text}</p>
                </div>
                <div className="font-mono text-xs text-stone-400 shrink-0 select-none">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
                             SECTION 4 — ADD NEW AI WORKER
         ========================================================================= */}
      <section className="space-y-10" id="add-new-worker-creation-area">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Add New AI Worker
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Hire a standalone employee to handle business duties autonomously. Assign explicit instructions and connect credentials safely.
          </p>
        </div>

        {/* Onboarding Wizard Form Card */}
        <div className="border border-stone-200 rounded-2xl bg-white p-8 md:p-12 relative overflow-hidden">
          
          {/* Preset Buttons for Quick Autofill */}
          <div className="mb-8 space-y-3">
            <h4 className="text-xs font-bold text-stone-405 font-mono uppercase tracking-wider">Quick Start Employee Templates</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('support')}
                className="text-xs bg-stone-50 border border-stone-200 hover:border-stone-400 text-stone-700 font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
              >
                ⚡ Support Worker Template
              </button>
              <button
                type="button"
                onClick={() => applyPreset('finance')}
                className="text-xs bg-stone-50 border border-stone-200 hover:border-stone-400 text-stone-700 font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
              >
                ⚡ Finance Worker Template
              </button>
              <button
                type="button"
                onClick={() => applyPreset('marketing')}
                className="text-xs bg-stone-50 border border-stone-200 hover:border-stone-400 text-stone-700 font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
              >
                ⚡ Marketing Worker Template
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateWorker} className="space-y-10">
            
            {/* 1. NAME AND ROLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  1. Worker Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Clara (Support Worker)"
                  className="w-full text-sm bg-[#FCFCFA] border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans text-stone-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  Worker Role Category
                </label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g., Logistic Assistant, Support Lead, Auditor"
                  className="w-full text-sm bg-[#FCFCFA] border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans text-stone-900"
                />
              </div>
            </div>

            {/* 2. CHOOSE MODEL & SECURE KEY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  2. Model to Use
                </label>
                <input
                  type="text"
                  required
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="e.g., Gemini 1.5 Pro, gpt-4o, Claude 3.5 Sonnet"
                  className="w-full text-sm bg-[#FCFCFA] border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans text-stone-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono flex items-center justify-between">
                  <span>3. Add API Key</span>
                  <span className="text-[10px] text-stone-400 font-normal lowercase italic">stored only inside cookies</span>
                </label>
                <div className="relative">
                  <input
                    type={formShowApiKey ? "text" : "password"}
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder={`Insert your ${formModel || "AI 모델"} API key`}
                    className="w-full text-sm bg-[#FCFCFA] border border-stone-200 pl-4 pr-11 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-mono text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowApiKey(!formShowApiKey)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    {formShowApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. INSTRUCTIONS / PROMPT TEXTAREA */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                4. Instructions / Prompt Guidelines
              </label>
              <textarea
                required
                rows={4}
                value={formInstructions}
                onChange={(e) => setFormInstructions(e.target.value)}
                placeholder="Type specific rules here: 'You are a customer support worker helping reply to customers professionally.'"
                className="w-full text-sm bg-[#FCFCFA] border border-stone-200 p-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans text-stone-900 leading-relaxed"
              />
            </div>

            {/* 4. SKILLS MULTI-SELECT & APPS CHECKLIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* SKILLS CHIPS & FILES ATTACHMENT */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono flex items-center justify-between">
                    <span>5. Core Skills (From Spec File)</span>
                    <span className="text-[10px] text-stone-400 lowercase font-normal italic">supports .pdf, .json, .yaml</span>
                  </label>
                  <p className="text-[11px] text-stone-400">Skills are loaded via specification documents specifying APIs or operational protocols:</p>
                </div>
                
                {/* File Upload Trigger Specifically for Skills */}
                <div 
                  onClick={() => skillFileInputRef.current?.click()}
                  className="border border-dashed border-stone-200 hover:border-stone-900 transition-all p-5 rounded-lg text-center cursor-pointer hover:bg-stone-50/50 flex flex-col items-center justify-center gap-1.5 select-none"
                >
                  <input
                    type="file"
                    ref={skillFileInputRef}
                    onChange={handleSkillFileUpload}
                    className="hidden"
                    accept=".pdf,.xlsx,.csv,.docx,.txt,.json,.yaml,.yml"
                  />
                  <Upload className="w-5 h-5 text-stone-500" />
                  <span className="text-xs font-bold text-stone-850">Attach Skill Specification File</span>
                  <span className="text-[10px] text-stone-400">Click to upload or drag manual</span>
                </div>

                {/* Uploaded Skills Specification Files List */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">Loaded Skill Specs</p>
                  <div className="space-y-1.5">
                    {uploadedSkillFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono bg-stone-950 text-white p-3 rounded-xl select-none">
                        <span className="truncate max-w-[200px] font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-stone-300" /> {file.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-300">({file.size})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillFile(i)}
                            className="text-stone-400 hover:text-white transition-colors cursor-pointer text-[11px] font-sans px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {uploadedSkillFiles.length === 0 && (
                      <p className="text-xs text-stone-400 italic">No skill specification files attached yet.</p>
                    )}
                  </div>
                </div>

                {/* Derived skill tags */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">Active Capabilities Linked</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-850 border border-stone-200 flex items-center gap-1 select-none font-sans capitalize font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* APPS CHECKBOX GRID WITH LINKING FACILITY */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono flex justify-between items-center">
                  <span>6. Connect Apps</span>
                  <span className="text-[10px] text-stone-400 lowercase font-normal italic">infinite apps support</span>
                </label>
                <p className="text-[11px] text-stone-400">Link custom app portals or select standard ones here:</p>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customAppInput}
                    onChange={(e) => setCustomAppInput(e.target.value)}
                    placeholder="Link any other app, e.g. Zendesk, Intercom"
                    className="flex-1 text-sm bg-[#FCFCFA] border border-stone-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 font-sans text-stone-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customAppInput.trim()) {
                          const appName = customAppInput.trim();
                          if (!allApps.some(a => a.id.toLowerCase() === appName.toLowerCase())) {
                            const newApp = { id: appName, label: appName };
                            setAllApps(prev => [...prev, newApp]);
                            setSelectedApps(prev => [...prev, appName]);
                          } else {
                            const existing = allApps.find(a => a.id.toLowerCase() === appName.toLowerCase());
                            if (existing && !selectedApps.includes(existing.id)) {
                              setSelectedApps(prev => [...prev, existing.id]);
                            }
                          }
                          setCustomAppInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAppInput.trim()) {
                        const appName = customAppInput.trim();
                        if (!allApps.some(a => a.id.toLowerCase() === appName.toLowerCase())) {
                          const newApp = { id: appName, label: appName };
                          setAllApps(prev => [...prev, newApp]);
                          setSelectedApps(prev => [...prev, appName]);
                        } else {
                          const existing = allApps.find(a => a.id.toLowerCase() === appName.toLowerCase());
                          if (existing && !selectedApps.includes(existing.id)) {
                            setSelectedApps(prev => [...prev, existing.id]);
                          }
                        }
                        setCustomAppInput('');
                      }
                    }}
                    className="bg-stone-950 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-stone-850 cursor-pointer transition-all active:scale-95"
                  >
                    Link
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
                  {allApps.map(app => {
                    const active = selectedApps.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleToggleApp(app.id)}
                        className={`text-left text-xs p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          active 
                            ? 'bg-stone-950/5 border-stone-400 text-stone-950 font-semibold' 
                            : 'bg-stone-50/50 border-stone-200 text-stone-500'
                        }`}
                      >
                        <span className="truncate max-w-[100px]">{app.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {active && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 5. UPLOAD FILES & GENERAL PERMISSIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* FORM FILE UPLOADS */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  7. Upload Knowledge base Files
                </label>
                <p className="text-[11px] text-stone-400">Add PDFs, spreadsheets, pricing sheets, or inventory lists:</p>
                
                <div 
                  onClick={() => workerFormFileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 hover:border-stone-950 transition-all p-5 rounded-lg text-center cursor-pointer hover:bg-stone-50/50"
                >
                  <input
                    type="file"
                    ref={workerFormFileInputRef}
                    onChange={handleFormFileUpload}
                    className="hidden"
                    accept=".pdf,.xlsx,.csv,.docx,.txt"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span className="text-[11px] font-bold text-stone-800">Attach document parameters</span>
                  </div>
                </div>

                {/* Render current form chosen files */}
                {uploadedFormFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {uploadedFormFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono bg-stone-50 border border-stone-200 p-2 rounded">
                        <span className="text-stone-700 truncate max-w-[140px] font-bold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-stone-400" /> {file.name}
                        </span>
                        <span className="text-stone-450 text-[10px]">{file.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PERMISSIONS SELECT GRID */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  8. Human Guardrails & Permissions
                </label>
                <p className="text-[11px] text-stone-400">Strict safety parameters mapped to this worker instance:</p>
                <div className="flex flex-col gap-2 pt-1">
                  {availablePermissions.map(perm => {
                    const active = selectedPermissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`text-left text-xs p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                          active 
                            ? 'bg-stone-50 border-stone-450 text-stone-950 font-bold' 
                            : 'bg-white border-stone-205 text-stone-550 border-stone-200'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          active ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {active && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{perm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ERROR / FEEDBACK OVERLAYS */}
            <AnimatePresence>
              {isCreatingWorker && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-stone-50 border border-stone-200 p-6 rounded-xl flex items-center gap-4 text-sm font-mono text-stone-800"
                >
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-700 shrink-0" />
                  <span>{creationMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CREATE SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isCreatingWorker || !formName.trim()}
                className="w-full bg-stone-950 hover:bg-stone-850 disabled:bg-stone-200 text-white font-semibold text-sm py-4 rounded-xl cursor-pointer transition-all active:scale-[0.99] outline-none"
              >
                Create AI Worker
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* =========================================================================
                             SECTION 5 — CONNECTED APPS
         ========================================================================= */}
      <section className="space-y-10" id="employee-allowed-utilities">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Apps your workers can use
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Workers dynamically trigger updates and dispatch data models securely using connection bridges.
          </p>
        </div>

        {/* Spacious, minimal app row layout - no heavy glass cards */}
        <div className="border border-stone-200 rounded-2xl bg-white divide-y divide-stone-100 overflow-hidden">
          {allApps.map((app) => {
            const iconMap: {[key: string]: any} = {
              'Gmail': Mail,
              'Slack': Users,
              'Shopify': Database,
              'Stripe': ShieldCheck,
              'Notion': FileText,
              'Google Drive': FolderIcon,
              'GitHub': GitIcon
            };
            const descMap: {[key: string]: string} = {
              'Gmail': 'Enables workers to draft answers to customer inbox inquiries.',
              'Slack': 'Enables workers to raise message alerts and notify internal team channels.',
              'Shopify': 'Enables workers to check shipping counts and update fashion logs.',
              'Stripe': 'Enables workers to gather order transaction receipts.',
              'Notion': 'Enables workers to archive customer briefs and team guidelines spreadsheets.',
              'Google Drive': 'Enables workers to reference extensive PDF handbooks.',
              'GitHub': 'Enables workers to monitor repository commits and code issues.'
            };
            const AppIcon = iconMap[app.id] || Sparkles;
            const AppDesc = descMap[app.id] || `Enables workers to sync and trigger operations with your custom ${app.label} workspace.`;
            const linked = connectedApps.includes(app.id) || selectedApps.includes(app.id) || localWorkers.some(w => w.connectedApps.includes(app.id));

            return (
              <div key={app.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-stone-50/20 transition-all">
                <div className="flex items-center gap-4 max-w-xl">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                    <AppIcon className="w-4.5 h-4.5 text-stone-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{app.label} Portal Connection</h4>
                    <p className="text-xs text-stone-400 leading-relaxed mt-1">{AppDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${linked ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                    <span className={`text-[11px] font-mono font-bold ${linked ? "text-emerald-700" : "text-stone-400"}`}>
                      {linked ? "Access Enabled" : "Access Not Linked"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
                             SECTION 6 — COMPANY FILES (KNOWLEDGE BASE)
         ========================================================================= */}
      <section className="space-y-10" id="employee-manuals-indexing-panel">
        <div className="border-b border-stone-100 pb-5">
          <h3 className="text-2xl font-bold tracking-tight text-stone-950 font-sans">
            Files your workers can use
          </h3>
          <p className="text-sm text-stone-400 mt-1 leading-normal font-sans">
            Upload PDFs, spreadsheets, documents, or data sheets. Workers use these files as background knowledge and SOP reference sheets.
          </p>
        </div>

        <div className="border border-stone-200 rounded-2xl bg-white p-8 md:p-12 space-y-8">
          
          <div 
            onClick={() => fileInputRefLocally.current?.click()}
            className="border-2 border-dashed border-stone-150 hover:border-stone-950 transition-all p-12 rounded-xl text-center cursor-pointer group hover:bg-stone-50/50"
          >
            <input 
              type="file" 
              ref={fileInputRefLocally}
              onChange={handleGlobalFileUpload}
              className="hidden" 
              accept=".pdf,.xlsx,.csv,.doc,.docx,.txt"
            />
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-stone-450 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-stone-800" />
              </div>
              <p className="text-xs font-bold text-stone-950">Click here to index spreadsheets, corporate manuals, SOPs, or customer lists</p>
              <p className="text-[10px] text-stone-400 font-mono">Accepts: PDFs, spreadsheets, documents, datasets, corporate guidelines.</p>
            </div>
          </div>

          {/* Render global files inside Vault */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Indexed Files inside Environment Vault</h4>
            <div className="divide-y divide-stone-100 border border-stone-150 rounded-xl overflow-hidden bg-white">
              {localDossiers.map((file, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-stone-50/50 transition-all">
                  <span className="flex items-center gap-2.5 text-stone-700 font-semibold">
                    <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                    {file.name}
                  </span>
                  <div className="flex items-center gap-4 select-none">
                    <span className="font-mono text-[10px] text-stone-400">{file.size}</span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 font-bold">Private & Synced</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-stone-400 font-mono tracking-wide flex items-center gap-2 leading-none pt-2 select-none">
            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Everything stays private. Files are stored securely within your private account vault.</span>
          </p>
        </div>
      </section>

      {/* =========================================================================
                             SECTION 7 — FOOTER (MINIMAL)
         ========================================================================= */}
      <footer className="pt-20 border-t border-stone-100 text-center space-y-4 text-xs font-mono text-stone-400" id="employee-modular-footer">
        <p>octo • human enterprise sandbox workspace • 2026</p>
        <p className="max-w-md mx-auto text-[10px] leading-relaxed text-stone-405">
          Everything on Octo is private by default. Nothing becomes public automatically. Marketplace publishing is completely manual. No analytics overload or orchestration systems are tracked.
        </p>
      </footer>

    </div>
  );
}

// Custom simple fallback icons - keep them inline as pure vector outputs
const FolderIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const GitIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="18 8 22 12 18 16" />
    <polyline points="6 16 2 12 6 8" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);
