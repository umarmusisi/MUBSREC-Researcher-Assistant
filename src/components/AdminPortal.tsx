import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Upload,
  FileText,
  Trash2,
  Download,
  Plus,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Server,
  ThumbsUp,
  ThumbsDown,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Tag,
  RefreshCw,
  Clock
} from 'lucide-react';
import { ManagedDocument, KnowledgeEntry } from '../types';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshDocuments?: () => void;
}

export default function AdminPortal({ isOpen, onClose, onRefreshDocuments }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'documents' | 'knowledge' | 'deploy' | 'feedback' | 'settings'>('documents');

  // Documents State
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Protocol' | 'Consent' | 'Checklist' | 'Fee Schedule' | 'Guidelines' | 'Other'>('Protocol');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Knowledge Base State
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kbTitle, setKbTitle] = useState('');
  const [kbCategory, setKbCategory] = useState<'General' | 'Submission' | 'Review Process' | 'Fees & Banking' | 'Post-Approval' | 'Contacts'>('General');
  const [kbKeywords, setKbKeywords] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbAuthor, setKbAuthor] = useState('Secretariat Staff');
  const [kbSuccess, setKbSuccess] = useState('');

  // Feedback State
  const [feedbackStats, setFeedbackStats] = useState<{
    total: number;
    thumbsUp: number;
    thumbsDown: number;
    satisfactionRate: number;
    recentFeedback: any[];
  } | null>(null);

  // Settings State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Copy state for deployment config
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch initial data on open if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments();
      loadKnowledge();
      loadFeedback();
    }
  }, [isAuthenticated]);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (onRefreshDocuments) onRefreshDocuments();
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const loadKnowledge = async () => {
    setIsLoadingKnowledge(true);
    try {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      if (data.entries) {
        setKnowledgeEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to load knowledge entries:', err);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await fetch('/api/feedback/stats');
      const data = await res.json();
      setFeedbackStats(data);
    } catch (err) {
      console.error('Failed to load feedback stats:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the Secretariat passcode.');
      return;
    }
    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasscode('');
      } else {
        setAuthError(data.error || 'Invalid passcode. Please try again.');
      }
    } catch (err) {
      setAuthError('Network error connecting to verification service.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('documents');
    setAuthError('');
  };

  // Upload handler
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please specify a title for the document.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle.trim());
    formData.append('category', uploadCategory);
    formData.append('description', uploadDescription.trim());
    formData.append('isOfficial', 'true');

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(`Successfully published "${uploadTitle}" for researcher downloads.`);
        setUploadTitle('');
        setUploadDescription('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadDocuments();
        setTimeout(() => setUploadSuccess(''), 4000);
      } else {
        setUploadError(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      setUploadError('Network error while uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from official downloads?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Save Knowledge Entry
  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim()) {
      alert('Please fill out both the title and content.');
      return;
    }

    try {
      const kwArray = kbKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      if (isEditingEntry && editingId) {
        // Update
        const res = await fetch(`/api/knowledge/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: kbTitle.trim(),
            category: kbCategory,
            keywords: kwArray,
            content: kbContent.trim(),
            author: kbAuthor.trim()
          })
        });
        if (res.ok) {
          setKbSuccess('Knowledge base article updated successfully.');
          resetKbForm();
          await loadKnowledge();
        }
      } else {
        // Create
        const res = await fetch('/api/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: kbTitle.trim(),
            category: kbCategory,
            keywords: kwArray,
            content: kbContent.trim(),
            author: kbAuthor.trim()
          })
        });
        if (res.ok) {
          setKbSuccess('New knowledge entry added. Both the AI assistant and knowledge search now use this guidance.');
          resetKbForm();
          await loadKnowledge();
        }
      }
      setTimeout(() => setKbSuccess(''), 4000);
    } catch (err) {
      alert('Failed to save knowledge entry.');
    }
  };

  const startEditEntry = (entry: KnowledgeEntry) => {
    setIsEditingEntry(true);
    setEditingId(entry.id);
    setKbTitle(entry.title);
    setKbCategory(entry.category);
    setKbKeywords(entry.keywords.join(', '));
    setKbContent(entry.content);
    setKbAuthor(entry.author);
  };

  const resetKbForm = () => {
    setIsEditingEntry(false);
    setEditingId(null);
    setKbTitle('');
    setKbCategory('General');
    setKbKeywords('');
    setKbContent('');
    setKbAuthor('Secretariat Staff');
  };

  const handleDeleteKnowledge = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from the knowledge base?`)) return;
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadKnowledge();
      }
    } catch (err) {
      console.error('Failed to delete knowledge entry:', err);
    }
  };

  // Change Passcode
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);

    if (newPass.length < 4) {
      setSettingsMsg({ text: 'New passcode must be at least 4 characters.', type: 'error' });
      return;
    }
    if (newPass !== confirmPass) {
      setSettingsMsg({ text: 'New passcodes do not match.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPasscode: currentPass, newPasscode: newPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsMsg({ text: 'Passcode changed successfully.', type: 'success' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setSettingsMsg({ text: data.error || 'Failed to update passcode.', type: 'error' });
      }
    } catch {
      setSettingsMsg({ text: 'Network error updating passcode.', type: 'error' });
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  // Filtered documents
  const filteredDocs = docFilter === 'All'
    ? documents
    : documents.filter((d) => d.category === docFilter);

  // Filtered knowledge
  const filteredKnowledge = knowledgeEntries.filter((k) => {
    if (!knowledgeSearch.trim()) return true;
    const q = knowledgeSearch.toLowerCase();
    return (
      k.title.toLowerCase().includes(q) ||
      k.content.toLowerCase().includes(q) ||
      k.keywords.some((w) => w.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#D5E6F5] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0172BB] border border-[#FFE00D]/50 flex items-center justify-center text-[#FFE00D] shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-tight text-white">
                  MUBSREC Secretariat Management Portal
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFE00D] text-slate-950">
                  Staff Only
                </span>
              </div>
              <p className="text-blue-200 text-xs font-medium">
                Manage official downloadable templates, knowledge base guidance, and domain deployment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log out from Secretariat session"
              >
                <LogOut className="w-3.5 h-3.5 text-[#FFE00D]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl font-bold w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto w-full">
            <div className="w-16 h-16 rounded-3xl bg-[#F0F7FD] border-2 border-[#D5E6F5] flex items-center justify-center text-[#0172BB] mb-4 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Secretariat Authentication
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Enter your REC administrative passcode to upload submission forms, edit ethics guidelines, or configure your domain.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Secretariat Passcode"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#D5E6F5] focus:border-[#0172BB] focus:ring-2 focus:ring-[#0172BB]/20 outline-hidden font-mono text-center text-base font-bold text-slate-800"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Default passcode: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">mubsrec2026</code> (changeable in Settings)
                </p>
              </div>

              {authError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 py-2 px-3 rounded-xl font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-[#0172BB] hover:bg-[#005c99] disabled:bg-slate-300 text-white rounded-xl font-bold text-sm shadow-md shadow-[#0172BB]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Unlock Secretariat Portal
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 pt-2 flex gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'documents'
                    ? 'bg-white text-[#0172BB] border-t-2 border-[#0172BB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Upload &amp; Manage Documents ({documents.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'knowledge'
                    ? 'bg-white text-[#0172BB] border-t-2 border-[#0172BB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Knowledge Base &amp; Rules ({knowledgeEntries.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deploy')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'deploy'
                    ? 'bg-white text-[#0172BB] border-t-2 border-[#0172BB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Server className="w-4 h-4" />
                Subdomain Deployment Guide
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('feedback')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'feedback'
                    ? 'bg-white text-[#0172BB] border-t-2 border-[#0172BB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Feedback &amp; Analytics
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-white text-[#0172BB] border-t-2 border-[#0172BB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {/* TAB 1: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Upload Form Card */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6F5] shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E8F3FA] text-[#0172BB] flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Upload New Document or Form for Researchers
                        </h4>
                        <p className="text-xs text-slate-500">
                          Uploaded PDF, Word (.docx), or Excel files are immediately published for researchers to download from the portal.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUploadDocument} className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Document Title *
                          </label>
                          <input
                            type="text"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="e.g. MUBSREC Standard Protocol Template (2026 Edition)"
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] focus:ring-1 focus:ring-[#0172BB] outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={uploadCategory}
                            onChange={(e: any) => setUploadCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] focus:ring-1 focus:ring-[#0172BB] outline-hidden bg-white"
                          >
                            <option value="Protocol">Protocol Forms</option>
                            <option value="Consent">Consent &amp; Assent Templates</option>
                            <option value="Checklist">Checklists &amp; Response Matrices</option>
                            <option value="Fee Schedule">Fee Schedules &amp; Bank Slip Guides</option>
                            <option value="Guidelines">Guidelines &amp; Regulations</option>
                            <option value="Other">Other Institutional Notice</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Description / Instructions for Researchers
                        </label>
                        <textarea
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          placeholder="Brief instructions on how to complete this form and submission requirements..."
                          rows={2}
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] focus:ring-1 focus:ring-[#0172BB] outline-hidden"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-full sm:w-auto">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
                            className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E8F3FA] file:text-[#0172BB] hover:file:bg-[#D5E6F5] cursor-pointer"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUploading || !selectedFile}
                          className="sm:ml-auto w-full sm:w-auto px-5 py-2.5 bg-[#0172BB] hover:bg-[#005c99] disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Publish Document
                            </>
                          )}
                        </button>
                      </div>

                      {uploadSuccess && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          {uploadSuccess}
                        </div>
                      )}
                      {uploadError && (
                        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {uploadError}
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Documents List */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Active Downloadable Documents ({filteredDocs.length})
                        </h4>
                        <p className="text-xs text-slate-500">
                          These files appear on the researcher portal with direct 1-click download buttons.
                        </p>
                      </div>

                      {/* Filter by Category */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                        {['All', 'Protocol', 'Consent', 'Checklist', 'Fee Schedule', 'Guidelines'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDocFilter(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              docFilter === cat
                                ? 'bg-[#0172BB] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isLoadingDocs ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0172BB]" />
                        Loading documents repository...
                      </div>
                    ) : filteredDocs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No documents found in this category.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F0F7FD] border border-[#D5E6F5] flex items-center justify-center text-[#0172BB] shrink-0 mt-0.5">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {doc.title}
                                  </h5>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#E8F3FA] text-[#0172BB]">
                                    {doc.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                  {doc.description || doc.originalName}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                  <span>Uploaded: {doc.uploadDate}</span>
                                  <span>&bull;</span>
                                  <span>Size: {Math.round(doc.fileSize / 1024)} KB</span>
                                  <span>&bull;</span>
                                  <span className="text-[#0172BB] font-bold">
                                    {doc.downloadCount} downloads
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
                              <a
                                href={doc.url}
                                download
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Download file to check formatting"
                              >
                                <Download className="w-3.5 h-3.5 text-[#0172BB]" />
                                Test Download
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: KNOWLEDGE BASE */}
              {activeTab === 'knowledge' && (
                <div className="space-y-6">
                  {/* Add / Edit Knowledge Article */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6F5] shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F3FA] text-[#0172BB] flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {isEditingEntry ? 'Edit Knowledge Article' : 'Add New Knowledge Base Article / Regulation'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Knowledge articles are directly searched by the AI assistant and instant fallback engine.
                          </p>
                        </div>
                      </div>

                      {isEditingEntry && (
                        <button
                          type="button"
                          onClick={resetKbForm}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveKnowledge} className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Topic / Question Title *
                          </label>
                          <input
                            type="text"
                            value={kbTitle}
                            onChange={(e) => setKbTitle(e.target.value)}
                            placeholder="e.g. Clarification on Expedited Review for MSc Accounting Dissertations"
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={kbCategory}
                            onChange={(e: any) => setKbCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden bg-white"
                          >
                            <option value="General">General Institutional</option>
                            <option value="Submission">Submission &amp; Requirements</option>
                            <option value="Review Process">Review Process &amp; Timelines</option>
                            <option value="Fees & Banking">Fees &amp; Banking</option>
                            <option value="Post-Approval">Post-Approval &amp; Renewals</option>
                            <option value="Contacts">Secretariat Contacts</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Trigger Keywords (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={kbKeywords}
                          onChange={(e) => setKbKeywords(e.target.value)}
                          placeholder="e.g. expedited, masters, accounting, turnaround, waiver"
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          When a researcher types any of these words in the chat, this authoritative guidance will be used to answer them.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Committee Guidance / Response Content *
                        </label>
                        <textarea
                          value={kbContent}
                          onChange={(e) => setKbContent(e.target.value)}
                          placeholder="Enter authoritative advice, step-by-step instructions, or official notices..."
                          rows={4}
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="w-1/3">
                          <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                            Author / Officer
                          </label>
                          <input
                            type="text"
                            value={kbAuthor}
                            onChange={(e) => setKbAuthor(e.target.value)}
                            placeholder="Secretariat Officer"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#0172BB] hover:bg-[#005c99] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          {isEditingEntry ? 'Save Changes' : 'Add to Knowledge Base'}
                        </button>
                      </div>

                      {kbSuccess && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          {kbSuccess}
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Knowledge Base Directory */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Current Knowledge Articles ({filteredKnowledge.length})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Search and maintain institutional advice for researchers.
                        </p>
                      </div>

                      {/* Search box */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={knowledgeSearch}
                          onChange={(e) => setKnowledgeSearch(e.target.value)}
                          placeholder="Search knowledge..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden"
                        />
                      </div>
                    </div>

                    {isLoadingKnowledge ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0172BB]" />
                        Loading knowledge base...
                      </div>
                    ) : filteredKnowledge.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No knowledge articles match your query.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredKnowledge.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 hover:border-[#0172BB]/50 hover:bg-white transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {item.title}
                                </h5>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0172BB] shrink-0">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                                {item.content}
                              </p>
                              {item.keywords && item.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.keywords.map((kw, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 flex items-center gap-0.5"
                                    >
                                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                              <span>Updated {item.lastUpdated}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEditEntry(item)}
                                  className="p-1 text-[#0172BB] hover:bg-blue-50 rounded cursor-pointer"
                                  title="Edit entry"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKnowledge(item.id, item.title)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Delete entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SUBDOMAIN DEPLOYMENT GUIDE */}
              {activeTab === 'deploy' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#D5E6F5] shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F3FA] text-[#0172BB] flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Subdomain Deployment Architecture: <code className="text-[#0172BB] font-mono">rec.mubs.ac.ug</code>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Complete technical configuration and steps to host this application on your university infrastructure.
                        </p>
                      </div>
                    </div>

                    {/* Step 1: DNS */}
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 mb-2">
                          <span className="w-5 h-5 rounded-full bg-[#0172BB] text-white flex items-center justify-center text-[10px] font-black">1</span>
                          MUBS DNS Configuration
                        </div>
                        <p className="text-xs text-slate-600 mb-3">
                          In your domain management console (e.g. MUBS ICT DNS zone for <code className="font-mono font-bold">mubs.ac.ug</code>), add one of the following records:
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                          <div className="text-emerald-700 font-bold"># If using University Linux Server / VPS:</div>
                          <div>Type: <span className="font-bold">A</span> | Host: <span className="font-bold">rec</span> | Value: <span className="font-bold">[YOUR_SERVER_PUBLIC_IP]</span> | TTL: 3600</div>
                          <div className="text-blue-700 font-bold mt-2"># If using Google Cloud Run:</div>
                          <div>Type: <span className="font-bold">CNAME</span> | Host: <span className="font-bold">rec</span> | Value: <span className="font-bold">ghs.googlehosted.com.</span> | TTL: 3600</div>
                        </div>
                      </div>

                      {/* Step 2: Nginx Reverse Proxy */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-[#0172BB] text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Nginx Configuration for Ubuntu/Debian Server
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                'nginx',
                                `server {
    server_name rec.mubs.ac.ug;

    # Maximum upload size for protocol packages (up to 40MB)
    client_max_body_size 40M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`
                              )
                            }
                            className="text-xs font-bold text-[#0172BB] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedCode === 'nginx' ? 'Copied' : 'Copy Nginx Config'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          Save this file to <code className="font-mono font-bold">/etc/nginx/sites-available/rec.mubs.ac.ug</code> and run <code className="font-mono font-bold">sudo certbot --nginx -d rec.mubs.ac.ug</code> for automatic HTTPS:
                        </p>
                        <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`server {
    server_name rec.mubs.ac.ug;
    client_max_body_size 40M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`}
                        </pre>
                      </div>

                      {/* Step 3: PM2 Process Management */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-[#0172BB] text-white flex items-center justify-center text-[10px] font-black">3</span>
                            Building &amp; Starting Production Service
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                'pm2',
                                `npm install\nnpm run build\npm2 start dist/server.cjs --name "mubsrec-portal"\npm2 save\npm2 startup`
                              )
                            }
                            className="text-xs font-bold text-[#0172BB] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode === 'pm2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedCode === 'pm2' ? 'Copied' : 'Copy Commands'}
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`# 1. Install dependencies
npm install

# 2. Build full-stack bundle (compiles React client and Express server)
npm run build

# 3. Launch background service via PM2
pm2 start dist/server.cjs --name "mubsrec-portal"
pm2 save
pm2 startup`}
                        </pre>
                      </div>

                      {/* Step 4: CWP (Control Web Panel) Deployment with Git */}
                      <div className="border-2 border-[#0172BB]/30 rounded-xl p-4 bg-[#F0F7FD]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#0172BB]">
                            <span className="w-5 h-5 rounded-full bg-[#0172BB] text-white flex items-center justify-center text-[10px] font-black">4</span>
                            CWP (Control Web Panel) with Git Setup
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                'cwp-htaccess',
                                `# CWP .htaccess Reverse Proxy to Port 3000
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]`
                              )
                            }
                            className="text-xs font-bold text-[#0172BB] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode === 'cwp-htaccess' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedCode === 'cwp-htaccess' ? 'Copied' : 'Copy CWP .htaccess'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                          For servers running <strong>CWP (Control Web Panel)</strong> on AlmaLinux/CentOS:
                        </p>
                        <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside mb-3">
                          <li>In CWP, create subdomain <code className="font-mono font-bold">rec.mubs.ac.ug</code> pointing to <code className="font-mono">/home/USER/rec.mubs.ac.ug</code>.</li>
                          <li>In CWP Terminal or SSH, clone your repository with <code className="font-mono">git clone &lt;REPO_URL&gt;</code>.</li>
                          <li>Run <code className="font-mono">npm install && npm run build</code> and start with <code className="font-mono">pm2 start dist/server.cjs --name "mubsrec"</code>.</li>
                          <li>In CWP DocumentRoot, create <code className="font-mono">.htaccess</code> with the proxy rule below (or configure Nginx Reverse Proxy to port 3000).</li>
                          <li>In CWP &rarr; <strong>AutoSSL</strong>, issue a free Let's Encrypt certificate for <code className="font-mono">rec.mubs.ac.ug</code>.</li>
                        </ol>
                        <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`# Place in /home/USERNAME/public_html/rec/.htaccess (or subdomain document root)
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FEEDBACK & STATS */}
              {activeTab === 'feedback' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satisfaction Rate</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {feedbackStats?.satisfactionRate || 100}%
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Based on researcher response ratings</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Helpful Ratings</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 mt-2">
                        +{feedbackStats?.thumbsUp || 0}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Researchers marked advice helpful</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Needs Improvement</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <ThumbsDown className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-amber-600 mt-2">
                        {feedbackStats?.thumbsDown || 0}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Protocols requiring clearer clarification</p>
                    </div>
                  </div>

                  {/* Feedback table */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-3">
                      Recent Researcher Interactions &amp; Feedback Log
                    </h4>
                    {feedbackStats?.recentFeedback && feedbackStats.recentFeedback.length > 0 ? (
                      <div className="divide-y divide-slate-100 text-xs">
                        {feedbackStats.recentFeedback.map((fb: any) => (
                          <div key={fb.id} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {fb.type === 'up' ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" /> Helpful
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] flex items-center gap-1">
                                  <ThumbsDown className="w-3 h-3" /> Needs Revision
                                </span>
                              )}
                              <span className="text-slate-700 font-medium">
                                {fb.note || 'Researcher query rating'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">
                              {new Date(fb.timestamp).toLocaleDateString()} at {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No feedback ratings recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-lg mx-auto">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F3FA] text-[#0172BB] flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Change Secretariat Portal Passcode
                        </h4>
                        <p className="text-xs text-slate-500">
                          Update the administrative passphrase used by committee officers to access this management dashboard.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePasscode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Current Passcode
                        </label>
                        <input
                          type="password"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          placeholder="Current Passcode"
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          New Passcode (min 4 characters)
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="New Passcode"
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm New Passcode
                        </label>
                        <input
                          type="password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Confirm New Passcode"
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0172BB] outline-hidden font-mono"
                          required
                        />
                      </div>

                      {settingsMsg && (
                        <div
                          className={`flex items-center gap-2 text-xs p-3 rounded-xl font-medium ${
                            settingsMsg.type === 'success'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border border-rose-200'
                          }`}
                        >
                          {settingsMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                          )}
                          {settingsMsg.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#0172BB] hover:bg-[#005c99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                      >
                        Update Secretariat Passcode
                      </button>
                    </form>
                  </div>

                  {/* Direct Administrative URL & Access info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700">
                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0172BB]" />
                      Secretariat Access Methods (Hidden from Public)
                    </h5>
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      All visible Admin buttons have been hidden from public visitors and researchers. Committee staff can access this portal using either of the following private methods:
                    </p>
                    <div className="space-y-2 font-mono">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans font-bold uppercase">Direct Access URL:</span>
                          <span className="text-[#0172BB] font-bold">https://rec.mubs.ac.ug/admin</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('admin-url', 'https://rec.mubs.ac.ug/admin')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedCode === 'admin-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCode === 'admin-url' ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans font-bold uppercase">Secret Keyboard Shortcut:</span>
                          <span className="text-slate-800 font-bold">Ctrl + Shift + A (or Cmd + Shift + A)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans">Press anywhere on site</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
