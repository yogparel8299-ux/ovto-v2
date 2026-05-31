"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, User, Plus, X, UploadCloud, Check, Play, Pause, FileText, 
  ArrowRight, Sparkles, Settings, LogOut, CheckCircle2, Lock, 
  ArrowUpRight, AlertCircle, RefreshCw, Layers, Users, FolderKanban, 
  HelpCircle, MessageSquare, DollarSign, ExternalLink,
  ChevronLeft, ChevronRight, LayoutDashboard, Briefcase
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';
import type {
  ConnectedApp,
  DashboardActivity,
  DashboardApproval,
  DashboardMetrics,
  CompanyOption,
  DashboardInitialData,
} from '@/lib/supabase/dashboard';
import Builder from './Builder';
import AIWorkers from './AIWorkers';
import Workflows from './Workflows';
import Teams from './Teams';
import Files from './Files';
import Marketplace from './Marketplace';
import Billing from './Billing';
import SettingsPage from './Settings';
import Approvals from './Approvals';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  companyId?: string;
  initialData?: DashboardInitialData;
  onAddActivity?: (text: string, worker: string) => void | Promise<void>;
  onClearNotifications?: () => void | Promise<void>;
  onResolveApproval?: (
    approvalId: string,
    status: 'approved' | 'rejected',
    title: string,
    worker: string
  ) => void | Promise<void>;
  onToggleApp?: (appName: string, connected: boolean) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
}

export default function Dashboard({
  userEmail,
  onLogout,
  companyId,
  initialData,
  onAddActivity: onAddActivityProp,
  onClearNotifications,
  onResolveApproval,
  onToggleApp: onToggleAppProp,
}: DashboardProps) {
  // Navigation tabs list: Dashboard, Builder, AI Workers, Workflows, Teams, Files, Marketplace, Billing, Settings, Approvals
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'workers' | 'workflows' | 'teams' | 'files' | 'marketplace' | 'billing' | 'settings' | 'approvals'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [activeCompany, setActiveCompany] = useState<string>("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [approvals, setApprovals] = useState<DashboardApproval[]>([]);
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [files, setFiles] = useState<MockFile[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    agents: 0,
    teams: 0,
    workflows: 0,
    approvals: 0,
    datasets: 0,
    marketplaceItems: 0,
  });

  useEffect(() => {
    if (!initialData) return;
    setWorkers(initialData.workers);
    setFiles(initialData.files);
    setApps(initialData.apps);
    setActivities(initialData.activities);
    setApprovals(initialData.approvals);
    setNotifications(initialData.notifications);
    setCompanies(initialData.companies);
    setMetrics(initialData.metrics);
    if (initialData.companies.length > 0) {
      setActiveCompany(initialData.companies[0].name);
    }
  }, [initialData]);

  const recordActivity = async (text: string, worker: string) => {
    if (onAddActivityProp) {
      await onAddActivityProp(text, worker);
      return;
    }
    setActivities((prev) => [
      { id: `act-${Date.now()}`, text, time: 'Just now', worker },
      ...prev,
    ]);
  };

  // Builder Custom Form State
  const [customWorkerName, setCustomWorkerName] = useState('');
  const [customWorkerSpeciality, setCustomWorkerSpeciality] = useState<'Support' | 'Finance' | 'Marketing' | 'Operations'>('Support');
  const [customWorkerDuties, setCustomWorkerDuties] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>(['Gmail']);
  const [formSuccess, setFormSuccess] = useState(false);

  // App toggle connector handler
  const toggleAppConnector = async (appName: string) => {
    const current = apps.find((a) => a.name === appName);
    const nextStatus = !(current?.connected ?? false);
    if (onToggleAppProp && companyId) {
      await onToggleAppProp(appName, nextStatus);
      setApps((prev) =>
        prev.map((a) =>
          a.name === appName ? { ...a, connected: nextStatus } : a
        )
      );
      return;
    }
    setApps((prev) =>
      prev.map((a) => {
        if (a.name === appName) {
          void recordActivity(
            `Connection helper linked with ${appName} was ${nextStatus ? 'activated' : 'deactivated'}`,
            'System'
          );
          return { ...a, connected: nextStatus };
        }
        return a;
      })
    );
  };

  // Secure File Upload simulation
  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      const newFile: MockFile = {
        name: f.name,
        size: `${sizeMb} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'Document',
        uploadedAt: 'Just now'
      };

      setFiles(prev => [newFile, ...prev]);
      void recordActivity(
        `Uploaded company file "${f.name}" securely. Parsed parameters localized into workspace vectors.`,
        'System'
      );
    }
  };

  // Handle Approvals
  const handleAcceptApproval = async (id: string, title: string, workerName: string) => {
    if (onResolveApproval) {
      await onResolveApproval(id, 'approved', title, workerName);
    } else {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      await recordActivity(
        `Approved action: ${title}. ${workerName} dispatched confirmation successfully.`,
        workerName
      );
    }

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.name === workerName) {
          return { ...w, status: 'completed', tasksCount: w.tasksCount + 1 };
        }
        return w;
      })
    );
  };

  // Custom AI Worker creation submission
  const handleHireCustomWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWorkerName.trim()) return;

    const newW: AIWorker = {
      id: `w-custom-${Date.now()}`,
      name: customWorkerName,
      role: customWorkerSpeciality,
      status: 'running',
      avatarColor: 'bg-stone-100 text-stone-900 border-stone-200',
      connectedApps: selectedApps,
      tasksCount: 0
    };

    setWorkers(prev => [...prev, newW]);
    void recordActivity(
      `Hired custom worker ${customWorkerName} to automatically manage ${customWorkerSpeciality} channels`,
      customWorkerName
    );

    // Reset inputs
    setCustomWorkerName('');
    setCustomWorkerDuties('');
    setFormSuccess(true);

    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-stone-900 font-sans selection:bg-stone-900 selection:text-white" id="octo-human-workspace-dashboard">
      
      {/* =========================================================================
                                     LEFT SIDEBAR (COLLAPSIBLE)
          Very spacious clean sidebar, generous spacing between core items.
         ========================================================================= */}
      <motion.aside 
        animate={{ width: sidebarCollapsed ? 96 : 304 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="border-r border-stone-100 bg-[#FCFCFB] flex flex-col justify-between p-8 shrink-0 select-none overflow-hidden relative" 
        id="dashboard-spacious-sidebar"
      >
        <div className="flex flex-col gap-14">
          
          {/* Top Branding Section + Collapse Toggler inside */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'mx-auto' : ''}`}>
              <div className="w-6 h-6 border border-stone-950 bg-stone-950 rounded flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-sans font-bold text-lg tracking-tight text-stone-950"
                >
                  octo
                </motion.span>
              )}
            </div>

            {/* Subtle premium collapse toggle button */}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-950 hover:bg-stone-50/60 transition-all cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* If collapsed, show a nice compact "Expand" indicator at the top */}
          {sidebarCollapsed && (
            <div className="flex justify-center -mt-6">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-stone-600 hover:text-stone-950 transition-all cursor-pointer shadow-xs"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Simple Spacious Nav Links with Icons */}
          <nav className="flex flex-col gap-6" id="sidebar-navigation">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'builder', label: 'Builder', icon: Sparkles },
              { id: 'workers', label: 'AI Workers', icon: Briefcase },
              { id: 'workflows', label: 'Workflows', icon: RefreshCw },
              { id: 'teams', label: 'Teams', icon: Users },
              { id: 'files', label: 'Files', icon: FileText },
              { id: 'marketplace', label: 'Marketplace', icon: Layers },
              { id: 'billing', label: 'Billing', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'approvals', label: 'Approvals', icon: CheckCircle2 }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  type="button"
                  className={`flex items-center text-left text-sm font-medium transition-all cursor-pointer select-none py-2 px-3 rounded-lg ${
                    sidebarCollapsed ? 'justify-center' : 'justify-start gap-4'
                  } ${
                    isSelected 
                      ? 'text-stone-950 font-semibold bg-stone-100/50' 
                      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50/20'
                  }`}
                  title={tab.label}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-stone-950' : 'text-stone-400'}`} />
                  
                  {!sidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="truncate"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Info Box at Sidebar bottom */}
        <div className="border-t border-stone-100 pt-8 flex flex-col gap-5">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200/50 flex items-center justify-center text-stone-700 font-medium text-xs font-mono shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'W'}
            </div>
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate"
              >
                <p className="text-xs font-semibold text-stone-950 truncate max-w-[140px]">
                  {userEmail}
                </p>
                <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase">
                  Owner Account
                </p>
              </motion.div>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={`w-full text-xs font-semibold text-stone-400 hover:text-stone-950 transition-colors flex items-center gap-2 pt-2 border-t border-stone-100 cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            id="sidebar-logout-button"
            title="Sign Out Workspace"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>


      {/* =========================================================================
                                     MAIN CONTENT PANEL
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FDFDFD]" id="dashboard-right-panel font-sans">
        
        {/* TOP BAR layout */}
        <header className="h-24 border-b border-stone-100/60 bg-white/80 backdrop-blur-md px-14 md:px-20 flex items-center justify-between select-none z-30 sticky top-0" id="main-topbar">
          {activeTab === 'settings' ? (
            <>
              {/* Left Logo / Label */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-900 tracking-tight font-sans">Settings</span>
              </div>

              {/* Right Profile button */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-stone-900 leading-none">Yogesh Patel</p>
                  <p className="text-[10px] text-stone-400 font-mono mt-1">{userEmail}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-mono text-[10px] font-bold text-stone-700 select-none cursor-pointer" title="Workspace Owner Profile">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'Y'}
                </div>
              </div>
            </>
          ) : activeTab === 'marketplace' ? (
            <>
              {/* Left Logo / Label */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-stone-950 font-bold bg-stone-50 border border-stone-200 px-3 py-1 rounded">Marketplace</span>
              </div>

              {/* Center Search / Focus label */}
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-stone-400">
                <span>Refined community business blueprints</span>
              </div>

              {/* Right Publish & Profile buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const target = document.getElementById('publishing-intake-banner');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="bg-stone-950 hover:bg-stone-850 text-white font-medium text-[11px] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Publish Work
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-205 flex items-center justify-center font-mono text-[10px] font-bold text-stone-700 select-none">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-stone-800 hidden lg:inline truncate max-w-[120px]">{userEmail}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 relative z-50 select-none">
                <span className="text-xs uppercase font-mono tracking-wider text-stone-400 font-semibold">Your Space</span>
                <span className="text-stone-300 font-mono text-xs">•</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    className="text-xs font-semibold text-stone-950 bg-stone-50 hover:bg-stone-105 border border-stone-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                    id="topbar-company-dropdown-trigger"
                  >
                    <span>{activeCompany}</span>
                    <span className="text-stone-400 text-[9px] select-none">▼</span>
                  </button>

                  <AnimatePresence>
                    {showCompanyDropdown && (
                      <>
                        {/* Invisible backdrop to close the dropdown on clicking outside */}
                        <div 
                          className="fixed inset-0 z-40 cursor-default" 
                          onClick={() => setShowCompanyDropdown(false)}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          className="absolute left-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg p-3 space-y-2 z-50 text-left"
                        >
                          <div className="px-2 py-1 border-b border-stone-105 pb-2">
                            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-stone-400 block animate-fade-in">
                              Active Workspace
                            </span>
                            <span className="text-xs font-bold text-stone-950 block mt-0.5 truncate">
                              {activeCompany}
                            </span>
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-1 py-1">
                            {companies.map((comp) => {
                              const isActive = comp.name === activeCompany;
                              return (
                                <button
                                  key={comp.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveCompany(comp.name);
                                    setShowCompanyDropdown(false);
                                    void recordActivity(
                                      `Switched operational context to workspace department: "${comp.name}"`,
                                      'System'
                                    );
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                    isActive 
                                      ? 'bg-stone-50 text-stone-950 font-bold' 
                                      : 'text-stone-605 hover:bg-stone-50 hover:text-stone-955'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  {isActive && <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded">Active</span>}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-stone-105 space-y-1 select-none">
                            <button
                              type="button"
                              onClick={() => {
                                const name = prompt("Enter a new company or workspace name:");
                                if (name && name.trim()) {
                                  const trimmed = name.trim();
                                  setCompanies((prev) => [
                                    ...prev,
                                    { id: `local-${Date.now()}`, name: trimmed },
                                  ]);
                                  setActiveCompany(trimmed);
                                  void recordActivity(
                                    `Provisioned independent sandboxed workspace catalog: "${trimmed}"`,
                                    'System'
                                  );
                                }
                                setShowCompanyDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-stone-700" />
                              <span>Create New Company</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShowCompanyDropdown(false);
                                setActiveTab('settings');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-950 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Settings className="w-3.5 h-3.5 text-stone-500" />
                              <span>Company Settings</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-6 relative">
                {/* Soft Human Active light */}
                <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                  <span>AI employees online</span>
                </div>

                {/* Simple notification bell */}
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-stone-400 hover:text-stone-950 transition-colors relative cursor-pointer p-1"
                  id="topbar-notifications-trigger"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-950" />
                  )}
                </button>

                {/* Simple notifications popover */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-10 bg-white border border-stone-200 shadow-lg rounded-xl p-6 w-80 z-50 flex flex-col gap-4 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="font-semibold text-stone-900">Workspace updates</span>
                        <button 
                          onClick={() => {
                            setNotifications([]);
                            void onClearNotifications?.();
                          }} 
                          className="text-[10px] text-stone-400 hover:text-stone-900 font-semibold"
                        >
                          Clear all
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-stone-400 pb-2">Everything is fully up to date.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {notifications.map((n, idx) => (
                            <p key={idx} className="text-stone-600 leading-relaxed font-sans">
                              • {n}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </header>

        {/* Primary Layout Scroller — MASSIVE OPEN SPACIOUS SANS-SERIF SCROLLER */}
        <div className="flex-1 overflow-y-auto px-14 md:px-20 py-20 max-w-6xl w-full mx-auto space-y-36 pb-60">
          
          {/* CONDITIONAL SUBPAGE RENDERING FOR OTHER TABS TO FEEL VERY POWERFUL */}
          <AnimatePresence mode="wait">
            {activeTab !== 'dashboard' && activeTab !== 'builder' && activeTab !== 'workers' && activeTab !== 'workflows' && activeTab !== 'teams' && activeTab !== 'files' && activeTab !== 'marketplace' && activeTab !== 'billing' && activeTab !== 'settings' && activeTab !== 'approvals' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-stone-100 p-10 rounded-2xl space-y-8 shadow-xs mb-10"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-sans text-stone-950 uppercase tracking-tight">
                      {(activeTab as string).charAt(0).toUpperCase() + (activeTab as string).slice(1)} Channel
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Manage this active business node safely. Absolutely private standalone parameters.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-stone-450 hover:text-stone-950 flex items-center gap-1 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-all"
                  >
                    <span>Return to Company Home</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Standalone Builder Page channel is handled by the gorgeous Builder tab */}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Builder Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Builder 
                  onAddWorkers={(newW) => setWorkers(prev => [...prev, ...newW])} 
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onAddFile={(newF) => setFiles(prev => [newF, ...prev])}
                  onToggleApp={(appName) => toggleAppConnector(appName)}
                  connectedApps={apps.filter(a => a.connected).map(a => a.name)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class AI Workers Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'workers' && (
              <motion.div
                key="workers"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <AIWorkers 
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  workersList={workers}
                  onAddWorkers={(newW) => setWorkers(prev => [...prev, ...newW])}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onAddFile={(newF) => setFiles(prev => [newF, ...prev])}
                  connectedApps={apps.filter(a => a.connected).map(a => a.name)}
                  companyFiles={files}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Workflows Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'workflows' && (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Workflows 
                  workersList={workers}
                  connectedApps={apps.filter(a => a.connected).map(a => a.name)}
                  companyFiles={files}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Teams Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Teams 
                  workersList={workers}
                  connectedApps={apps.filter(a => a.connected).map(a => a.name)}
                  companyFiles={files}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Files Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Files 
                  companyFiles={files}
                  onSetCompanyFiles={setFiles}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  workersList={workers}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Marketplace Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Marketplace 
                  companyFiles={files}
                  onSetCompanyFiles={setFiles}
                  workersList={workers}
                  onSetWorkersList={setWorkers}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Billing Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Billing 
                  companyFiles={files}
                  workersList={workers}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Settings Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <SettingsPage 
                  userEmail={userEmail}
                  onLogout={onLogout}
                  workersList={workers}
                  companyFiles={files}
                  onAddFile={(newF) => setFiles(prev => [newF, ...prev])}
                  activeApps={apps}
                  onToggleApp={(appName) => toggleAppConnector(appName)}
                  onSetActiveTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onAddActivity={(txt, name) => { void recordActivity(txt, name); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standalone First-Class Approvals Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'approvals' && (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, scale: 0.99, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Approvals />
              </motion.div>
            )}
          </AnimatePresence>

          {/* =========================================================================
                                 DASHBOARD HOME ROOT LAYOUT (Conditional check)
             ========================================================================= */}
          {activeTab === 'dashboard' && (
            <>
          <section className="space-y-8 animate-fade-in" id="section-workspace-metrics">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-955 font-sans">Workspace metrics</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Live counts from your company workspace.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6" id="workspace-status-metric-grid">
              {[
                { title: "Agents", value: String(metrics.agents), desc: "AI workers in your company" },
                { title: "Teams", value: String(metrics.teams), desc: "Active team configurations" },
                { title: "Workflows", value: String(metrics.workflows), desc: "Automated business workflows" },
                { title: "Approvals", value: String(metrics.approvals), desc: "Items in approval queue" },
                { title: "Datasets", value: String(metrics.datasets), desc: "Structured data assets" },
                { title: "Marketplace", value: String(metrics.marketplaceItems), desc: "Listed marketplace items" },
              ].map((card) => (
                <div 
                  key={card.title} 
                  className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col justify-between hover:border-stone-300 transition-all min-h-[140px]"
                >
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400 block p-0">
                    {card.title}
                  </span>
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold font-sans text-stone-950 block tracking-tight mt-3">
                      {card.value}
                    </span>
                    <span className="text-[10px] text-stone-450 font-medium block mt-1.5 font-sans leading-normal">
                      {card.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* =========================================================================
                                 SECTION 2 — WHAT’S HAPPENING
              Main summary area with massive spacing. Shows employee work in human phrasing,
              e.g., Support Worker replying to customers, Finance Worker generating weekly report,
              Operations Worker updating supplier sheets, Marketing Worker scheduling posts.
         ========================================================================= */}
          <section className="space-y-10" id="section-2-whats-happening">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-955 font-sans">What's happening right now</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Your specialists are autonomously handling daily operations safely.</p>
            </div>

            {/* SPACIOUS MINIMAL EMPLOYEES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="whats-happening-employee-grid">
              
              {/* Support Employee card */}
              <div className="border border-stone-200 p-8 rounded-2xl bg-white hover:border-stone-300 transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-400">Customer Support Employee</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-950">Clara</h4>
                    <p className="text-sm font-semibold tracking-tight text-stone-900 mt-1 leading-normal">
                      Replying to customer emails and sorting active orders.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span className="font-mono">Active on Gmail & Shopify</span>
                  <span className="font-mono">{workers.find(w => w.name === 'Clara')?.tasksCount || 148} threads resolved</span>
                </div>
              </div>

              {/* Finance assistant card */}
              <div className="border border-stone-200 p-8 rounded-2xl bg-white hover:border-stone-300 transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-400">Finance & Accounting Assistant</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-950">Valkyrie</h4>
                    <p className="text-sm font-semibold tracking-tight text-stone-900 mt-1 leading-normal">
                      Generating weekly settlement report and comparing ledgers against standard database files.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span className="font-mono">Active on Stripe & Notion</span>
                  <span className="font-mono">{workers.find(w => w.name === 'Valkyrie')?.tasksCount || 84} ledgers audited</span>
                </div>
              </div>

              {/* Operations Worker card */}
              <div className="border border-stone-200 p-8 rounded-2xl bg-white hover:border-stone-300 transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-400">Logistics & Operations Coordinator</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-950">Atlas</h4>
                    <p className="text-sm font-semibold tracking-tight text-stone-900 mt-1 leading-normal">
                      Updating supplier logs and checking for route delivery delays to send warning dispatch drafts.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-450">
                  <span className="font-mono text-amber-800">Requires Your Confirmation</span>
                  <span className="font-mono text-stone-400">61 cycles</span>
                </div>
              </div>

              {/* Marketing Coordinator Card */}
              <div className="border border-stone-200 p-8 rounded-2xl bg-white hover:border-stone-300 transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-400">Marketing & Content Coordinator</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-950">Synthesizer</h4>
                    <p className="text-sm font-semibold tracking-tight text-stone-900 mt-1 leading-normal">
                      Scheduling promotional news letters, writing drafts, and cataloging competitive price schedules.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-450">
                  <span className="font-mono text-stone-400 font-semibold uppercase">Standing By</span>
                  <span className="font-mono text-stone-400">104 tasks done</span>
                </div>
              </div>

            </div>
          </section>


          {/* =========================================================================
                                 SECTION 3 — RECENT WORK
              Simple feed representing tasks finished. Minimal and easy.
         ========================================================================= */}
          <section className="space-y-8" id="section-3-recent-work">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-955 font-sans">Recent work completed</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Live feed of active processes successfully finished this morning.</p>
            </div>

            <div className="border border-stone-200/80 rounded-2xl devide-y divide-stone-100 bg-white overflow-hidden shadow-xs">
              {activities.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-bold text-stone-950">No recent activity</p>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Activity from your agents and workflows will appear here.
                  </p>
                </div>
              ) : (
              <div className="divide-y divide-stone-100">
                {activities.map((act) => (
                  <div key={act.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shrink-0" />
                      <p className="text-stone-700 leading-relaxed font-medium">
                        {act.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 font-mono text-[11px] text-stone-400 select-none">
                      <span className="font-semibold text-stone-450 bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded uppercase">
                        {act.worker}
                      </span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </section>


          {/* =========================================================================
                                 SECTION 4 — PENDING APPROVALS
              Very simple approval area. Review supplier message, approve refund, approve customer email.
              Clean spacious cards only. Buttons permit dismissing cards beautifully.
         ========================================================================= */}
          <section className="space-y-8" id="section-4-pending-approvals">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-950 font-sans">Pending approvals</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Tasks requiring your human confirmation before specialists send drafts or dispatch assets.</p>
            </div>

            {approvals.length === 0 ? (
              <div className="border border-stone-200 p-10 rounded-2xl text-center bg-white">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-950">All approvals set</h4>
                <p className="text-xs text-stone-450 mt-1 leading-relaxed">Your company is running continuously. No pending human checks remain.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {approvals.map((req) => (
                  <div 
                    key={req.id}
                    className="border border-stone-200 p-7 rounded-2xl bg-[#FCFCFB] hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-900 border border-amber-200/50 px-20 py-0.5 rounded font-bold">
                          Needs Review
                        </span>
                        <span className="text-xs font-semibold text-stone-450 font-mono">assigned to {req.worker}</span>
                      </div>
                      <h4 className="text-base font-bold text-stone-950">{req.title}</h4>
                      <p className="text-xs text-stone-550 leading-relaxed font-sans">{req.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 select-none">
                      <button
                        type="button"
                        onClick={() => handleAcceptApproval(req.id, req.title, req.worker)}
                        className="bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all active:scale-[0.97] cursor-pointer"
                        id={`btn-approve-${req.id}`}
                      >
                        {req.actionLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void (onResolveApproval
                            ? onResolveApproval(req.id, 'rejected', req.title, req.worker)
                            : (async () => {
                                setApprovals((prev) => prev.filter((x) => x.id !== req.id));
                                await recordActivity(
                                  `Bypassed or rejected authorization schedule: "${req.title}".`,
                                  'System'
                                );
                              })());
                        }}
                        className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold px-4 py-3 rounded-xl transition-all active:scale-[0.97] cursor-pointer"
                        id={`btn-decline-${req.id}`}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>


          {/* =========================================================================
                                 SECTION 5 — CONNECTED APPS
              Gmail, Slack, Notion, Shopify, Stripe, Google Drive.
              Simple, modern app row layout. No huge giant logos or flashy clutter.
         ========================================================================= */}
          <section className="space-y-8" id="section-5-connected-apps">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-950 font-sans">Connected apps</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Enable linked corporate services to give your autonomous workers context access.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="connected-apps-grid">
              {apps.map((app) => (
                <div 
                  key={app.name} 
                  className="border border-stone-150 p-6 rounded-2xl bg-white hover:border-stone-300 transition-all flex flex-col justify-between"
                  id={`app-${app.name.toLowerCase()}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-950">{app.name}</h4>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.connected 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                          : 'bg-stone-100 text-stone-400'
                      }`}>
                        {app.connected ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-450 leading-relaxed font-sans">{app.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAppConnector(app.name)}
                    className={`mt-4 w-full text-center text-xs font-semibold py-2 rounded-lg border transition-all cursor-pointer ${
                      app.connected
                        ? 'bg-white border-stone-200 hover:bg-stone-50 text-stone-605'
                        : 'bg-stone-950 border-stone-900 text-white hover:bg-stone-850'
                    }`}
                  >
                    {app.connected ? 'Disconnect App' : 'Connect Private Node'}
                  </button>
                </div>
              ))}
            </div>
          </section>


          {/* =========================================================================
                                 SECTION 6 — YOUR FILES
              PDFs, spreadsheets, documents, datasets. Simple clean upload area.
              Strongly communicate privacy patterns.
         ========================================================================= */}
          <section className="space-y-8" id="section-6-vault-files">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-105 font-sans">Your company files</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Import reference databases, supplier contacts, and compliance sheets securely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="files-handling-grid">
              
              {/* Clean spacious drop Uploader box */}
              <div className="border border-dashed border-stone-250 bg-stone-50/10 hover:border-stone-400 rounded-2xl p-8 flex flex-col justify-center items-center text-center transition-all min-h-[160px] relative">
                <input 
                  type="file" 
                  multiple
                  onChange={handleUploadFiles}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-5 h-5 text-stone-405 mb-2" />
                <span className="text-xs font-semibold text-stone-950 block">Upload more files</span>
                <span className="text-[10px] text-stone-400 mt-1 leading-normal block">Drag files anywhere to import into your company sandbox</span>
              </div>

              {/* Sample files */}
              {files.map((file, idx) => (
                <div 
                  key={idx} 
                  className="border border-stone-200 p-6 rounded-2xl bg-white hover:border-stone-300 transition-all flex flex-col justify-between"
                  id={`vault-file-${idx}`}
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-stone-50 border border-stone-150 flex items-center justify-center mb-3">
                      <FileText className="w-4 h-4 text-stone-600" />
                    </div>
                    <p className="text-xs font-bold text-stone-950 truncate max-w-[180px]" title={file.name}>
                      {file.name}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>{file.size}</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
              ))}

            </div>

            <div className="bg-stone-50 border border-stone-100 p-5 rounded-xl flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-stone-900 leading-none">Security and absolute data sovereignty</p>
                <p className="text-[11px] text-stone-450 mt-1 leading-relaxed font-sans">
                  Everything stays private. Files undergo physical local reference extraction inside secure sandboxed instances and are never used for external third-party training patterns.
                </p>
              </div>
            </div>
          </section>


          {/* =========================================================================
                                 SECTION 7 — QUICK ACTIONS
              Build AI Worker, Upload Files, Connect Apps, Open Builder.
              Large clean action buttons.
         ========================================================================= */}
          <section className="space-y-8" id="section-7-quick-actions">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-stone-950 font-sans">Quick actions</h3>
              <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">Fast-track operations to configure your workspace instantly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6" id="quick-actions-buttons-container">
              
              <button
                type="button"
                onClick={() => {
                  setActiveTab('builder');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="p-8 border border-stone-200 rounded-2xl text-left bg-[#FCFCFB] hover:bg-stone-50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] cursor-pointer"
                id="qa-action-build-worker"
              >
                <span className="w-8 h-8 rounded bg-stone-950 text-white flex items-center justify-center font-bold text-sm">1</span>
                <div>
                  <h4 className="text-xs font-bold text-stone-950 uppercase tracking-wide font-mono mb-1">Step 1</h4>
                  <p className="text-sm font-semibold text-stone-900">Build AI Worker</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('files');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="p-8 border border-stone-200 rounded-2xl text-left bg-white hover:bg-stone-50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] cursor-pointer"
                id="qa-action-upload-files"
              >
                <span className="w-8 h-8 rounded bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200 font-bold text-sm">2</span>
                <div>
                  <h4 className="text-xs font-bold text-stone-950 uppercase tracking-wide font-mono mb-1">Step 2</h4>
                  <p className="text-sm font-semibold text-stone-900">Upload Files</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  // locate Connected apps section
                  const el = document.getElementById('section-5-connected-apps');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-8 border border-stone-200 rounded-2xl text-left bg-white hover:bg-stone-50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] cursor-pointer"
                id="qa-action-connect-apps"
              >
                <span className="w-8 h-8 rounded bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200 font-bold text-sm">3</span>
                <div>
                  <h4 className="text-xs font-bold text-stone-955 uppercase tracking-wide font-mono mb-1">Step 3</h4>
                  <p className="text-sm font-semibold text-stone-900">Connect Corporate Apps</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('builder');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="p-8 border border-stone-200 rounded-2xl text-left bg-[#FCFCFB] hover:bg-stone-50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] cursor-pointer"
                id="qa-action-open-builder"
              >
                <span className="w-8 h-8 rounded bg-stone-950 text-white flex items-center justify-center font-bold text-sm">4</span>
                <div>
                  <h4 className="text-xs font-bold text-stone-950 uppercase tracking-wide font-mono mb-1">Step 4</h4>
                  <p className="text-sm font-semibold text-stone-900">Open Builder Portal</p>
                </div>
              </button>

            </div>
          </section>


          {/* =========================================================================
                                 SECTION 8 — FINAL MESSAGE
              Headline: One person. Full company. 
              Small supporting line: AI workers helping run your business while you focus on your life.
         ========================================================================= */}
          <section className="text-center py-20 border-t border-stone-100 max-w-4xl mx-auto flex items-center justify-center select-none" id="section-8-final-message">
            <div className="flex flex-col gap-6 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-bold font-sans tracking-tight text-stone-950 leading-tight">
                One person. Full company.
              </h2>
              <p className="text-sm sm:text-base text-stone-450 font-sans tracking-normal leading-relaxed max-w-lg mx-auto">
                AI workers helping run your business while you focus on your life.
              </p>
            </div>
          </section>
            </>
          )}

        </div>

        {/* Footnotes of human workspace page */}
        <footer className="border-t border-stone-100 py-10 px-14 md:px-20 text-xs font-mono text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto select-none bg-white font-sans shrink-0" id="workspace-footer">
          <div>
            <span>© {new Date().getFullYear()} Octo Inc. 100% Client-Side Encryption Assured.</span>
          </div>
          <div className="flex gap-6">
            <span>Stand-alone Computing Shield active</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-950 font-semibold cursor-default">Status: Online</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
