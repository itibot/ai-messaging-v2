import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BuilderSnippet } from '../App';
import { generateMessageVariants, generateCreativeOptions } from '../services/geminiService';

interface MessageBuilderProps {
  snippets: BuilderSnippet[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onSwitchToChat: () => void;
}

type Channel = 'Push' | 'Social' | 'Email';

const MessageBuilder: React.FC<MessageBuilderProps> = ({ snippets, onRemove, onClear, onSwitchToChat }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy All Reports');
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeChannel, setActiveChannel] = useState<Channel>('Push');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<{ label: string; content: string }[]>([]);
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableContent, setEditableContent] = useState<string>('');
  const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
  const [creatives, setCreatives] = useState<string[]>([]);
  const [selectedCreativeIndex, setSelectedCreativeIndex] = useState<number | null>(null);

  const [bloomreachPushing, setBloomreachPushing] = useState(false);
  const [movableInkPushing, setMovableInkPushing] = useState(false);

  const handleCopyAll = () => {
    if (snippets.length === 0) return;
    const fullReport = snippets.map(s => `## Scouting Report: ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullReport);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy All Reports'), 2000);
  };

  const toggleExpand = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const newSet = new Set(expandedIndices);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedIndices(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0 || isGenerating) return;
    
    setIsGenerating(true);
    setVariants([]); 
    setSelectedVariantIndex(null);
    setEditableTitle('');
    setEditableContent('');
    setCreatives([]);
    setSelectedCreativeIndex(null);
    
    const selectedContent = snippets
      .filter(s => selectedIds.has(s.id))
      .map(s => s.content)
      .join('\n\n');

    try {
      const results = await generateMessageVariants(selectedContent, activeChannel);
      setVariants(results);
      setTimeout(() => {
        const target = document.getElementById('variants-output-section');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error("UI Generation Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIndex(idx);
    setEditableTitle(variants[idx].label);
    setEditableContent(variants[idx].content);
    setSelectedCreativeIndex(null);
    // Scroll to creative section
    setTimeout(() => {
      const target = document.getElementById('creative-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGenerateCreative = async () => {
    if (selectedVariantIndex === null || isGeneratingCreative) return;
    
    setIsGeneratingCreative(true);
    setCreatives([]);
    
    try {
      const results = await generateCreativeOptions(editableContent || variants[selectedVariantIndex].content);
      setCreatives(results);
    } catch (err) {
      console.error("Creative Generation Error:", err);
    } finally {
      setIsGeneratingCreative(false);
    }
  };

  const handleSelectCreative = (idx: number) => {
    setSelectedCreativeIndex(idx);
    setTimeout(() => {
      const target = document.getElementById('final-preview-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDownloadAssets = () => {
    if (selectedCreativeIndex === null || selectedVariantIndex === null) return;
    
    const assetId = `SCOUT_${Date.now()}`;
    const escapedContent = editableContent.replace(/"/g, '""');
    const csvContent = `asset_id,copy\n${assetId},"${escapedContent}"`;
    
    // Download CSV
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.setAttribute('download', `${assetId}.csv`);
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);

    // Download Image
    const imgData = creatives[selectedCreativeIndex];
    const imgLink = document.createElement('a');
    imgLink.href = imgData;
    imgLink.setAttribute('download', `${assetId}.png`);
    document.body.appendChild(imgLink);
    imgLink.click();
    document.body.removeChild(imgLink);
  };

  const handlePushToBloomreach = () => {
    setBloomreachPushing(true);
    setTimeout(() => setBloomreachPushing(false), 2000);
  };

  const handlePushToMovableInk = () => {
    setMovableInkPushing(true);
    setTimeout(() => setMovableInkPushing(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-outfit font-bold text-white tracking-tight">
            Message <span className="text-emerald-400">Builder</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg">
            Build your multi-channel campaign. Select reports, generate AI-optimized copy, and pair them with high-end creative visuals.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={onClear}
            className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest px-3 py-2"
          >
            Clear All
          </button>
          <button 
            onClick={handleCopyAll}
            disabled={snippets.length === 0}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/5 transition-all disabled:opacity-20 shadow-xl"
          >
            {copyStatus}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Flow */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-16">
          
          {/* Section 1: Snippet Selection */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">1</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select Scouting Reports</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                {selectedIds.size} Selected
              </span>
            </div>
            
            <div className="space-y-4">
              {snippets.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/20 group hover:border-emerald-500/20 transition-all cursor-pointer" onClick={onSwitchToChat}>
                  <p className="text-sm font-medium text-slate-400">Bag is empty. Return to Chat to gather reports.</p>
                </div>
              ) : (
                snippets.map((snippet, idx) => (
                  <div 
                    key={snippet.id}
                    onClick={() => toggleSelect(snippet.id)}
                    className={`group glass-panel rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedIds.has(snippet.id) 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-5">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                        selectedIds.has(snippet.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                      }`}>
                        {selectedIds.has(snippet.id) && <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <h4 className={`text-base font-bold flex-1 truncate ${selectedIds.has(snippet.id) ? 'text-emerald-400' : 'text-slate-100'}`}>{snippet.title}</h4>
                      <button onClick={(e) => toggleExpand(e, idx)} className="p-2 text-slate-500"><svg className={`w-5 h-5 transition-transform ${expandedIndices.has(idx) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(idx); }} className="p-2 text-slate-600 hover:text-rose-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                    {expandedIndices.has(idx) && (
                      <div className="px-14 pb-6 pt-2 border-t border-white/5 text-sm text-slate-400 prose prose-invert prose-emerald max-w-none"><ReactMarkdown>{snippet.content}</ReactMarkdown></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section 3: Generated Variants */}
          <section id="variants-output-section" className="flex flex-col scroll-mt-24">
            <div className="flex items-center gap-4 mb-8">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">3</span>
               <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Copy Variations</span>
               <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <div className="min-h-[200px]">
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 bg-slate-900/10 rounded-3xl border border-white/5 animate-pulse">
                  <span className="text-sm text-slate-500">Optimizing narratives for {activeChannel}...</span>
                </div>
              ) : variants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {variants.map((v, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelectVariant(i)}
                      className={`flex flex-col glass-panel rounded-2xl border-2 p-6 transition-all cursor-pointer relative overflow-hidden ${
                        selectedVariantIndex === i ? 'border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{v.label}</span>
                        {selectedVariantIndex === i && <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Active</span>}
                      </div>
                      <div className="text-sm text-slate-200 leading-relaxed mb-6"><ReactMarkdown>{v.content}</ReactMarkdown></div>
                      <div className="mt-auto text-[10px] font-mono text-slate-500 uppercase tracking-widest">{activeChannel} Mode</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 italic text-slate-500 text-sm">Select reports to generate copy...</div>
              )}
            </div>
          </section>

          {/* Section 4: Creative Labs */}
          {selectedVariantIndex !== null && (
            <section id="creative-section" className="flex flex-col scroll-mt-24 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">4</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Creative Visuals</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="max-w-md">
                    <h4 className="text-lg font-bold text-white mb-1">Visual Intelligence Engine</h4>
                    <p className="text-xs text-slate-400">Generate custom high-conversion imagery tailored to the selected narrative.</p>
                  </div>
                  <button 
                    onClick={handleGenerateCreative}
                    disabled={isGeneratingCreative}
                    className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-30"
                  >
                    {isGeneratingCreative ? 'Generating...' : 'Generate 3 Concepts'}
                  </button>
                </div>

                <div className="min-h-[300px]">
                  {isGeneratingCreative ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1,2,3].map(i => <div key={i} className="aspect-square rounded-2xl bg-slate-900 animate-pulse border border-white/5"></div>)}
                    </div>
                  ) : creatives.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {creatives.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSelectCreative(i)}
                          className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${
                            selectedCreativeIndex === i ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Creative Concept" />
                          <div className={`absolute inset-0 flex items-center justify-center bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity ${selectedCreativeIndex === i ? 'opacity-100' : ''}`}>
                            <span className="px-4 py-2 bg-slate-950 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/20">
                              {selectedCreativeIndex === i ? 'Selected' : 'Select Design'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center opacity-30 italic text-slate-500 text-sm">Hit generate to start visual crafting...</div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Final Preview Section */}
          {selectedCreativeIndex !== null && selectedVariantIndex !== null && (
            <section id="final-preview-section" className="flex flex-col scroll-mt-24 pb-20 animate-in zoom-in-95 duration-700">
               <div className="flex items-center gap-4 mb-10">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">5</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Final Campaign Preview</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>

              <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
                 {/* The Device Frame */}
                 <div className="relative w-full max-w-sm mx-auto lg:mx-0">
                    <div className="aspect-[9/19] rounded-[3rem] border-8 border-slate-900 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col p-4">
                       <div className="w-24 h-6 bg-slate-900 rounded-b-2xl self-center mb-8"></div>
                       
                       {/* Mock UI Content */}
                       <div className="flex-1 flex flex-col gap-4">
                          <div className="flex items-center gap-2 px-2">
                             <div className="w-6 h-6 fpl-gradient rounded-md"></div>
                             <span className="text-[10px] font-bold text-white/50">FPL INSIGHT SCOUT • NOW</span>
                          </div>
                          
                          <div className="rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 flex flex-col">
                             <img src={creatives[selectedCreativeIndex]} className="w-full aspect-video object-cover" alt="Campaign Visual" />
                             <div className="p-4 bg-slate-900/50 backdrop-blur-md flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1 group/title-edit">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
                                  <input 
                                    type="text"
                                    value={editableTitle}
                                    onChange={(e) => setEditableTitle(e.target.value)}
                                    className="flex-1 bg-transparent text-emerald-400 font-bold text-[9px] uppercase tracking-widest outline-none border-none focus:ring-1 focus:ring-emerald-500/30 rounded px-1 transition-all"
                                    spellCheck={false}
                                  />
                                </div>
                                <div className="relative group/edit">
                                  <textarea 
                                    value={editableContent}
                                    onChange={(e) => setEditableContent(e.target.value)}
                                    className="w-full bg-transparent text-[11px] text-slate-300 leading-relaxed min-h-[120px] max-h-[120px] outline-none border-none resize-none custom-scrollbar focus:ring-1 focus:ring-emerald-500/30 rounded p-1 transition-all"
                                    placeholder="Type to customize message..."
                                    spellCheck={false}
                                  />
                                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/edit:opacity-40 transition-opacity pointer-events-none">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </div>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="w-32 h-1 bg-white/20 rounded-full self-center mb-4 mt-auto"></div>
                    </div>
                    <div className="absolute -z-10 -inset-10 bg-emerald-500/10 blur-3xl rounded-full animate-pulse"></div>
                 </div>

                 {/* Control Panel */}
                 <div className="flex-1 space-y-6 lg:max-w-md">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10">
                       <h4 className="text-2xl font-outfit font-bold text-white mb-2">Campaign Ready</h4>
                       <p className="text-sm text-slate-400 mb-6 leading-relaxed">Your custom message and creative have been synchronized. Export this package for deployment.</p>
                       
                       <div className="space-y-3">
                          <button 
                            onClick={handleDownloadAssets}
                            className="w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                          >
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             Download Assets
                          </button>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                              onClick={handlePushToBloomreach}
                              disabled={bloomreachPushing}
                              className={`py-3 px-2 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                bloomreachPushing ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                              }`}
                             >
                                {bloomreachPushing ? 'Pushed!' : 'Push to Bloomreach'}
                             </button>
                             <button 
                              onClick={handlePushToMovableInk}
                              disabled={movableInkPushing}
                              className={`py-3 px-2 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                movableInkPushing ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                              }`}
                             >
                                {movableInkPushing ? 'Pushed!' : 'Push to Movable Ink'}
                             </button>
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">Download includes a CSV with Asset ID and Copy, plus the matching high-res graphical asset.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Sticky Config */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 relative">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20">2</span>
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Configuration</span>
            </div>
            
            <div className="glass-panel rounded-3xl border border-white/10 p-8 flex flex-col gap-8 shadow-2xl">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block mb-5">Select Target Channel</label>
                <div className="space-y-3">
                  {(['Push', 'Social', 'Email'] as Channel[]).map(chan => (
                    <button
                      key={chan}
                      onClick={() => setActiveChannel(chan)}
                      className={`w-full py-4 px-6 text-sm font-bold rounded-2xl transition-all border text-left flex items-center justify-between group ${
                        activeChannel === chan 
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' 
                          : 'border-white/10 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'
                      }`}
                    >
                      {chan}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === chan ? 'bg-slate-950/20' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`}>
                        {activeChannel === chan ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <button
                  onClick={handleGenerate}
                  disabled={selectedIds.size === 0 || isGenerating}
                  className="w-full py-5 rounded-2xl bg-emerald-500 text-slate-950 font-outfit font-bold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-20 shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                >
                  {isGenerating ? 'Drafting...' : 'Generate 3 Variants'}
                </button>
                {selectedIds.size === 0 && (
                  <p className="text-[10px] text-center text-slate-500 mt-5 font-bold uppercase tracking-widest animate-pulse">Select reports to activate engine</p>
                )}
              </div>
            </div>

            {/* Progress Checklist */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 space-y-4">
               <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Campaign Checklist</h5>
               <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${selectedIds.size > 0 ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}></div>
                  <span className={`text-[11px] font-medium ${selectedIds.size > 0 ? 'text-slate-200' : 'text-slate-500'}`}>Select Reports</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${variants.length > 0 ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}></div>
                  <span className={`text-[11px] font-medium ${variants.length > 0 ? 'text-slate-200' : 'text-slate-500'}`}>Generate Copy</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${selectedVariantIndex !== null ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}></div>
                  <span className={`text-[11px] font-medium ${selectedVariantIndex !== null ? 'text-slate-200' : 'text-slate-500'}`}>Select Narrative</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${creatives.length > 0 ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}></div>
                  <span className={`text-[11px] font-medium ${creatives.length > 0 ? 'text-slate-200' : 'text-slate-500'}`}>Generate Visuals</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MessageBuilder;
