import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import BannerCards from './components/BannerCards';
import QuickTopics from './components/QuickTopics';
import ChatSection from './components/ChatSection';
import InfoModals from './components/InfoModals';
import AdminPortal from './components/AdminPortal';
import { ChatMessage } from './types';
import { Mail, MapPin } from 'lucide-react';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: `👋 Hello! I'm the **MUBSREC Researcher Assistant**.

I can help you navigate the Research Ethics Committee (REC) application process at Makerere University Business School. Ask me anything or Tap one of the quick topics above to get started!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'guidelines' | 'ethics' | 'contacts' | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Determine if the user accessed the admin portal via direct URL
  const checkAdminRoute = useCallback(() => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    return (
      pathname === '/admin' ||
      pathname === '/admin/' ||
      pathname.startsWith('/admin') ||
      pathname === '/secretariat' ||
      pathname === '/secretariat/' ||
      hash === '#admin' ||
      hash === '#secretariat' ||
      search.includes('admin=true') ||
      search.includes('admin=1') ||
      search.includes('secretariat')
    );
  }, []);

  // Sync URL on initial mount, browser history navigation, and secret shortcut
  useEffect(() => {
    if (checkAdminRoute()) {
      setIsAdminOpen(true);
    }

    const handleLocationChange = () => {
      if (checkAdminRoute()) {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Discreet keyboard shortcut for Secretariat staff: Ctrl + Shift + A or Cmd + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkAdminRoute]);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    // Reset browser URL to root clean URL when admin modal is dismissed
    if (checkAdminRoute()) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Send conversation to backend proxy
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-5).map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Thank you for reaching out. Please contact the MUBSREC Secretariat for further information.';

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to communicate with chat API:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `I apologize, but I encountered a network issue reaching the assistant service.

For immediate assistance with your research protocol or submission:
- **Email the Secretariat:** \`rec@mubs.ac.ug\`
- **Office Location:** Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Campus
- **Phone:** +256 414 338 120`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-slate-800 flex flex-col font-sans selection:bg-[#0172BB] selection:text-white">
      {/* Top Header without visible admin buttons */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-5">
        {/* 1. Stacked colored action banners */}
        <BannerCards
          onOpenGuidelines={() => setActiveModal('guidelines')}
          onOpenEthicsIntro={() => setActiveModal('ethics')}
          onOpenContacts={() => setActiveModal('contacts')}
          onAskBot={handleSendMessage}
        />

        {/* 2. Quick Topics Pills */}
        <QuickTopics
          onSelectTopic={handleSendMessage}
          isLoading={isLoading}
        />

        {/* 3. Chat Area & Input Section */}
        <ChatSection
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onResetChat={handleResetChat}
        />
      </main>

      {/* Institutional Clean Footer */}
      <footer className="w-full bg-white border-t border-[#D5E6F5] py-6 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-slate-700">
              Makerere University Business School (MUBS) &bull; Research Ethics Committee
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#0172BB]" />
              <a href="mailto:rec@mubs.ac.ug" className="hover:underline text-[#0172BB] font-medium">
                rec@mubs.ac.ug
              </a>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>FGSR, Nakawa Campus</span>
          </div>
        </div>
      </footer>

      {/* Detail Modals for Guidelines, Ethics, and Secretariat */}
      <InfoModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onAskBot={handleSendMessage}
      />

      {/* Secretariat Admin Management Portal - Opened via URL /admin or shortcut */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
      />
    </div>
  );
}
