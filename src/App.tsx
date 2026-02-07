import React, { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/Layout';

// Lazy load heavy components
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const MessageBuilder = lazy(() => import('./components/MessageBuilder'));
const BrandLLM = lazy(() => import('./components/BrandLLM'));

export type BuilderSnippet = {
  id: string;
  title: string;
  content: string;
};

export type AppView = 'chat' | 'builder' | 'brand-llm';

const LoadingView = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
  </div>
);

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-950">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-lg font-bold"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('chat');
  const [builderMessages, setBuilderMessages] = useState<BuilderSnippet[]>(() => {
    const saved = localStorage.getItem('fpl_builder_messages_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle URL-based routing for root domain
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      if (['chat', 'builder', 'brand-llm'].includes(path)) {
        setActiveView(path as AppView);
      } else if (!path) {
        setActiveView('chat');
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial check on mount

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('fpl_builder_messages_v2', JSON.stringify(builderMessages));
  }, [builderMessages]);

  const navigate = (view: AppView) => {
    setActiveView(view);
    window.history.pushState({}, '', `/${view}`);
  };

  const addToBuilder = (snippet: BuilderSnippet) => {
    setBuilderMessages(prev => [...prev, snippet]);
  };

  const removeFromBuilder = (index: number) => {
    setBuilderMessages(prev => prev.filter((_, i) => i !== index));
  };

  const clearBuilder = () => {
    setBuilderMessages([]);
  };

  return (
    <Layout onNavigate={(view) => navigate(view as AppView)}>
      <div className="flex flex-col min-h-0">
        {/* Sub-Header Navigation Tabs - Sticky to keep context */}
        <div className="sticky top-0 z-40 flex items-center px-6 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <button
            onClick={() => navigate('chat')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeView === 'chat'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Scout Chat
          </button>
          <button
            onClick={() => navigate('builder')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeView === 'builder'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Message Builder
            {builderMessages.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">
                {builderMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('brand-llm')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeView === 'brand-llm'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Brand LLM
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 flex flex-col">
          <ErrorBoundary>
            <Suspense fallback={<LoadingView />}>
              {activeView === 'chat' ? (
                <div className="h-[calc(100vh-128px)] flex flex-col">
                  <ChatInterface onAddToBuilder={(content, title) => addToBuilder({
                    id: Date.now().toString(),
                    title: title || 'Insight Snippet',
                    content
                  })} />
                </div>
              ) : activeView === 'builder' ? (
                <MessageBuilder
                  snippets={builderMessages}
                  onRemove={removeFromBuilder}
                  onClear={clearBuilder}
                  onSwitchToChat={() => navigate('chat')}
                />
              ) : (
                <BrandLLM />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Layout>
  );
};

export default App;