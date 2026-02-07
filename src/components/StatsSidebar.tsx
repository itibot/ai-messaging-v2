
import React from 'react';

const StatsSidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-80 flex-col border-l border-white/5 glass-panel h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-8">
        
        {/* Scout Insight Card */}
        <section className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/20 mt-4">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Scout Strategy</p>
            <h4 className="text-sm font-bold text-white mb-2 italic">"Don't ignore the differentials."</h4>
            <p className="text-[11px] text-indigo-100 leading-relaxed">
              With ownership of top assets reaching 70%+, targeting low-ownership players like **Nicolas Jackson** could be key to climbing the ranks.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
        </section>

        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                The Insight Scout is currently monitoring live data feeds. Ask a question in the chat to generate a new scouting report.
            </p>
        </section>

      </div>
    </aside>
  );
};

export default StatsSidebar;
