export default function Header() {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#D5E6F5] shadow-xs sticky top-0 z-40">
      {/* Tri-color MUBS Institutional Ribbon Bar: Blue #0172BB, Yellow #FFE00D, Red #FD0808 */}
      <div className="h-1.5 w-full flex">
        <div className="flex-[4] bg-[#0172BB]"></div>
        <div className="flex-[2] bg-[#FFE00D]"></div>
        <div className="flex-[1] bg-[#FD0808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[4rem] sm:h-18 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border-2 border-[#D5E6F5] p-0.5 sm:p-1 flex items-center justify-center shadow-md shadow-[#0172BB]/10 shrink-0 overflow-hidden relative group">
            <img
              src="/mubs-logo.png"
              alt="Makerere University Business School Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to stylized university badge if image fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              style={{ display: 'none' }}
              className="w-full h-full bg-[#0172BB] text-white rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs"
            >
              MUBS
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-slate-900 font-black text-[15px] sm:text-lg md:text-xl leading-tight tracking-tight">
                MUBSREC Researcher Assistant
              </h1>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFFDE6] text-[#A17900] border border-[#FFE00D]/50 shrink-0">
                Official Portal
              </span>
            </div>
            <p className="text-[#0172BB] font-bold text-[11px] sm:text-[13px] leading-tight mt-0.5 truncate sm:overflow-visible">
              <span className="hidden sm:inline">Makerere University Business School &bull; </span>
              <span className="sm:hidden">MUBS &bull; </span>
              Research Ethics Committee
            </p>
          </div>
        </div>

        {/* Right status indicator - strictly single-line pill */}
        <div className="flex items-center shrink-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 bg-[#E8F3FA] border border-[#BAE0FD] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs whitespace-nowrap"
            title="MUBSREC Assistant Online & Ready"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0172BB] rounded-full animate-pulse shrink-0"></span>
            <span className="text-[11px] sm:text-xs font-black text-[#0172BB] uppercase tracking-wide whitespace-nowrap">
              <span className="hidden sm:inline">REC Desk Active</span>
              <span className="sm:hidden">Active</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

