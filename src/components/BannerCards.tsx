import { useState, useEffect } from 'react';
import {
  Folder,
  ChevronDown,
  FileText,
  GraduationCap,
  MessageCircle,
  FileDown,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { MUBSREC_TEMPLATES } from '../data/mubsrecData';
import { TemplateItem, ManagedDocument } from '../types';

interface BannerCardsProps {
  onOpenGuidelines: () => void;
  onOpenEthicsIntro: () => void;
  onOpenContacts: () => void;
  onAskBot: (question: string) => void;
}

export default function BannerCards({
  onOpenGuidelines,
  onOpenEthicsIntro,
  onOpenContacts,
  onAskBot
}: BannerCardsProps) {
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Managed documents from backend storage
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [viewMode, setViewMode] = useState<'official' | 'outlines'>('official');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadStub = (template: TemplateItem) => {
    const blob = new Blob([template.contentSnippet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Submission Templates & Checklists (MUBS Blue with Yellow Accents) */}
      <div className="rounded-2xl overflow-hidden shadow-lg shadow-[#0172BB]/10 transition-all border border-[#D5E6F5]">
        <button
          type="button"
          onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
          className="w-full bg-gradient-to-r from-[#0172BB] via-[#005c99] to-[#004e80] hover:from-[#005c99] hover:to-[#00416c] text-white px-5 py-4 flex items-center justify-between transition-all text-left cursor-pointer"
          aria-expanded={isTemplatesOpen}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE00D]/20 border border-[#FFE00D]/40 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-[#FFE00D] shrink-0" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight block">
                Submission Templates &amp; Official Forms
              </span>
              <span className="text-[11px] sm:text-xs text-blue-200 font-medium block">
                Downloadable Word &amp; PDF templates, consent forms, and protocol outlines
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#FFE00D] shrink-0 transition-transform duration-200 ${
              isTemplatesOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable content area */}
        {isTemplatesOpen && (
          <div className="bg-[#F0F7FD] border-t border-[#D5E6F5] p-4 sm:p-5">
            {/* View Selector & Admin upload trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-[#D5E6F5]">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('official')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'official'
                      ? 'bg-[#0172BB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Official Downloads ({documents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('outlines')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'outlines'
                      ? 'bg-[#0172BB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standard Outlines ({MUBSREC_TEMPLATES.length})
                </button>
              </div>
            </div>

            {/* Official Downloads View */}
            {viewMode === 'official' && (
              <div>
                {isLoadingDocs ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#0172BB]" />
                    Loading official documents...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                    No downloadable documents currently available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white p-4 rounded-2xl border-2 border-[#D5E6F5] hover:border-[#0172BB] hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {doc.title}
                            </h4>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#E8F3FA] text-[#0172BB] shrink-0">
                              {doc.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                            {doc.description || 'Official template provided by the MUBSREC Secretariat.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {Math.round(doc.fileSize / 1024)} KB &bull; {doc.downloadCount} downloads
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url}
                              download={doc.originalName || doc.fileName}
                              className="px-3.5 py-1.5 bg-[#0172BB] hover:bg-[#005c99] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => onAskBot(`Can you give me instructions on completing the "${doc.title}"?`)}
                              className="p-1.5 text-slate-400 hover:text-[#0172BB] rounded-lg transition-colors cursor-pointer"
                              title="Ask assistant about this form"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Standard Outlines View */}
            {viewMode === 'outlines' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {MUBSREC_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-white p-4 rounded-2xl border-2 border-[#D5E6F5] hover:border-[#0172BB] hover:shadow-lg hover:shadow-[#0172BB]/10 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">
                          {tmpl.title}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FFFDE6] text-[#9A7000] border border-[#FFE00D]/50 shrink-0">
                          {tmpl.fileFormat}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 font-normal leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#E8F3FA] text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(tmpl)}
                        className="px-3 py-1.5 bg-[#E8F3FA] hover:bg-[#D5E6F5] text-[#0172BB] rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Outline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadStub(tmpl)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => onAskBot(`Can you explain the requirements for the "${tmpl.title}"?`)}
                        className="ml-auto text-[#0172BB] hover:text-[#005691] font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        Ask Bot
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. National & Institutional Guidelines (MUBS Primary Blue Banner) */}
      <button
        type="button"
        onClick={onOpenGuidelines}
        className="w-full bg-gradient-to-r from-[#0172BB] to-[#0284c7] hover:from-[#005c99] hover:to-[#0274af] text-white px-5 py-4 rounded-2xl flex items-center justify-between text-left shadow-lg shadow-[#0172BB]/15 transition-all border border-blue-400/30 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#FFE00D] shrink-0" />
          </div>
          <div>
            <div className="font-black text-sm sm:text-base tracking-tight leading-snug">
              National &amp; Institutional Guidelines
            </div>
            <div className="text-blue-100 text-xs sm:text-[13px] font-medium leading-tight mt-0.5">
              Get an overview of the regulatory guidelines that apply to your study
            </div>
          </div>
        </div>
      </button>

      {/* 3. New to Research Ethics? (Warm Gold/Amber Accent #FFE00D) */}
      <button
        type="button"
        onClick={onOpenEthicsIntro}
        className="w-full bg-gradient-to-r from-[#B47A00] via-[#C88A00] to-[#E5AC00] hover:from-[#996500] hover:to-[#B47A00] text-slate-950 px-5 py-4 rounded-2xl flex items-center justify-between text-left shadow-lg shadow-[#FFE00D]/20 transition-all border border-[#FFE00D]/60 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-slate-950 shrink-0" />
          </div>
          <div>
            <div className="font-black text-sm sm:text-base tracking-tight leading-snug text-slate-950">
              New to Research Ethics?
            </div>
            <div className="text-slate-900/90 text-xs sm:text-[13px] font-semibold leading-tight mt-0.5">
              A beginner-friendly overview of ethical principles and participant protection
            </div>
          </div>
        </div>
      </button>

      {/* 4. Contact the MUBSREC Secretariat (MUBS Scarlet Red Accent #FD0808) */}
      <button
        type="button"
        onClick={onOpenContacts}
        className="w-full bg-gradient-to-r from-[#D71313] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white px-5 py-4 rounded-2xl flex items-center justify-between text-left shadow-lg shadow-red-200/50 transition-all border border-red-400/40 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white shrink-0" />
          </div>
          <div>
            <div className="font-black text-sm sm:text-base tracking-tight leading-snug">
              Contact the MUBSREC Secretariat
            </div>
            <div className="text-red-100 text-xs sm:text-[13px] font-medium leading-tight mt-0.5">
              Office desk contacts, physical location at FGSR, and submission hours
            </div>
          </div>
        </div>
      </button>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#D5E6F5] max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E8F3FA]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-[#E8F3FA] text-[#0172BB] mb-2 inline-block">
                  {selectedTemplate.category} Template
                </span>
                <h3 className="text-lg font-black text-slate-800 leading-tight">
                  {selectedTemplate.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="my-4 overflow-y-auto pr-1 text-xs sm:text-sm text-slate-700 space-y-3 font-mono bg-[#F0F7FD] p-4 rounded-2xl border border-[#D5E6F5] whitespace-pre-wrap">
              {selectedTemplate.contentSnippet}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8F3FA] gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedTemplate.id, selectedTemplate.contentSnippet)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copiedId === selectedTemplate.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    Copy Template
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Can you guide me step by step on drafting my "${selectedTemplate.title}" for my MUBS study?`;
                    setSelectedTemplate(null);
                    onAskBot(prompt);
                  }}
                  className="px-4 py-2.5 bg-[#0172BB] hover:bg-[#005691] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0172BB]/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Draft with Bot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
