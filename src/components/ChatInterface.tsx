
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ChatOrchestrator } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  onAddToBuilder: (content: string, title: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAddToBuilder }) => {
  const orchestratorRef = useRef<ChatOrchestrator | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new ChatOrchestrator();
  }

  useEffect(() => {
    if (orchestratorRef.current?.initError) {
      setInitError(orchestratorRef.current.initError);
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello Manager! ⚽️ I'm your **FPL Insight Scout**, now connected to our advanced betting and stats intelligence engine. \n\nI'm ready to analyze your squad. Who should we look at today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Improved scroll logic: When a new message arrives, scroll to its TOP, not the bottom of the container.
  useEffect(() => {
    if (messages.length > 1 && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages.length]);

  const extractTitle = (content: string): string => {
    const headerMatch = content.match(/^#+\s*(.*)/m);
    if (headerMatch && headerMatch[1]) {
      return headerMatch[1].trim();
    }
    const firstLine = content.split('\n')[0].replace(/[#*`]/g, '').trim();
    return firstLine.length > 40 ? firstLine.substring(0, 37) + '...' : firstLine;
  };

  const handleAddToBuilder = (msg: ChatMessage) => {
    const title = extractTitle(msg.content);
    onAddToBuilder(msg.content, title);
    setAddedIds(prev => new Set([...prev, msg.id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await orchestratorRef.current!.sendMessage(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        data: response.data
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble reaching the scouting network. Please check your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (initError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-outfit font-bold text-white mb-3">Scouting Network Offline</h2>
        <p className="text-slate-400 max-w-md leading-relaxed mb-8">
          {initError}
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-500 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></div>
          Ensure your <code className="text-emerald-400">GEMINI_API_KEY</code> is set in Vercel project settings.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full relative">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12 pb-24"
      >
        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <div
              key={msg.id}
              ref={isLast ? lastMessageRef : null}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse max-w-[80%]' : 'flex-row max-w-full'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 shadow-indigo-500/20' : 'fpl-gradient shadow-emerald-500/20'
                  }`}>
                  {msg.role === 'user' ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>

                {/* Message Content Area */}
                <div className={`flex-1 flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="relative flex w-full items-start gap-4">
                    {/* The main bubble */}
                    <div className={`flex-1 rounded-2xl text-sm leading-relaxed overflow-hidden ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none p-4 shadow-xl border border-white/5'
                      : 'glass-panel text-slate-200 rounded-tl-none border border-white/10 shadow-2xl'
                      }`}>
                      <div className={`prose prose-invert prose-sm max-w-none ${msg.role === 'assistant' ? 'p-6' : ''}`}>
                        <ReactMarkdown
                          components={{
                            table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="min-w-full divide-y divide-white/10" {...props} /></div>,
                            th: ({ node, ...props }) => <th className="px-3 py-3 text-left text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-white/5" {...props} />,
                            td: ({ node, ...props }) => <td className="px-3 py-3 text-[12px] whitespace-nowrap text-slate-300 border-t border-white/5" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* FLOATING STICKY ACTION BUTTON */}
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="hidden sm:block sticky top-6 z-20 shrink-0">
                        <button
                          onClick={() => handleAddToBuilder(msg)}
                          disabled={addedIds.has(msg.id)}
                          className={`flex flex-col items-center justify-center gap-3 w-16 h-48 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all vertical-text ${addedIds.has(msg.id)
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 opacity-50'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-2xl shadow-emerald-500/30 active:scale-[0.95] hover:-translate-y-1'
                            }`}
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          <div style={{ transform: 'rotate(90deg)' }} className="mb-2">
                            {addedIds.has(msg.id) ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </div>
                          <span className="mt-2">{addedIds.has(msg.id) ? 'ADDED TO SCOUT' : 'ADD TO REPORT'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 mt-2 px-1 uppercase font-bold tracking-[0.1em]">
                    {msg.role === 'user' ? 'Manager' : 'Scout Intelligence Engine'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Mobile-only fallback button for small screens */}
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <button
                      onClick={() => handleAddToBuilder(msg)}
                      disabled={addedIds.has(msg.id)}
                      className={`sm:hidden w-full mt-3 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${addedIds.has(msg.id)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-emerald-500 text-slate-950'
                        }`}
                    >
                      {addedIds.has(msg.id) ? 'Added to Report' : 'Add to Scouting Report'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl fpl-gradient flex-shrink-0" />
              <div className="glass-panel p-5 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Floating glass design */}
      <div className="p-6 pt-2 sticky bottom-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <form
          onSubmit={handleSubmit}
          className="relative group max-w-4xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-3xl blur-lg opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <div className="relative glass-panel rounded-2xl border border-white/10 flex items-center overflow-hidden bg-slate-900/90 shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the engine about players, fixtures, or betting insights..."
              className="flex-1 bg-transparent px-8 py-5 outline-none text-sm placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mr-4 p-3 rounded-xl bg-emerald-500 text-slate-950 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-[0.2em] opacity-60">
          The <span className="text-emerald-400">Add to Report</span> tool floats alongside intelligence data for quick campaign building.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
