import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  statusText?: string;
}

const statusMessages = [
  'Consulting official MUBSREC guidelines...',
  'Checking ethical review standards & forms...',
  'Verifying protocol requirements...',
  'Formulating comprehensive guidance...',
];

export default function TypingIndicator({ statusText }: TypingIndicatorProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const displayMessage = statusText || statusMessages[currentStatusIndex];

  return (
    <motion.div
      id="typing-indicator"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex gap-3.5 sm:gap-4 items-start justify-start select-none"
    >
      {/* Assistant Avatar with dynamic pulse halo */}
      <div className="relative shrink-0">
        <span className="absolute -inset-1 rounded-2xl bg-[#0172BB]/20 animate-ping opacity-75" />
        <div className="relative w-10 h-10 rounded-2xl bg-white border-2 border-[#D5E6F5] p-1 flex items-center justify-center shadow-md shadow-[#0172BB]/15 overflow-hidden">
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
      </div>

      {/* Typing Bubble */}
      <div className="bg-white border border-[#E8F3FA] rounded-r-3xl rounded-bl-3xl p-4 sm:p-5 shadow-sm shadow-[#0172BB]/5 flex flex-col gap-2.5 max-w-[92%] sm:max-w-[78%]">
        {/* Top bar: typing wave dots + category badge */}
        <div className="flex items-center gap-3">
          {/* Animated 3-dot typing wave */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F0F7FD] rounded-full border border-[#D5E6F5]">
            <motion.span
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0,
              }}
              className="w-2 h-2 rounded-full bg-[#0172BB]"
            />
            <motion.span
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.18,
              }}
              className="w-2 h-2 rounded-full bg-[#EAB308]"
            />
            <motion.span
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.36,
              }}
              className="w-2 h-2 rounded-full bg-[#FD0808]"
            />
          </div>

          {/* Equalizer / Thinking Activity Waves */}
          <div className="flex items-center gap-0.5 h-3">
            {[40, 90, 60, 100, 50].map((height, i) => (
              <motion.span
                key={i}
                animate={{
                  height: ['20%', `${height}%`, '30%'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.12,
                }}
                className="w-0.5 rounded-full bg-[#0172BB]/40"
              />
            ))}
          </div>

          {/* Mini Badge */}
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#0172BB] bg-[#E8F3FA] px-2 py-0.5 rounded-md">
            <Sparkles className="w-2.5 h-2.5" />
            MUBSREC Desk
          </span>
        </div>

        {/* Dynamic cycling status message with crossfade */}
        <div className="relative min-h-[20px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayMessage}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <span>{displayMessage}</span>
              {/* Blinking cursor */}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-1.5 h-3.5 bg-[#0172BB] rounded-xs"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
