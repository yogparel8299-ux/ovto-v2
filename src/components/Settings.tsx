"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Sparkles, UploadCloud, CheckCircle2, Cloud, RefreshCw, 
  Trash2, Bell, ShieldAlert, Key, Link as LinkIcon, User, Layers, 
  FileText, ToggleLeft, ToggleRight, Check, AlertCircle, Settings as SettingsIcon, Info, X
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';

interface SettingsProps {
  userEmail: string;
  onLogout: () => void;
  workersList: AIWorker[];
  companyFiles: MockFile[];
  onAddFile: (newFile: MockFile) => void;
  activeApps: { name: string; connected: boolean; desc: string }[];
  onToggleApp: (appName: string) => void;
  onSetActiveTab: (tab: any) => void;
  onAddActivity?: (activityText: string, workerName: string) => void;
}

// Simple standard data structure for the local AI models integration
interface ModelKeyConfig {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Claude' | 'Gemini' | 'Grok' | 'Mistral' | 'OpenRouter' | 'Together AI' | 'Replicate';
  connected: boolean;
  mask: string;
  inputValue: string;
}

export default function Settings({
  userEmail,
  onLogout,
  workersList,
  companyFiles,
  onAddFile,
  activeApps,
  onToggleApp,
  onSetActiveTab,
  onAddActivity
}: SettingsProps) {

  // Global Toast State
  const [successToast, setSuccessToast] = useState('');
  const triggerToast = (text: string) => {
    setSuccessToast(text);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // ----------------------------------------------------
  // SECTION 2 — WORKSPACE SETTINGS STATE
  // ----------------------------------------------------
  const [workspaceName, setWorkspaceName] = useState('Octo Creative HQ');
  const [companyName, setCompanyName] = useState('Octo Inc.');
  const [workspaceDesc, setWorkspaceDesc] = useState('Spacious autonomous workflows and digital matching matching sandbox.');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        triggerToast('Workspace logo updated locally.');
        if (onAddActivity) {
          onAddActivity('Updated workspace identity assets: New brand emblem registered.', 'System');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Workspace settings saved successfully.');
    if (onAddActivity) {
      onAddActivity(`Workspace metadata re-indexed: "${workspaceName}" under ${companyName}.`, 'System');
    }
  };

  // ----------------------------------------------------
  // SECTION 3 — PROFILE SETTINGS STATE
  // ----------------------------------------------------
  const [profileName, setProfileName] = useState('Yogesh Patel');
  const [profileEmail, setProfileEmail] = useState(userEmail || 'yogparel8299@gmail.com');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Profile parameters updated securely.');
    if (onAddActivity) {
      onAddActivity(`Profile updated for ${profileName} (${profileEmail}).`, 'System');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      alert("New password mismatch. Please re-enter.");
      return;
    }
    setShowPasswordModal(false);
    setPasswords({ current: '', next: '', confirm: '' });
    triggerToast('Password updated securely. Security keys rotated.');
    if (onAddActivity) {
      onAddActivity('Account security parameters changed: Password reset successfully.', 'System');
    }
  };

  // ----------------------------------------------------
  // SECTION 4 — AI MODEL KEYS STATE
  // ----------------------------------------------------
  const [modelKeys, setModelKeys] = useState<ModelKeyConfig[]>([]);

  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');

  const handleAddNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyProvider.trim() || !newKeySecret.trim()) {
      triggerToast('Please provide both the provider name and the key.');
      return;
    }
    
    const provName = newKeyProvider.trim();
    const keyVal = newKeySecret.trim();
    
    const newKey: ModelKeyConfig = {
      id: `mk-${Date.now()}`,
      name: provName,
      provider: provName as any,
      connected: true,
      mask: keyVal.startsWith('•••') ? 'sk-...' : `sk-...${keyVal.slice(-4) || '81a2'}`,
      inputValue: '••••••••••••••••••••'
    };

    setModelKeys(prev => [...prev, newKey]);
    setNewKeyProvider('');
    setNewKeySecret('');
    
    triggerToast(`Local key saved securely for ${provName}.`);
    if (onAddActivity) {
      onAddActivity(`Connected model key configured: Saved local API credentials for ${provName}.`, 'System');
    }
  };

  const handleRemoveModelKey = (id: string, name: string) => {
    setModelKeys(prev => prev.filter(m => m.id !== id));
    triggerToast(`Removed configuration for ${name}.`);
    if (onAddActivity) {
      onAddActivity(`Disconnected model key: Removed credentials for ${name}.`, 'System');
    }
  };

  // ----------------------------------------------------
  // SECTION 5 — CONNECTED APPS
  // ----------------------------------------------------
  // Sync standard app options with higher tier
  const appsConfig = [
    { name: 'Gmail', icon: '✉️' },
    { name: 'Slack', icon: '💬' },
    { name: 'Shopify', icon: '🛍️' },
    { name: 'Stripe', icon: '💳' },
    { name: 'Notion', icon: '📓' },
    { name: 'Google Drive', icon: '📂' },
    { name: 'GitHub', icon: '💻' },
    { name: 'Calendar', icon: '📅' }
  ];

  // Helper lists to map user's active apps context
  const handleAppReconnect = (appName: string) => {
    // Reconnect simulation resets state or keeps it active
    const appFound = activeApps.find(a => a.name === appName);
    if (!appFound?.connected) {
      onToggleApp(appName);
    }
    triggerToast(`Refreshed OAuth link for ${appName}. Secure connection verified.`);
  };

  // ----------------------------------------------------
  // SECTION 6 — PRIVACY + PERMISSIONS (Default to private)
  // ----------------------------------------------------
  const [privacyOptions, setPrivacyOptions] = useState({
    approvalForPublicPosting: true, // true means restricted/requires approval
    approvalForEmails: true,       // true means restricted/requires approval
    teamAccessRestricted: true,
    fileAccessRestricted: true,
    workerRestricted: true
  });

  const togglePrivacy = (key: keyof typeof privacyOptions) => {
    setPrivacyOptions(prev => {
      const next = !prev[key];
      triggerToast(`Privacy updated: ${String(key)} is now ${next ? 'Restricted (Private)' : 'Unrestricted'}.`);
      return { ...prev, [key]: next };
    });
  };

  // ----------------------------------------------------
  // SECTION 7 — NOTIFICATIONS
  // ----------------------------------------------------
  const [notificationConfig, setNotificationConfig] = useState({
    onCompleted: true,
    onApproval: true,
    onStopped: false,
    onDownload: true,
    onUpload: false
  });

  const toggleNotification = (key: keyof typeof notificationConfig) => {
    setNotificationConfig(prev => {
      const next = !prev[key];
      triggerToast('Notification parameters updated.');
      return { ...prev, [key]: next };
    });
  };

  // ----------------------------------------------------
  // SECTION 8 — STORAGE & FILES
  // ----------------------------------------------------
  const [recentUploads, setRecentUploads] = useState<MockFile[]>([
    ...companyFiles
  ]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const fileObj = list[0];
    const sizeStr = (fileObj.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    const fresh: MockFile = {
      name: fileObj.name,
      size: sizeStr,
      type: fileObj.name.split('.').pop()?.toUpperCase() || 'Attachment',
      uploadedAt: 'Just now'
    };

    onAddFile(fresh);
    setRecentUploads(prev => [fresh, ...prev]);
    triggerToast(`File registered in secure storage sandbox: ${fileObj.name}`);
  };

  // ----------------------------------------------------
  // SECTION 9 — DANGER ZONE INTERFACE
  // ----------------------------------------------------
  const [confirmDeleteShow, setConfirmDeleteShow] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleDeleteWorkspaceForever = () => {
    if (deleteInput !== 'DELETE') {
      alert("Invalid verification entry. Please type DELETE.");
      return;
    }
    setConfirmDeleteShow(false);
    triggerToast("Workspace terminated successfully. Initiating cleanup routine...");
    setTimeout(() => {
      onLogout();
    }, 1800);
  };

  const handleGlobalSaveAll = () => {
    triggerToast('All parameters saved locally in this session successfully.');
    if (onAddActivity) {
      onAddActivity('All corporate alignment variables synchronized.', 'System');
    }
  };


  return (
    <div className="space-y-28 py-6 font-sans relative" id="settings-unified-view-block">
      
      {/* GLOBAL BANNER SUCCESS */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="p-4 bg-stone-950 text-white rounded-xl border border-stone-850 text-xs font-semibold text-center fixed top-24 right-12 z-50 shadow-lg flex items-center gap-2.5 max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-[#9D8055] shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — HERO SECTION */}
      <section className="bg-white border border-stone-150 rounded-3xl p-10 md:p-14 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-10" id="settings-hero">
        <div className="space-y-4 text-left max-w-2xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9D8055] font-bold block">
            Workspace Settings Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Your settings.
          </h1>
          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xl pt-1">
            Manage your workspace, AI models, connected apps, permissions, and privacy settings. Everything operates securely.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] font-mono text-stone-400 select-none pt-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-900">
              <Shield className="w-3.5 h-3.5" /> Private by default
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Secure connections
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Your data stays yours
            </span>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
          <button
            onClick={handleGlobalSaveAll}
            className="px-5 py-3.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-sans tracking-tight transition-all cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
          <button
            onClick={() => onSetActiveTab('billing')}
            className="px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-850 border border-stone-200 rounded-xl text-xs font-medium font-sans transition-all cursor-pointer"
          >
            Manage Billing
          </button>
        </div>
      </section>

      {/* SECTION 2 — WORKSPACE SETTINGS */}
      <section className="space-y-6" id="settings-workspace-config">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Identity</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Workspace Settings</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Environment descriptors</span>
        </div>

        <div className="bg-[#FCFCFA] border border-stone-250/70 rounded-3xl p-8 lg:p-10">
          <form onSubmit={handleUpdateWorkspace} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Logo upload part */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Company Emblem</span>
              
              <div className="relative w-28 h-28 border border-stone-200 rounded-3xl bg-white overflow-hidden flex items-center justify-center group shadow-2xs">
                {logoPreview ? (
                  <img src={logoPreview} alt="Workspace Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3">
                    <span className="text-2xl font-mono block font-black text-stone-900">🐙</span>
                    <span className="text-[9px] font-mono text-stone-400 tracking-tight uppercase block mt-1">Octo Logo</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 w-full max-w-[170px]">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-lg text-[11px] font-medium transition-all"
                >
                  Upload Logo
                </button>
                <p className="text-[9px] text-stone-400 leading-normal text-center lg:text-left">
                  PNG/JPG files up to 2MB. Logo appears in workspace and PDFs.
                </p>
              </div>
            </div>

            {/* Input fields */}
            <div className="lg:col-span-9 space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-medium text-stone-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Owner Company Incorporation</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-medium text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Workspace Description</label>
                <textarea
                  value={workspaceDesc}
                  onChange={(e) => setWorkspaceDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-white border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 resize-none font-medium text-stone-900"
                />
              </div>

              <div className="pt-2 border-t border-stone-150 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Update Workspace
                </button>
              </div>
            </div>

          </form>
        </div>
      </section>

      {/* SECTION 3 — PROFILE SETTINGS */}
      <section className="space-y-6" id="settings-profile-config">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Contact</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Profile Settings</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Account details</span>
        </div>

        <div className="border border-stone-200 rounded-3xl p-8 lg:p-10 bg-white">
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side profile picture selector */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Profile Avatar</span>
              
              <div className="w-20 h-20 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center text-xl font-bold text-stone-900 overflow-hidden">
                {profileName.charAt(0)}
              </div>

              <div className="space-y-1.5 w-full max-w-[150px]">
                <button
                  type="button"
                  onClick={() => triggerToast('Avatar updates are currently restricted under proxy.')}
                  className="w-full px-2.5 py-1.5 bg-[#FAF9F5] hover:bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-semibold transition-colors"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Profile fields */}
            <div className="lg:col-span-9 space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Your Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs bg-stone-50/50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 font-medium text-stone-905"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Contact Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full text-xs bg-stone-50/55 border border-stone-150 p-3 rounded-xl focus:outline-none text-stone-400 font-mono select-all"
                    disabled
                  />
                  <span className="text-[9px] text-stone-400 italic block">Account key binding cannot be modified.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-2 text-stone-900 text-xs font-semibold bg-white border border-stone-250 hover:bg-stone-50 rounded-lg"
                >
                  Change Password
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold rounded-xl"
                >
                  Update Profile
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Change password modal overlay */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-stone-950/10 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-stone-200 rounded-3xl p-8 max-w-sm w-full text-left space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm font-bold text-stone-900">Change Password</h3>
                  <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded-full text-stone-400 hover:text-stone-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Current Password</label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">New Password</label>
                    <input
                      type="password"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-3.5 py-1.5 border border-stone-205 text-stone-405 hover:bg-stone-50 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-850 text-white font-bold rounded"
                    >
                      Rotate Password Key
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 4 — AI MODEL KEYS */}
      <section className="space-y-6" id="settings-ai-keys">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Independent Sandbox</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">AI Model Keys</h2>
          </div>
          <span className="text-xs font-mono text-[#9D8055] font-bold">Private encryption</span>
        </div>

        <p className="text-xs text-stone-500 max-w-3xl leading-relaxed">
          Provide your credentials below to enable custom AI workers. No key ever leaves your browser window. Keys are stored safely in your local session. Specify any provider label or key you want.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Keys List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-stone-200 bg-white rounded-3xl overflow-hidden shadow-3xs">
              <div className="p-4 bg-stone-50 border-b border-stone-200 text-[10px] font-semibold text-stone-405 font-mono flex items-center justify-between">
                <span>ACTIVE DEPLOYED KEY</span>
                <span>DECRYPTION AND DISPOSAL CONTROL</span>
              </div>

              {modelKeys.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No active model keys. Add a key below to run custom background workers.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {modelKeys.map(item => (
                    <div
                      key={item.id}
                      className="p-5 hover:bg-stone-50/25 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-stone-800 text-left"
                    >
                      {/* Name / provider */}
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0" />
                        <div>
                          <p className="font-bold text-stone-950 font-sans">{item.name}</p>
                          <p className="text-[10px] font-mono text-stone-400 mt-0.5">{item.mask || '•••••••••'}</p>
                        </div>
                      </div>

                      {/* Delete controller */}
                      <div className="text-right flex items-center gap-2">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[8.5px] font-mono tracking-widest uppercase bg-[#FAF9F5] border border-stone-200 text-stone-600 font-bold">
                          Active Sandbox
                        </span>
                        <button
                          onClick={() => handleRemoveModelKey(item.id, item.name)}
                          className="px-2.5 py-1.5 border border-red-200 text-[10px] font-bold text-red-650 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        >
                          Delete key
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form to Add Any Number of Keys */}
          <div className="lg:col-span-5">
            <form onSubmit={handleAddNewKey} className="bg-[#FCFCFA] border border-stone-200/90 rounded-3xl p-6 lg:p-8 space-y-5 text-left">
              <div>
                <h3 className="text-xs font-bold text-stone-900 font-sans">Add Model API Key</h3>
                <p className="text-[10px] text-stone-400 mt-1">Register any API provider or credentials securely inside your private dashboard space.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block font-bold">Key Label / Provider Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI GPT-4o, Google Gemini, Ollama Local"
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900 font-medium placeholder-stone-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block font-bold">API Security Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your private API key string"
                    value={newKeySecret}
                    onChange={(e) => setNewKeySecret(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-950 text-stone-900 font-mono placeholder-stone-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-xs"
              >
                Save Secure Key
              </button>

              <div className="flex items-start gap-2 pt-1">
                <Shield className="w-3.5 h-3.5 text-[#9D8055] shrink-0 mt-0.5" />
                <span className="text-[9px] text-stone-400 leading-normal">
                  Private & localized execution. Checked variables are never saved to central databases. Keep it locally secure.
                </span>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* SECTION 5 — CONNECTED APPS */}
      <section className="space-y-6" id="settings-connected-apps">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Integrations</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Connected Apps</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">External connections</span>
        </div>

        <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
          Manage integrations linked dynamically to your AI workers. Apps enable automated reading and action loops.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {appsConfig.map(app => {
            const currentStatus = activeApps.find(a => a.name === app.name);
            const isConnected = currentStatus ? currentStatus.connected : false;
            const descriptionText = currentStatus ? currentStatus.desc : 'Provides customizable business parameters action triggers';

            return (
              <div
                key={app.name}
                className="bg-white border border-stone-200/90 rounded-2xl p-6 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-[190px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl select-none" role="img" aria-label={app.name}>
                      {app.icon}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-stone-950' : 'bg-stone-200'}`} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-950 font-sans leading-tight">{app.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                      {descriptionText}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-50 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-stone-400">
                    {isConnected ? 'Linked' : 'Offline'}
                  </span>

                  <div className="flex gap-1.5">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleAppReconnect(app.name)}
                          className="px-2 py-1 text-[9px] font-semibold text-stone-500 hover:text-stone-900 bg-stone-50 rounded-md hover:bg-stone-100 transition"
                        >
                          Reconnect
                        </button>
                        <button
                          onClick={() => onToggleApp(app.name)}
                          className="px-2 py-1 text-[9px] font-bold text-red-650 hover:text-red-800 hover:bg-red-50 border border-stone-105 rounded-md text-center shrink-0"
                        >
                          Disable
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onToggleApp(app.name)}
                        className="px-3 py-1 bg-stone-950 text-white rounded-md text-[10px] font-bold hover:bg-stone-850 cursor-pointer"
                      >
                        Authorize
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 6 — PRIVACY + PERMISSIONS */}
      <section className="space-y-6" id="settings-privacy-options">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Access Parameters</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Privacy & Permissions</h2>
          </div>
          <span className="text-xs font-mono text-[#9D8055] font-bold">100% Restricted baseline</span>
        </div>

        <p className="text-xs text-stone-500 max-w-3xl leading-relaxed">
          Ensure extreme corporate safety. Everything in Octo is heavily locked. Toggle switches below to allow automatic worker routing triggers.
        </p>

        <div className="bg-[#FAF9F5] rounded-3xl border border-stone-200/90 p-8 space-y-6 max-w-4xl text-left">
          
          {/* Option A */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-stone-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-950">Require Approval Before Public Posting</span>
                <span className="text-[8px] font-mono tracking-widest uppercase bg-stone-900 font-bold px-1.5 py-0.5 rounded text-white">
                  Highly recommended
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-light leading-normal">
                If an AI worker generates updates, marketing copies, or lists digital products, always pause execution and request human manager keys verify drafting.
              </p>
            </div>
            
            <button
              onClick={() => togglePrivacy('approvalForPublicPosting')}
              className="focus:outline-none cursor-pointer text-stone-900 shrink-0 mt-1"
            >
              {privacyOptions.approvalForPublicPosting ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          {/* Option B */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-stone-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-950">Require Approval Before Dispatched Emails</span>
              <p className="text-[11px] text-stone-500 font-light leading-normal">
                Prevents accidental autonomous email transmissions. Integrates human workspace checks before worker replies trigger.
              </p>
            </div>
            
            <button
              onClick={() => togglePrivacy('approvalForEmails')}
              className="focus:outline-none cursor-pointer text-stone-900 shrink-0 mt-1"
            >
              {privacyOptions.approvalForEmails ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          {/* Option C */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-stone-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-950">Strict Isolated Team Account Access</span>
              <p className="text-[11px] text-stone-500 font-light leading-normal">
                Restricts standard colleagues from accessing model configuration keys or commercial ledgers. Only administrators can alter.
              </p>
            </div>
            
            <button
              onClick={() => togglePrivacy('teamAccessRestricted')}
              className="focus:outline-none cursor-pointer text-stone-900 shrink-0 mt-1"
            >
              {privacyOptions.teamAccessRestricted ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          {/* Option D */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-stone-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-950">Physical File Sandbox Boundaries</span>
              <p className="text-[11px] text-stone-500 font-light leading-normal">
                Newly uploaded manuals or corporate wikis are read-only. AI workers cannot overwrite core files.
              </p>
            </div>
            
            <button
              onClick={() => togglePrivacy('fileAccessRestricted')}
              className="focus:outline-none cursor-pointer text-stone-900 shrink-0 mt-1"
            >
              {privacyOptions.fileAccessRestricted ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          {/* Option E */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-950">Isolated AI Employee sandbox limits</span>
              <p className="text-[11px] text-stone-500 font-light leading-normal">
                Limit maximum simultaneous triggers each worker can run in 1 hour. Prevent runaway model API cost consumption.
              </p>
            </div>
            
            <button
              onClick={() => togglePrivacy('workerRestricted')}
              className="focus:outline-none cursor-pointer text-stone-900 shrink-0 mt-1"
            >
              {privacyOptions.workerRestricted ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 7 — NOTIFICATIONS */}
      <section className="space-y-6" id="settings-notifications-block">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Alert Subscriptions</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Notifications</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Activity updates</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 space-y-6 max-w-4xl text-left">
          
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">Workflow completion metrics dispatch</span>
              <span className="text-[10px] text-stone-400">Send summary digest when sequential actions end successfully.</span>
            </div>
            <button onClick={() => toggleNotification('onCompleted')} className="focus:outline-none cursor-pointer">
              {notificationConfig.onCompleted ? (
                <ToggleRight className="w-10 h-6 text-stone-90 */" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-50 pt-4">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">Approval request dispatch alerts</span>
              <span className="text-[10px] text-stone-400">Trigger immediate web push alert when custom action ledger holds for verification.</span>
            </div>
            <button onClick={() => toggleNotification('onApproval')} className="focus:outline-none cursor-pointer">
              {notificationConfig.onApproval ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-50 pt-4">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">Worker emergency stop messages</span>
              <span className="text-[10px] text-stone-400">Issue SMS notification if an API failure occurs on model credentials.</span>
            </div>
            <button onClick={() => toggleNotification('onStopped')} className="focus:outline-none cursor-pointer">
              {notificationConfig.onStopped ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-50 pt-4">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">Commercial marketplace downloads</span>
              <span className="text-[10px] text-stone-400">Acknowledge sales alerts when developers license components.</span>
            </div>
            <button onClick={() => toggleNotification('onDownload')} className="focus:outline-none cursor-pointer">
              {notificationConfig.onDownload ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-50 pt-4">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">File upload checksum records</span>
              <span className="text-[10px] text-stone-400">Log activity when colleagues add documents to company sandbox.</span>
            </div>
            <button onClick={() => toggleNotification('onUpload')} className="focus:outline-none cursor-pointer">
              {notificationConfig.onUpload ? (
                <ToggleRight className="w-10 h-6 text-stone-950" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-stone-300" />
              )}
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 8 — STORAGE & FILES */}
      <section className="space-y-6 animate-fade-in" id="settings-storage-block">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">Archives Data</span>
            <h2 className="text-lg font-bold text-stone-900 font-sans">Storage & Files</h2>
          </div>
          <span className="text-xs font-mono text-[#9D8055] font-bold">Encrypted Sandbox</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Flat Statistics Block */}
          <div className="lg:col-span-4 bg-[#FCFCFA] border border-stone-200 rounded-3xl p-6 lg:p-8 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">Aggregate Capacity</span>
              <span className="text-4xl font-mono text-stone-950 font-bold mt-2 block">
                {companyFiles.length} file{companyFiles.length !== 1 ? 's' : ''}
              </span>
              <p className="text-[10.5px] text-stone-400 mt-1">Active files residing inside your local workspace storage allocations.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-150">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Workspace allocation</span>
                <span className="font-mono text-stone-900">2.0 GB Standard</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Utilized volume</span>
                <span className="font-mono text-stone-900 font-bold">~ 20.6 MB</span>
              </div>
            </div>

            <div className="pt-2">
              <input
                type="file"
                id="settings-files-upload-simulation"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('settings-files-upload-simulation')?.click()}
                className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Custom Files</span>
              </button>
            </div>
          </div>

          {/* Recent list */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 space-y-4">
            <span className="text-[9.5px] font-mono uppercase text-stone-400 tracking-wider block font-bold text-left">Recent Upload Register</span>
            
            <div className="divide-y divide-stone-100">
              {recentUploads.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No files have been registered yet.</p>
              ) : (
                recentUploads.slice(0, 4).map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5 text-left text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-[#9D8055]" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-950 break-all">{file.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">Size parameters: {file.size}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-405 shrink-0 ml-4">{file.uploadedAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 9 — DANGER ZONE */}
      <section className="space-y-6" id="settings-danger-zone-container">
        <div className="border-b border-red-100 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-red-500 font-bold tracking-wider">Unrecoverable Operations</span>
            <h2 className="text-lg font-bold text-red-650 font-sans">Danger Zone</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">Irreversible parameters</span>
        </div>

        <div className="bg-red-50/20 border border-red-200 rounded-3xl p-8 lg:p-10 text-left space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Action 1 */}
            <div className="bg-white border border-[#fbdcdb] rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-stone-950">Disconnect All Saved Connections</p>
                <p className="text-[10px] text-stone-405 leading-relaxed mt-1">
                  Revokes permission tokens for Gmail, Notion, Slack, Shopify, Stripe, and others, completely flushing cached keys.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerToast('All app tokens invalidated and removed.');
                  if (onAddActivity) {
                    onAddActivity('All external app permissions revoked securely.', 'System');
                  }
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#111] text-[10px] font-bold rounded"
              >
                Flush App Keys
              </button>
            </div>

            {/* Action 2 */}
            <div className="bg-white border border-[#fbdcdb] rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-stone-955">Reset Model Registry</p>
                <p className="text-[10px] text-stone-405 leading-relaxed mt-1">
                  Clears all local AI integration credential blocks stored in your immediate browser memory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModelKeys(prev => prev.map(m => ({ ...m, connected: false, mask: '', inputValue: '' })));
                  triggerToast('Model encryption cache deleted from session memory.');
                  if (onAddActivity) {
                    onAddActivity('Rotated API keychain: Clear session memories.', 'System');
                  }
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#111] text-[10px] font-bold rounded"
              >
                Clear Keychain Cache
              </button>
            </div>

            {/* Action 3 */}
            <div className="bg-white border border-[#fbdcdb] rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-red-700">Terminate Active Workspace</p>
                <p className="text-[10px] text-stone-405 leading-relaxed mt-1">
                  Deletes all autonomous workers, workflows, logs, files, activity histories, and indexes permanently.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteShow(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white hover:text-white text-[10px] font-bold rounded-lg"
              >
                Terminate Entire Workspace
              </button>
            </div>

          </div>
        </div>

        {/* Delete Confirm Modal Overlay */}
        <AnimatePresence>
          {confirmDeleteShow && (
            <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-red-158 rounded-3xl p-8 max-w-sm w-full text-left space-y-6 shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-red-700 font-bold border-b pb-3">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold font-sans">Danger: Immediate Destruction</span>
                </div>

                <div className="space-y-3 text-xs text-stone-600 leading-relaxed font-sans">
                  <p>You are requesting the complete termination of <strong>{workspaceName}</strong>.</p>
                  <p className="text-stone-450 italic">This cannot be restored or undone. All files, workers settings, billing data drafts, and activities indexes will be wiped completely from this console.</p>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-400 font-bold block">Type DELETE to proceed:</label>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="DELETE"
                      className="w-full p-2 border border-stone-250 bg-stone-50 rounded font-mono text-center text-xs tracking-widest focus:outline-none focus:ring-1 focus:ring-red-650 font-bold text-stone-950"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteShow(false);
                      setDeleteInput('');
                    }}
                    className="px-3 py-1.5 border hover:bg-stone-50 rounded"
                  >
                    Keep Workspace Safe
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteWorkspaceForever}
                    disabled={deleteInput !== 'DELETE'}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded font-bold"
                  >
                    Destroy Node
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="text-center pt-8 border-t border-stone-105" id="settings-footer-info">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
          <p>Octo Security Protocols — Version 2.0</p>
          <p className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#9D8055]" />
            <span>Private Local Sandbox active</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
