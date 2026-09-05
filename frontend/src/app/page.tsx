"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { AttentionInboxResponse, MarketStoriesResponse, UserSession, AttentionScoreResult } from "@/types";
import { AlertCircle, CheckCircle2, RefreshCw, Activity, ChevronRight, PanelLeft } from "lucide-react";
import { AttentionCard } from "@/components/watchlist/AttentionCard";
import { StockDetailDrawer } from "@/components/watchlist/StockDetailDrawer";
import { MarketStories } from "@/components/watchlist/MarketStories";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";
import { DemoControls } from "@/components/watchlist/DemoControls";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { StocksView } from "@/components/stocks/StocksView";

export default function Home() {
  const [currentView, setCurrentView] = useState<'watchlist' | 'stocks'>('watchlist');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('nocap_sidebar_open');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const toggleSidebar = (open: boolean) => {
    setIsSidebarOpen(open);
    try {
      sessionStorage.setItem('nocap_sidebar_open', String(open));
    } catch {
      // ignore
    }
  };

  const [session, setSession] = useState<UserSession | null>(null);
  const [inbox, setInbox] = useState<AttentionInboxResponse | null>(null);
  const [stories, setStories] = useState<MarketStoriesResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);
  const [showDemoControls, setShowDemoControls] = useState(false);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveEvent, setLiveEvent] = useState<AttentionScoreResult | null>(null);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessData, inboxData, storiesData] = await Promise.all([
        api.getSession(),
        api.getInbox(),
        api.getStories()
      ]);
      setSession(sessData);
      setInbox(inboxData);
      setStories(storiesData);
    } catch (err: any) {
      setError(err.message || "Failed to load market data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let evtSource: EventSource | null = null;
    
    if (isLiveMode) {
      setLiveStatus('connecting');
      evtSource = new EventSource(api.getEventSourceURL());
      
      evtSource.onopen = () => {
        setLiveStatus('connected');
      };
      
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as AttentionScoreResult;
          setLiveEvent(data);
          
          setInbox(prev => {
            if (!prev) return prev;
            const newResults = [...prev.results];
            const idx = newResults.findIndex(r => r.ticker === data.ticker);
            
            // Adjust summaries
            const summary = { ...prev.summary };
            if (idx >= 0) {
              const oldClass = newResults[idx].classification;
              if (oldClass === 'major_change') summary.major_changes--;
              if (oldClass === 'moderate_change') summary.moderate_changes--;
              if (oldClass === 'unchanged') summary.unchanged--;
              newResults[idx] = data;
            } else {
              newResults.push(data);
            }
            
            if (data.classification === 'major_change') summary.major_changes++;
            if (data.classification === 'moderate_change') summary.moderate_changes++;
            if (data.classification === 'unchanged') summary.unchanged++;
            
            return { ...prev, results: newResults, summary };
          });
          
          // Clear notification after 5s
          setTimeout(() => setLiveEvent(null), 5000);
        } catch (e) {
          console.error("Error parsing SSE data", e);
        }
      };
      
      evtSource.onerror = () => {
        setLiveStatus('error');
      };
    } else {
      setLiveStatus('disconnected');
    }

    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, [isLiveMode]);

  const handleAcknowledge = async () => {
    try {
      await api.acknowledgeSession();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !inbox) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 dark:text-slate-500 font-medium">Checking market...</p>
        </div>
      </div>
    );
  }

  if (error && !inbox) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl max-w-md w-full border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold">Connection Error</h3>
          </div>
          <p className="text-sm opacity-90">{error}</p>
          <button onClick={loadData} className="mt-4 text-sm font-semibold hover:underline">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {currentView === 'watchlist' && isSidebarOpen && (
        <Sidebar 
          results={inbox?.results || []} 
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
          onManage={() => setShowWatchlistManager(true)}
          onCollapse={() => toggleSidebar(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto relative scrollbar-hide">
        <main className="flex-1 min-h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800">
          {/* Top Navigation */}
          <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3 sm:gap-5">
              {currentView === 'watchlist' && !isSidebarOpen && (
                <button
                  onClick={() => toggleSidebar(true)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Open watchlist sidebar"
                  aria-label="Open watchlist sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-slate-100 flex items-center justify-center font-bold text-white dark:text-slate-900 text-xs tracking-wider">
                  NC
                </div>
                <span className="font-bold text-gray-900 dark:text-slate-100 tracking-tight">NoCap</span>
              </div>
              
              <nav className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/60 p-1 rounded-lg">
                <button 
                  onClick={() => setCurrentView('stocks')} 
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${currentView === 'stocks' ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"}`}
                >
                  Stocks
                </button>
                <button 
                  onClick={() => setCurrentView('watchlist')} 
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${currentView === 'watchlist' ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"}`}
                >
                  My Watchlist
                </button>
              </nav>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
              
              <button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2 font-bold ${isLiveMode ? (liveStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400' : 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-900/30 text-teal-700 dark:text-teal-400') : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                title={liveStatus === 'error' ? "Connection failed" : liveStatus === 'connecting' ? "Connecting..." : ""}
              >
                <div className="relative flex h-2 w-2 items-center justify-center">
                  {isLiveMode && liveStatus !== 'error' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isLiveMode ? (liveStatus === 'error' ? 'bg-red-500' : 'bg-teal-500') : 'bg-gray-400 dark:bg-slate-500'}`}></span>
                </div>
                LIVE MODE {isLiveMode ? 'ON' : 'OFF'}
              </button>

              <button 
                onClick={() => setShowDemoControls(!showDemoControls)} 
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2 ${showDemoControls ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-500' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                {showDemoControls && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                DEMO MODE
              </button>
            </div>
          </header>

          {showDemoControls && (
            <div className="absolute top-16 right-6 z-40 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-gray-100 dark:border-slate-800 p-2">
              <DemoControls onClose={() => setShowDemoControls(false)} onReload={loadData} />
            </div>
          )}

          
            {currentView === 'stocks' ? (
              <StocksView />
            ) : (
              <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
            {/* Summary Header */}
            <section className="border-b border-gray-200 dark:border-slate-800 pb-6 relative">
              <p className="text-xs font-semibold tracking-wider text-gray-400 dark:text-slate-500 uppercase mb-1.5">Since you last checked</p>
              <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-400 font-medium text-xs mb-4 bg-gray-50 dark:bg-slate-800/60 w-fit px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-700/60">
                <span>{session?.last_viewed_at ? new Date(session.last_viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                <span>→</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {inbox && (
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                    {inbox.summary.major_changes + inbox.summary.moderate_changes === 1 
                      ? '1 item needs attention' 
                      : `${inbox.summary.major_changes + inbox.summary.moderate_changes} items need attention`}
                  </h1>
                  <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/> {inbox.summary.major_changes} major</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> {inbox.summary.moderate_changes} moderate</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-gray-300 dark:border-slate-600"/> {inbox.summary.unchanged} unchanged</span>
                  </div>
                </div>
              )}
              <button onClick={loadData} className="absolute right-0 bottom-6 text-gray-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1.5" aria-label="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </section>

            {/* Stale Warning */}
            <AnimatePresence>
              {inbox?.is_stale && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-lg text-amber-800 dark:text-amber-500 flex items-start gap-3 shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                  <div>
                    <p className="font-semibold text-sm">Market data may be stale.</p>
                    <p className="text-xs opacity-90 mt-0.5">{inbox.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

        {/* Watchlist empty state */}
        {session?.watchlist_tickers.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/20">
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Add stocks to start building your watchlist.</p>
            <button 
              onClick={() => setShowWatchlistManager(true)}
              className="px-5 py-2.5 bg-teal-600 dark:bg-teal-500 text-white font-medium text-sm rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-sm"
            >
              Manage Watchlist
            </button>
          </div>
        ) : (
          <>
            {/* Attention Section */}
            <section className="space-y-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {inbox?.results
                    .filter(r => r.classification !== 'unchanged')
                    .sort((a, b) => b.score - a.score)
                    .map((item, i) => (
                      <motion.div
                        key={item.ticker}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <AttentionCard item={item} onClick={() => setSelectedTicker(item.ticker)} />
                      </motion.div>
                    ))}
                </AnimatePresence>

                {inbox?.summary.major_changes === 0 && inbox?.summary.moderate_changes === 0 && (
                  <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Nothing important changed since your last check.</p>
                  </div>
                )}
              </div>

              {/* Unchanged summary */}
              {inbox && inbox.summary.unchanged > 0 && (
                <div className="pt-4 pb-2">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-500 font-medium text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Nothing else needs your attention
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 text-xs pl-6">
                    {inbox.summary.unchanged} of your {session?.watchlist_tickers.length} stocks showed no meaningful change.
                  </p>
                </div>
              )}
            </section>

            {/* Market Stories */}
            {stories?.stories && stories.stories.length > 0 && (
              <section className="pt-6 space-y-4 border-t border-gray-200 dark:border-slate-800">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 tracking-tight">Market Stories</h2>
                <MarketStories stories={stories.stories} />
              </section>
            )}

            {/* Acknowledge Button */}
            <section className="pt-8 pb-16 flex justify-center">
              <button 
                onClick={handleAcknowledge}
                className="group flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-slate-800 hover:bg-gray-800 dark:hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-teal-400 dark:group-hover:text-teal-400 transition-colors" />
                Mark as reviewed
              </button>
            </section>
          </>
        )}
          </div>
            )}
        </main>
      </div>

      <StockDetailDrawer 
        ticker={selectedTicker} 
        onClose={() => setSelectedTicker(null)} 
      />

      <AnimatePresence>
        {liveEvent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/50 shadow-2xl rounded-2xl p-5 w-80 shadow-teal-900/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">New Attention</span>
            </div>
            
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">{liveEvent.ticker}</h4>
              <span className={`font-bold ${liveEvent.delta_stock >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                {liveEvent.delta_stock >= 0 ? '+' : ''}{(liveEvent.delta_stock * 100).toFixed(1)}%
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-4">
              {liveEvent.catalyst?.title || (liveEvent.volume_ratio > 2 ? 'Unusually high trading activity' : 'Significant price movement')}
            </p>
            
            <button 
              onClick={() => {
                setSelectedTicker(liveEvent.ticker);
                setLiveEvent(null);
              }}
              className="w-full py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm font-semibold rounded-lg transition-colors"
            >
              View details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <WatchlistManager 
        isOpen={showWatchlistManager}
        onClose={() => setShowWatchlistManager(false)}
        currentTickers={session?.watchlist_tickers || []}
        onSaved={loadData}
      />
    </main>
  );
}
