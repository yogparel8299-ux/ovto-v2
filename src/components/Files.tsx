"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Upload, Folder, Shield, Sliders, Play, 
  Trash2, Search, Check, RefreshCw, X, Eye, Lock, 
  ArrowRight, Users, Globe, Building, Sparkles, CheckCircle2,
  LockKeyhole, UserCheck, Settings, BookOpen, FileSpreadsheet, Briefcase
} from 'lucide-react';
import { AIWorker, MockFile } from '@/types';
import { useCompanyId } from '@/lib/use-company-id';
import { fetchActivityLogs } from '@/lib/supabase/activity';

interface FilesProps {
  companyFiles: MockFile[];
  onSetCompanyFiles: React.Dispatch<React.SetStateAction<MockFile[]>>;
  onAddActivity: (activityText: string, workerName: string) => void;
  onSetActiveTab: (tab: any) => void;
  workersList: AIWorker[];
}

// Internal extended file interface to hold extra properties
interface RichFile extends MockFile {
  id: string;
  tag: 'Finance' | 'Support' | 'Suppliers' | 'Marketing' | 'Operations' | 'Legal';
  privacyStatus: 'Private' | 'Shared with Team' | 'Published';
  connectedWorkers: string[];
  allowReadOnly: boolean;
  notes?: string;
  folderName?: string;
}

export default function Files({
  companyFiles,
  onSetCompanyFiles,
  onAddActivity,
  onSetActiveTab,
  workersList
}: FilesProps) {
  const { companyId } = useCompanyId();
  const [richFiles, setRichFiles] = useState<RichFile[]>([]);
  
  // Track synchronization with parent companyFiles prop
  useEffect(() => {
    // Merge or initialize richFiles
    const initialRich: RichFile[] = companyFiles.map((file, idx) => {
      // Intelligently assign tags and workers based on the filename to maintain perfect logical consistency
      let tag: RichFile['tag'] = 'Operations';
      let workers: string[] = [];
      const nameLower = file.name.toLowerCase();
      
      if (nameLower.includes('refund') || nameLower.includes('support') || nameLower.includes('faq')) {
        tag = 'Support';
        workers = workersList.length > 0 ? [workersList[0].name] : [];
      } else if (nameLower.includes('supplier') || nameLower.includes('shipping') || nameLower.includes('transit') || nameLower.includes('cargo')) {
        tag = 'Suppliers';
        workers = workersList.length > 1 ? [workersList[1].name] : workersList.length > 0 ? [workersList[0].name] : [];
      } else if (nameLower.includes('brand') || nameLower.includes('marketing') || nameLower.includes('copy')) {
        tag = 'Marketing';
        workers = workersList.filter((w) => w.role === 'Marketing').map((w) => w.name).slice(0, 1);
      } else if (nameLower.includes('balance') || nameLower.includes('tax') || nameLower.includes('ledger') || nameLower.includes('finance') || nameLower.includes('payout')) {
        tag = 'Finance';
        workers = workersList.filter((w) => w.role === 'Finance').map((w) => w.name).slice(0, 1);
      } else if (nameLower.includes('legal') || nameLower.includes('contract') || nameLower.includes('agreement') || nameLower.includes('compliance')) {
        tag = 'Legal';
        workers = [];
      }

      return {
        id: `file-existing-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type || 'PDF',
        uploadedAt: file.uploadedAt || 'Yesterday',
        tag,
        privacyStatus: 'Private', // Everything defaults to Private as instructed
        connectedWorkers: workers,
        allowReadOnly: true,
        notes: `Standard business reference context.`,
        folderName: 'Core Docs'
      };
    });

    // Only set if we haven't initialized or if size mismatch
    if (richFiles.length === 0) {
      setRichFiles(initialRich);
    }
  }, [companyFiles]);

  // Synchronize internal state back to parent companyFiles array
  const syncToParent = (updatedRich: RichFile[]) => {
    const parentList: MockFile[] = updatedRich.map(r => ({
      name: r.name,
      size: r.size,
      type: r.type,
      uploadedAt: r.uploadedAt
    }));
    onSetCompanyFiles(parentList);
  };

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string>('');
  const [selectedFileForPermissions, setSelectedFileForPermissions] = useState<RichFile | null>(null);
  
  // Custom folder state
  const [folders, setFolders] = useState<string[]>(['Core Docs', 'Q2 Workbooks', 'Policies', 'Unsorted']);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('All');
  const [newFolderNameInput, setNewFolderNameInput] = useState<string>('');
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);

  const [activityLogs, setActivityLogs] = useState<
    { id: string; text: string; time: string; icon: typeof LinkIcon }[]
  >([]);

  useEffect(() => {
    if (!companyId) return;
    fetchActivityLogs(companyId, 10).then((logs) =>
      setActivityLogs(
        logs.map((l) => ({
          id: l.id,
          text: l.text,
          time: l.time,
          icon: LinkIcon,
        }))
      )
    );
  }, [companyId]);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers to push custom activities
  const logLocalActivity = (text: string, icon: any) => {
    setActivityLogs(prev => [
      { id: `act-loc-${Date.now()}`, text, time: 'Just now', icon },
      ...prev
    ]);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let addedCount = 0;
    const updatedRich = [...richFiles];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // File classification based on extension
      let tag: RichFile['tag'] = 'Operations';
      let fileType = 'Document';
      const ext = f.name.split('.').pop()?.toLowerCase();
      
      if (ext === 'pdf') {
        fileType = 'PDF';
      } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        fileType = 'Spreadsheet';
      } else if (ext === 'docx' || ext === 'doc') {
        fileType = 'Document';
      } else if (ext === 'json') {
        fileType = 'Dataset';
      }

      const nameLower = f.name.toLowerCase();
      if (nameLower.includes('refund') || nameLower.includes('support') || nameLower.includes('faq')) {
        tag = 'Support';
      } else if (nameLower.includes('supplier') || nameLower.includes('shipping') || nameLower.includes('transit') || nameLower.includes('cargo') || nameLower.includes('inventory')) {
        tag = 'Suppliers';
      } else if (nameLower.includes('brand') || nameLower.includes('marketing') || nameLower.includes('copy') || nameLower.includes('social')) {
        tag = 'Marketing';
      } else if (nameLower.includes('balance') || nameLower.includes('tax') || nameLower.includes('ledger') || nameLower.includes('finance') || nameLower.includes('payout')) {
        tag = 'Finance';
      } else if (nameLower.includes('legal') || nameLower.includes('contract') || nameLower.includes('agreement') || nameLower.includes('compliance')) {
        tag = 'Legal';
      }

      // Format physical file size
      const sizeStr = f.size > 1024 * 1024
        ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (f.size / 1024).toFixed(1) + ' KB';

      const newRich: RichFile = {
        id: `file-uploaded-${Date.now()}-${i}`,
        name: f.name,
        size: sizeStr,
        type: fileType,
        uploadedAt: 'Just now',
        tag,
        privacyStatus: 'Private', // MUST default to Private as instructed
        connectedWorkers: [],
        allowReadOnly: true,
        notes: `Custom uploaded file. Safeguarded inside company containers.`,
        folderName: 'Unsorted'
      };

      updatedRich.unshift(newRich);
      addedCount++;

      // Trigger global and local activity alerts
      onAddActivity(`Uploaded company file "${f.name}" safely to your private vault.`, 'System');
      logLocalActivity(`Uploaded and locked "${f.name}" into private workspace.`, LockIcon);
    }

    setRichFiles(updatedRich);
    syncToParent(updatedRich);

    setSuccessBanner(`${addedCount} file${addedCount > 1 ? 's' : ''} uploaded and safely secured!`);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    const updated = richFiles.filter(f => f.id !== fileId);
    setRichFiles(updated);
    syncToParent(updated);
    
    if (selectedFileForPermissions?.id === fileId) {
      setSelectedFileForPermissions(null);
    }

    onAddActivity(`Permanently deleted file "${fileName}" from company files.`, 'System');
    logLocalActivity(`Permanently removed "${fileName}" to clear cache space.`, TrashIcon);

    setSuccessBanner(`"${fileName}" deleted successfully.`);
    setTimeout(() => setSuccessBanner(''), 3000);
  };

  // Toggle dynamic file parameters
  const handleTogglePrivacy = (fileId: string, currentStatus: RichFile['privacyStatus']) => {
    const statuses: RichFile['privacyStatus'][] = ['Private', 'Shared with Team', 'Published'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    const updated = richFiles.map(f => {
      if (f.id === fileId) {
        logLocalActivity(`Updated privacy of "${f.name}" to: ${nextStatus}.`, ShieldIcon);
        return { ...f, privacyStatus: nextStatus };
      }
      return f;
    });

    setRichFiles(updated);
    syncToParent(updated);
    
    if (selectedFileForPermissions?.id === fileId) {
      setSelectedFileForPermissions(updated.find(f => f.id === fileId) || null);
    }
  };

  const handleToggleWorkerAccess = (fileId: string, workerName: string) => {
    const updated = richFiles.map(f => {
      if (f.id === fileId) {
        const index = f.connectedWorkers.indexOf(workerName);
        let newWorkers = [...f.connectedWorkers];
        if (index > -1) {
          newWorkers.splice(index, 1);
          logLocalActivity(`Revoked access to "${f.name}" for worker ${workerName}`, TrashIcon);
        } else {
          newWorkers.push(workerName);
          logLocalActivity(`Granted access to "${f.name}" for worker ${workerName}`, FileCheckIcon);
        }
        return { ...f, connectedWorkers: newWorkers };
      }
      return f;
    });

    setRichFiles(updated);
    syncToParent(updated);

    if (selectedFileForPermissions?.id === fileId) {
      setSelectedFileForPermissions(updated.find(f => f.id === fileId) || null);
    }
  };

  const handleToggleReadOnly = (fileId: string, currentReadOnly: boolean) => {
    const updated = richFiles.map(f => {
      if (f.id === fileId) {
        return { ...f, allowReadOnly: !currentReadOnly };
      }
      return f;
    });
    setRichFiles(updated);
    syncToParent(updated);

    if (selectedFileForPermissions?.id === fileId) {
      setSelectedFileForPermissions(updated.find(f => f.id === fileId) || null);
    }
  };

  const handleAddNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderNameInput.trim()) return;
    if (folders.includes(newFolderNameInput.trim())) return;

    setFolders([...folders, newFolderNameInput.trim()]);
    setNewFolderNameInput('');
    setShowFolderModal(false);
    
    logLocalActivity(`Created virtual folder directory "${newFolderNameInput.trim()}"`, FolderIcon);
  };

  const handleAssignFileToFolder = (fileId: string, folderName: string) => {
    const updated = richFiles.map(f => {
      if (f.id === fileId) {
        return { ...f, folderName };
      }
      return f;
    });
    setRichFiles(updated);
    syncToParent(updated);

    if (selectedFileForPermissions?.id === fileId) {
      setSelectedFileForPermissions(updated.find(f => f.id === fileId) || null);
    }

    logLocalActivity(`Reallocated asset in folder: ${folderName}`, FolderIcon);
  };

  // Filter & search files
  const filteredFiles = richFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          f.tag.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || f.tag === selectedCategory;
    const matchesFolder = selectedFolderFilter === 'All' || f.folderName === selectedFolderFilter;

    return matchesSearch && matchesCategory && matchesFolder;
  });

  return (
    <div className="space-y-32 py-6 font-sans relative" id="files-page-module-container">
      
      {/* SECTION 1 — HERO */}
      <section className="space-y-8 max-w-4xl" id="files-hero">
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold block">
            Workspace Assets
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-stone-950 font-sans leading-none">
            Your company files.
          </h1>
          <h2 className="text-base text-stone-500 font-light leading-relaxed max-w-2xl pt-2">
            Upload files your AI workers can use to help run your business. Connect spreadsheets, reference policies, PDFs, and legal blueprints safely in one place.
          </h2>
        </div>

        {/* Buttons and Minimal Trust Banner */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const target = document.getElementById('massive-file-upload-block');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="bg-stone-950 hover:bg-stone-850 text-white font-medium text-xs px-8 py-4 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={() => onSetActiveTab('builder')}
              className="bg-transparent border border-stone-200 hover:border-stone-400 text-stone-800 hover:bg-stone-50 font-medium text-xs px-8 py-4 rounded-xl transition-all cursor-pointer"
            >
              Open Builder
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono text-stone-400 select-none">
            <span className="flex items-center gap-1.5 font-medium">
              <LockKeyhole className="w-3 h-3 text-stone-950" /> Private by default
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-stone-950" /> Used by your AI workers
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-stone-950" /> Secure company storage
            </span>
          </div>
        </div>
      </section>

      {/* FEEDBACK FIXED BANNER */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-stone-950 text-white rounded-xl border border-stone-850 text-xs font-semibold text-center fixed top-24 right-12 z-50 shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2 — LARGE FILE UPLOAD AREA */}
      <section className="space-y-6" id="massive-file-upload-block">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Secure Intake Dropzone</span>
          <h3 className="text-sm font-bold text-stone-900 font-mono">Central Data Integration</h3>
        </div>

        {/* The Massive Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group w-full min-h-[380px] bg-white border rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-6 select-none relative overflow-hidden ${
            dragActive 
              ? 'border-stone-950 bg-stone-50/50' 
              : 'border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/20'
          }`}
          id="massive-intake-dropzone"
        >
          {/* Decorative Corner lines for the premium SaaS look */}
          <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-stone-300 group-hover:border-stone-900 transition-colors" />
          <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-stone-300 group-hover:border-stone-900 transition-colors" />
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-stone-300 group-hover:border-stone-900 transition-colors" />
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-stone-300 group-hover:border-stone-900 transition-colors" />

          {/* Icon visual */}
          <div className="w-16 h-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6 text-stone-950" />
          </div>

          <div className="space-y-2 max-w-md">
            <span className="text-lg font-medium text-stone-950 block">
              Upload Company Files
            </span>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Drag and drop any files here, or click anywhere to select local files from your device.
            </p>
          </div>

          {/* Subheading list of supported items */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] font-mono text-stone-400/80 max-w-xl">
            <span>pdfs</span>•<span>spreadsheets</span>•<span>documents</span>•<span>csvs</span>•<span>datasets</span>•<span>SOPs</span>•<span>pricing sheets</span>•<span>inventory files</span>•<span>contracts</span>•<span>company docs</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.json"
          />
        </div>
      </section>

      {/* SECTION 4 — HOW AI WORKERS USE FILES (Placed logically for immediate clarity) */}
      <section className="space-y-8" id="ai-context-explanation">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">How It Works</span>
          <h3 className="text-sm font-bold text-stone-900 font-mono">Business Knowledge Allocation</h3>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed max-w-xl font-sans">
          Your AI specialists automatically match the files you provide to the corresponding business tasks they perform. No setup required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[
            {
              role: 'Finance Specialist',
              example: 'Finance specialist uses spreadsheets',
              description: 'Processes payment payouts, verifies transaction ledger details, and compiles balanced company sheets.',
              fileIcon: FileSpreadsheet,
              tagColor: 'text-stone-700 bg-stone-100'
            },
            {
              role: 'Support Specialist',
              example: 'Support specialist uses company policies',
              description: 'Answers customer billing tickets, processes standard refund rules, and ensures absolute procedural safety.',
              fileIcon: BookOpen,
              tagColor: 'text-stone-700 bg-stone-100'
            },
            {
              role: 'Supplier Manager',
              example: 'Operations specialist uses pricing sheets',
              description: 'Updates stock schedules, evaluates cargo delays, and drafts supplier communications using stock logs.',
              fileIcon: Briefcase,
              tagColor: 'text-stone-700 bg-stone-100'
            },
            {
              role: 'Marketing Specialist',
              example: 'Marketing specialist uses brand docs',
              description: 'Drafts approved news campaigns, references tone-of-voice directives, and frames newsletters with style parameters.',
              fileIcon: FileText,
              tagColor: 'text-stone-700 bg-stone-100'
            }
          ].map((item, idx) => {
            const Icon = item.fileIcon;
            return (
              <div 
                key={idx} 
                className="bg-[#FCFCFB] border border-stone-200/70 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-stone-350 transition-all text-left"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">{item.role}</span>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-stone-905 shrink-0" />
                    <span className="text-xs font-bold text-stone-900">{item.example}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-sans">{item.description}</p>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-mono text-stone-405">Automatic sync protection active</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5 — FILE ORGANIZATION (Simple categorization filtering & Search) */}
      <section className="space-y-8" id="file-organization-controls">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Organization Hub</span>
          <h3 className="text-sm font-bold text-stone-900 font-mono">Folders & Filters</h3>
        </div>

        {/* Minimal control filter strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2" id="filter-bar">
          {/* Quick Categories filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-stone-400 mr-2">Category:</span>
            {['All', 'Finance', 'Support', 'Suppliers', 'Marketing', 'Operations', 'Legal'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-950 text-white font-semibold'
                    : 'bg-[#FCFCFA] text-stone-605 border border-stone-150 hover:border-stone-300 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search company files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-stone-200 pl-9 pr-8 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-950 placeholder-stone-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-stone-405 hover:text-stone-950 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Folder filter strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-1 text-xs text-stone-400 mr-2 font-mono">
            <Folder className="w-3.5 h-3.5" />
            <span>Virtual Folder:</span>
          </div>
          {['All', ...folders].map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolderFilter(folder)}
              className={`px-2.5 py-1 text-xs rounded font-sans cursor-pointer transition-all ${
                selectedFolderFilter === folder
                  ? 'bg-stone-100 text-stone-900 font-bold border-b border-stone-950'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {folder}
            </button>
          ))}
          
          <button
            onClick={() => setShowFolderModal(true)}
            className="text-[11px] font-mono text-[#9D8055] hover:text-[#7A613E] underline cursor-pointer ml-2"
          >
            + Create virtual folder
          </button>
        </div>

        {/* Modal for new folder directory */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-stone-900/10 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl border border-stone-200 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-950 uppercase tracking-wider font-mono">New Virtual Folder</span>
                <button onClick={() => setShowFolderModal(false)} className="text-stone-400 hover:text-stone-950">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-stone-450 leading-normal">
                Organize files in folders for clean layouts without physical system storage overhead. Only AI workers use it to keep track.
              </p>
              <form onSubmit={handleAddNewFolder} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Invoices 2026, Refund Rules"
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-2.5 rounded-lg"
                >
                  Create Folder
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </section>

      {/* SECTION 3 — RECENT FILES (The spacious files list) */}
      <section className="space-y-6" id="files-list-section">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Secure Assets</span>
            <h3 className="text-sm font-bold text-stone-900 font-mono">Recent Files ({filteredFiles.length})</h3>
          </div>
          <p className="text-[11px] text-stone-450 font-sans">
            Showing {filteredFiles.length} of {richFiles.length} files total. Always encrypted.
          </p>
        </div>

        {/* The spacious files table list */}
        {filteredFiles.length === 0 ? (
          <div className="p-16 border border-dashed border-stone-200 rounded-2xl text-center bg-[#FCFCFA]/40">
            <FileText className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-xs font-medium text-stone-900">No company files match your current filters.</p>
            <p className="text-[11px] text-stone-400 mt-1">Try resetting the tags, search query, or upload a new file.</p>
          </div>
        ) : (
          <div className="border border-stone-200 bg-white rounded-2xl divide-y divide-stone-100/90 overflow-hidden shadow-xs">
            {/* Header placeholder line for readability */}
            <div className="p-4 bg-[#FCFCFA] text-[10px] font-semibold text-stone-400 font-mono grid grid-cols-12 gap-4 hidden sm:grid">
              <div className="col-span-5">FILE NAME</div>
              <div className="col-span-2">CATEGORY</div>
              <div className="col-span-1">SIZE</div>
              <div className="col-span-2">CONNECTED WORKERS</div>
              <div className="col-span-1.5 text-center">PRIVACY</div>
              <div className="col-span-0.5 text-right">ACTION</div>
            </div>

            {filteredFiles.map((file) => (
              <div 
                key={file.id} 
                className="p-5 hover:bg-stone-50/40 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs text-stone-800"
              >
                {/* File Title Icon */}
                <div className="col-span-12 sm:col-span-5 flex items-start gap-3">
                  <div className="w-9 h-9 border border-stone-150 bg-[#FCFCFA] rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-3xs">
                    <FileText className="w-4 h-4 text-stone-900" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-stone-950 truncate max-w-xs">{file.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-400/90 font-mono">
                      <span>Uploaded {file.uploadedAt}</span>
                      <span>•</span>
                      <span className="text-[#9D8055] font-semibold">Folder: {file.folderName || 'Unsorted'}</span>
                    </div>
                  </div>
                </div>

                {/* Tag Category */}
                <div className="col-span-6 sm:col-span-2">
                  <span className="px-2.5 py-1 bg-stone-100 border border-stone-150 text-stone-704 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold">
                    {file.tag}
                  </span>
                </div>

                {/* Size */}
                <div className="col-span-6 sm:col-span-1 font-mono text-stone-500 font-medium">
                  {file.size}
                </div>

                {/* Connected Workers badges */}
                <div className="col-span-12 sm:col-span-2">
                  {file.connectedWorkers.length === 0 ? (
                    <span className="text-[10px] text-stone-401 italic font-light">
                      No active workers
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {file.connectedWorkers.map(w => (
                        <span key={w} className="px-1.5 py-0.5 bg-stone-50 text-stone-800 border border-stone-200 rounded text-[9.5px] font-mono leading-none">
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Badge Toggle */}
                <div className="col-span-12 sm:col-span-1.5 flex justify-start sm:justify-center">
                  <button
                    onClick={() => handleTogglePrivacy(file.id, file.privacyStatus)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono cursor-pointer font-bold transition-all flex items-center gap-1 border ${
                      file.privacyStatus === 'Private'
                        ? 'bg-[#FCFCFA] text-stone-900 border-stone-300'
                        : file.privacyStatus === 'Shared with Team'
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                    title="Click to toggle privacy setting"
                  >
                    {file.privacyStatus === 'Private' ? (
                      <Lock className="w-2.5 h-2.5" />
                    ) : file.privacyStatus === 'Shared with Team' ? (
                      <Users className="w-2.5 h-2.5 text-stone-300" />
                    ) : (
                      <Globe className="w-2.5 h-2.5 text-emerald-650" />
                    )}
                    <span>{file.privacyStatus}</span>
                  </button>
                </div>

                {/* Action Controls */}
                <div className="col-span-12 sm:col-span-0.5 flex justify-end gap-2 items-center">
                  <button
                    onClick={() => setSelectedFileForPermissions(file)}
                    className="p-1.5 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-950 transition-colors cursor-pointer"
                    title="Configure File Access & Connections"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    className="p-1.5 hover:bg-red-50 rounded text-stone-400 hover:text-red-750 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 6 — CONNECTED FILE ACCESS (Action Drawer/Modal for selected file config) */}
      <AnimatePresence>
        {selectedFileForPermissions && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 bg-[#FCFCFA] border border-stone-300 rounded-3xl p-8 md:p-10 scroll-mt-24 shadow-sm"
            id="connected-file-access-drawer"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200/50 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[#9D8055] font-bold block uppercase">Active Authorization Panel</span>
                <h4 className="text-lg font-bold text-stone-950 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-stone-950" />
                  <span>Configure: {selectedFileForPermissions.name}</span>
                </h4>
                <p className="text-xs text-stone-450">
                  Manage read/write permissions, departmental teams, and individual AI worker scopes.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFileForPermissions(null)}
                  className="bg-white border border-stone-200 hover:border-stone-450 p-2 text-stone-800 rounded-xl text-xs transition-all cursor-pointer font-semibold"
                >
                  Close Panel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Left pane: Worker Access list */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-stone-950 font-bold font-mono">
                  <Users className="w-3.5 h-3.5" />
                  <span>Individual AI Work Force Access</span>
                </div>
                <p className="text-[11px] text-stone-450 leading-relaxed max-w-sm">
                  Toggle which AI specialists maintain authorization to query or utilize this document in their active routines.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {workersList.map(w => {
                    const hasAccess = selectedFileForPermissions.connectedWorkers.includes(w.name);
                    return (
                      <div 
                        key={w.id} 
                        className="flex items-center justify-between p-3.5 bg-white border border-stone-150 rounded-xl hover:border-stone-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${w.avatarColor || 'bg-stone-100'} border`} />
                          <div>
                            <span className="text-xs font-bold text-stone-950">{w.name}</span>
                            <span className="text-[10px] block text-stone-400 font-mono">
                              Role: {w.role} Specialist
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleWorkerAccess(selectedFileForPermissions.id, w.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs leading-none font-bold transition-colors cursor-pointer ${
                            hasAccess
                              ? 'bg-stone-950 text-white'
                              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {hasAccess ? 'Access Authorized' : 'Deny Access'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right pane: Advanced security & properties */}
              <div className="space-y-6">
                
                {/* Read only scope */}
                <div className="space-y-2 p-4 bg-white border border-stone-200/80 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-950 block">Lock File as Read-Only Mode</span>
                      <span className="text-[10px] text-stone-404 font-sans block">AI workers can only reference guidelines, never modify contents.</span>
                    </div>
                    <button
                      onClick={() => handleToggleReadOnly(selectedFileForPermissions.id, selectedFileForPermissions.allowReadOnly)}
                      className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                        selectedFileForPermissions.allowReadOnly ? 'bg-stone-950' : 'bg-stone-200'
                      }`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        selectedFileForPermissions.allowReadOnly ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Move folder assignment */}
                <div className="space-y-2 p-4 bg-white border border-stone-200/80 rounded-xl">
                  <span className="text-xs font-bold font-mono text-stone-950 uppercase tracking-wide block">Directory Reallocation</span>
                  <p className="text-[10px] text-stone-450 leading-relaxed font-sans">
                    Assign this file to a custom folder inside your virtual operations map:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {folders.map(fld => (
                      <button
                        key={fld}
                        onClick={() => handleAssignFileToFolder(selectedFileForPermissions.id, fld)}
                        className={`px-2.5 py-1 text-[10px] rounded border cursor-pointer font-sans transition-all ${
                          selectedFileForPermissions.folderName === fld
                            ? 'bg-stone-950 text-white border-stone-950 font-bold'
                            : 'bg-stone-50 text-stone-605 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {fld}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Warning */}
                <div className="p-4 rounded-xl bg-[#FCFCFA]/80 border border-stone-150 flex gap-3 text-[10px] text-stone-500 font-sans leading-relaxed">
                  <Lock className="w-4 h-4 text-stone-701 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-850 block">Private File System Safety</span>
                    Your AI workers can only use files inside secure virtual execution threads. Octo never sends your data out or uploads templates publicly.
                  </div>
                </div>

              </div>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 7 — FILE ACTIVITY (Simple dynamic activity feed) */}
      <section className="space-y-8" id="file-activity-history">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Historic Ledger</span>
          <h3 className="text-sm font-bold text-stone-900 font-mono">File Activity</h3>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed max-w-xl font-sans">
          Track access records, integration changes, and worker authorizations across the secure corporate vault instantly.
        </p>

        <div className="border border-stone-200 rounded-2xl bg-white divide-y divide-stone-100 overflow-hidden shadow-3xs max-w-4xl">
          {activityLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-stone-50 border border-stone-150 rounded-lg flex items-center justify-center text-stone-900 shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-stone-800 leading-normal font-sans">{log.text}</span>
                </div>
                <span className="text-[10px] font-mono text-stone-401 shrink-0 bg-stone-50 px-2.5 py-0.5 rounded-full">
                  {log.time}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="pt-12 border-t border-stone-100/80 text-[10.5px] font-mono text-stone-400 font-medium" id="files-footer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <p className="text-stone-950 font-bold tracking-tight">octo. Private Corporate Vault System</p>
            <p className="leading-relaxed">All information remains isolated within secure business containers.</p>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-right">
            <span>Everything private by default</span>
            <span>•</span>
            <span>Standalone instances</span>
            <span>•</span>
            <span>Disclaimers released manually</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Minimal aesthetic icons for simple human representations that avoid extra clutter
function LockIcon(props: any) {
  return <Lock className="w-3.5 h-3.5" {...props} />;
}
function LinkIcon(props: any) {
  return <Check className="w-3.5 h-3.5" {...props} />;
}
function FileCheckIcon(props: any) {
  return <UserCheck className="w-3.5 h-3.5" {...props} />;
}
function SyncIcon(props: any) {
  return <RefreshCw className="w-3.5 h-3.5" {...props} />;
}
function ShieldIcon(props: any) {
  return <Shield className="w-3.5 h-3.5" {...props} />;
}
function TrashIcon(props: any) {
  return <Trash2 className="w-3.5 h-3.5" {...props} />;
}
function FolderIcon(props: any) {
  return <Folder className="w-3.5 h-3.5" {...props} />;
}
