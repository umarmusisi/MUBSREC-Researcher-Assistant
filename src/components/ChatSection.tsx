import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Copy, Check, Download, Sparkles, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TypingIndicator from './TypingIndicator';
import { ChatMessage } from '../types';

interface ChatSectionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onResetChat?: () => void;
}

export default function ChatSection({
  messages,
  isLoading,
  onSendMessage,
  onResetChat
}: ChatSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [reactions, setReactions] = useState<Record<string, 'up' | 'down'>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<{ id: string; message: string; type: 'up' | 'down' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReaction = (msgId: string, reactionType: 'up' | 'down') => {
    setReactions((prev) => {
      const current = prev[msgId];
      if (current === reactionType) {
        // Toggle off
        const updated = { ...prev };
        delete updated[msgId];
        return updated;
      }
      return { ...prev, [msgId]: reactionType };
    });

    const isCurrent = reactions[msgId] === reactionType;
    if (!isCurrent) {
      // Send feedback to backend API
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reactionType, messageId: msgId })
      }).catch((err) => console.warn('Could not submit feedback:', err));

      setFeedbackNotice({
        id: msgId,
        message: reactionType === 'up'
          ? 'Thank you! Marked as helpful guidance.'
          : 'Feedback noted. You can ask follow-up questions for clarification.',
        type: reactionType,
      });
      setTimeout(() => {
        setFeedbackNotice((curr) => (curr?.id === msgId ? null : curr));
      }, 3500);
    } else {
      setFeedbackNotice(null);
    }
  };

  const handleDownloadConversation = () => {
    if (!messages || messages.length === 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let transcript = `================================================================================\n`;
    transcript += `MAKERERE UNIVERSITY BUSINESS SCHOOL (MUBS)\n`;
    transcript += `RESEARCH ETHICS COMMITTEE (MUBSREC)\n`;
    transcript += `RESEARCHER ASSISTANT - ADVISORY CONVERSATION TRANSCRIPT\n`;
    transcript += `================================================================================\n`;
    transcript += `Export Timestamp   : ${dateStr} at ${timeStr}\n`;
    transcript += `Institutional Desk : Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa\n`;
    transcript += `Secretariat Email  : rec@mubs.ac.ug\n`;
    transcript += `Secretariat Phone  : +256 414 338 120\n`;
    transcript += `Total Messages     : ${messages.length}\n`;
    transcript += `================================================================================\n\n`;

    messages.forEach((msg, idx) => {
      const senderTitle = msg.sender === 'assistant' ? 'MUBSREC ASSISTANT' : 'RESEARCHER';
      const timestamp = msg.timestamp || 'N/A';
      const reaction = reactions[msg.id] || msg.feedback;
      const reactionNote = reaction ? ` [Researcher Rating: ${reaction === 'up' ? 'Helpful (+1)' : 'Needs Improvement (-1)'}]` : '';
      transcript += `[${idx + 1}] ${senderTitle} [${timestamp}]${reactionNote}\n`;
      transcript += `${'-'.repeat(70)}\n`;
      transcript += `${msg.text.trim()}\n\n`;
      transcript += `${'='.repeat(70)}\n\n`;
    });

    transcript += `================================================================================\n`;
    transcript += `END OF ADVISORY TRANSCRIPT\n`;
    transcript += `Official Notice: This transcript is provided for your academic and protocol preparation\n`;
    transcript += `records. For final submission, please submit 2 spiral-bound copies to the Secretariat\n`;
    transcript += `and email your electronic dossier to rec@mubs.ac.ug.\n`;
    transcript += `================================================================================\n`;

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const pad = (n: number) => n.toString().padStart(2, '0');
    const fileDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    link.href = url;
    link.download = `MUBSREC_Conversation_${fileDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Chat Box Container (MUBS Theme) */}
      <div className="w-full bg-white rounded-3xl border-2 border-[#D5E6F5] shadow-xl shadow-[#0172BB]/5 overflow-hidden flex flex-col min-h-[320px]">
        {/* Chat Header Bar with Download & Session Controls */}
        <div className="px-5 sm:px-7 py-3.5 bg-[#F8FBFE] border-b border-[#E8F3FA] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">Advisory Session</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-[#D5E6F5]">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Conversation Button */}
            <button
              id="download-chat-btn"
              type="button"
              onClick={handleDownloadConversation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5E6F5] hover:border-[#0172BB] text-xs font-bold text-slate-700 hover:text-[#0172BB] hover:bg-[#E8F3FA] transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer group"
              title="Download entire conversation transcript as a text file for your records"
            >
              {hasDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Downloaded .txt</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0172BB] group-hover:scale-110 transition-transform" />
                  <span>Download Conversation</span>
                </>
              )}
            </button>

            {/* Reset Chat Button */}
            {onResetChat && (
              <button
                id="reset-chat-btn"
                type="button"
                onClick={onResetChat}
                disabled={isLoading || messages.length <= 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5E6F5] hover:border-slate-300 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all shadow-xs hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Start a fresh advisory session"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages scrollable area */}
        <div className="p-6 sm:p-8 flex-1 space-y-7 overflow-y-auto max-h-[580px]">
          {messages.map((msg, index) => {
            const isAssistant = msg.sender === 'assistant';

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3.5 sm:gap-4 items-start ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Assistant Avatar with MUBS Official Crest Logo */}
                {isAssistant && (
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#D5E6F5] p-1 flex items-center justify-center shrink-0 shadow-md shadow-[#0172BB]/10 overflow-hidden">
                    <img
                      src="/mubs-logo.png"
                      alt="MUBSREC"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div
                      style={{ display: 'none' }}
                      className="w-full h-full bg-[#0172BB] text-white rounded-lg flex items-center justify-center font-black text-xs"
                    >
                      REC
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`relative group ${
                    isAssistant
                      ? 'bg-white p-6 rounded-r-3xl rounded-bl-3xl shadow-sm border border-[#E8F3FA] max-w-[92%] sm:max-w-[85%]'
                      : 'bg-[#0172BB] text-white p-5 sm:p-6 rounded-l-3xl rounded-br-3xl shadow-xl shadow-[#0172BB]/20 max-w-[88%] sm:max-w-[80%]'
                  }`}
                >
                  {isAssistant ? (
                    <div>
                      <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 text-slate-700 font-medium text-sm sm:text-[14.5px] leading-relaxed">
                        <Markdown>{msg.text}</Markdown>
                      </div>

                      {/* Message Actions & Feedback Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-3 border-t border-[#E8F3FA]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-[#E8F3FA] text-[#0172BB] rounded-lg text-[10px] font-black uppercase tracking-wider">
                            MUBSREC
                          </span>
                          <span className="px-2.5 py-0.5 bg-[#FFFDE6] text-[#9A7000] border border-[#FFE00D]/50 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            Official Desk
                          </span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* Feedback Reaction Controls */}
                          {(() => {
                            const reaction = reactions[msg.id] || msg.feedback;
                            return (
                              <div className="flex items-center bg-[#F8FBFE] p-0.5 rounded-xl border border-[#E1EEF8]">
                                <button
                                  id={`thumbs-up-${msg.id}`}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, 'up')}
                                  className={`inline-flex items-center gap-1 text-xs font-bold transition-all py-1 px-2 rounded-lg cursor-pointer ${
                                    reaction === 'up'
                                      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-xs'
                                      : 'text-slate-400 hover:text-emerald-700 hover:bg-white'
                                  }`}
                                  title={reaction === 'up' ? 'Marked as helpful (click to remove)' : 'Mark as helpful guidance'}
                                  aria-label="Thumbs up - helpful guidance"
                                >
                                  <ThumbsUp className={`w-3.5 h-3.5 ${reaction === 'up' ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                                  <span className={`text-[11px] ${reaction === 'up' ? 'inline' : 'hidden sm:inline'}`}>
                                    {reaction === 'up' ? 'Helpful' : ''}
                                  </span>
                                </button>

                                <button
                                  id={`thumbs-down-${msg.id}`}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, 'down')}
                                  className={`inline-flex items-center gap-1 text-xs font-bold transition-all py-1 px-2 rounded-lg cursor-pointer ${
                                    reaction === 'down'
                                      ? 'bg-amber-100/90 text-amber-900 border border-amber-300 shadow-xs'
                                      : 'text-slate-400 hover:text-amber-700 hover:bg-white'
                                  }`}
                                  title={reaction === 'down' ? 'Marked as needing improvement (click to remove)' : 'Mark as needing improvement or clarification'}
                                  aria-label="Thumbs down - unhelpful guidance"
                                >
                                  <ThumbsDown className={`w-3.5 h-3.5 ${reaction === 'down' ? 'fill-amber-700 text-amber-700' : ''}`} />
                                  <span className={`text-[11px] ${reaction === 'down' ? 'inline' : 'hidden sm:inline'}`}>
                                    {reaction === 'down' ? 'Needs detail' : ''}
                                  </span>
                                </button>
                              </div>
                            );
                          })()}

                          {/* Copy Button */}
                          <button
                            id={`copy-btn-${msg.id}`}
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0172BB] font-bold transition-colors py-1 px-2.5 rounded-xl hover:bg-[#E8F3FA] cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Brief Feedback Notification Banner */}
                      {feedbackNotice?.id === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`mt-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                            feedbackNotice.type === 'up'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {feedbackNotice.type === 'up' ? (
                            <ThumbsUp className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <ThumbsDown className="w-3 h-3 text-amber-600 shrink-0" />
                          )}
                          <span>{feedbackNotice.message}</span>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed font-medium text-sm sm:text-[15px]">
                      {msg.text}
                    </div>
                  )}
                </div>

                {/* User Avatar with institutional navy gradient */}
                {!isAssistant && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#003E68] to-[#0172BB] shrink-0 border-2 border-white shadow-md flex items-center justify-center text-white font-black text-xs">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Visual Typing Indicator */}
          <AnimatePresence>
            {isLoading && <TypingIndicator key="typing-indicator" />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="w-full relative flex items-center group">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Type your question about MUBSREC protocol, fees, forms..."
            className="w-full bg-white border-2 border-[#D5E6F5] rounded-3xl py-4.5 pl-6 pr-16 text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-[#0172BB] shadow-xl shadow-[#0172BB]/5 font-medium transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />

          {/* Send Button: MUBS Primary Blue #0172BB button with hover:scale-105 */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0172BB] hover:bg-[#005691] p-3 rounded-2xl text-white shadow-lg shadow-[#0172BB]/25 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
            title="Send question"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bottom Subtext */}
        <div className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3.5">
          Powered by MUBSREC Researcher Assistant &bull; Makerere University Business School
        </div>
      </form>
    </div>

  );
}
