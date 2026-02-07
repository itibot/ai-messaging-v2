
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-inter overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 glass-panel z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 fpl-gradient rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-outfit font-bold tracking-tight">FPL <span className="text-emerald-400">Insight Scout</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Intelligence Engine</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          {/* Header navigation removed per user request */}
        </div>
      </header>

      {/* Main Content Area - Enabled vertical scroll for the entire view */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* Subtle background glow */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>
      </main>

      {/* Footer / Status bar */}
      <footer className="h-8 px-6 bg-slate-900 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 relative z-50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 uppercase font-bold tracking-tighter">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            FPL API Connected
          </span>
          <span className="flex items-center gap-1.5 uppercase font-bold tracking-tighter">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Gemini Flash 3
          </span>
        </div>
        <div className="font-mono">BUILD_V1.0.5_STABLE</div>
      </footer>
    </div>
  );
};

export default Layout;
