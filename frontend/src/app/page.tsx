"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { AttentionInboxResponse, MarketStoriesResponse, UserSession } from "@/types";
import { DitherWave } from "@/components/ui/dither-wave";
import { AlertCircle, CheckCircle2, Settings, RefreshCw, BarChart2 } from "lucide-react";
import { AttentionCard } from "@/components/watchlist/AttentionCard";
import { StockDetailDrawer } from "@/components/watchlist/StockDetailDrawer";
import { MarketStories } from "@/components/watchlist/MarketStories";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";
import { DemoControls } from "@/components/watchlist/DemoControls";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [inbox, setInbox] = useState<AttentionInboxResponse | null>(null);
  const [stories, setStories] = useState<MarketStoriesResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);
  const [showDemoControls, setShowDemoControls] = useState(false);

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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4 text-neutral-400"
        >
          <BarChart2 className="w-12 h-12" />
          <p className="text-xl font-light">Reading your market...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !inbox) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <h2 className="text-xl font-medium">Couldn't refresh market data.</h2>
          <p className="text-sm opacity-80">{error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-neutral-800 pb-24">
      {/* 3-Part Layout: Sidebar + Main Workspace + Drawer */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          results={inbox?.results || []} 
          selectedTicker={selectedTicker} 
          onSelect={setSelectedTicker} 
          onManage={() => setShowWatchlistManager(true)} 
        />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-black text-sm">C</div>
                <span className="font-semibold tracking-tight">Context</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">
                <div className={`w-1.5 h-1.5 rounded-full ${inbox?.is_stale ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                <span className="text-neutral-400">Data status:</span>
                <span className={inbox?.is_stale ? 'text-orange-400' : 'text-emerald-400'}>{inbox?.is_stale ? 'STALE' : 'LIVE'}</span>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <button 
                onClick={() => setShowWatchlistManager(true)}
                className="hidden md:block px-4 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Manage Watchlist
              </button>
              
              <button 
                onClick={() => setShowDemoControls(!showDemoControls)} 
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2 ${showDemoControls ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-neutral-800 text-neutral-500 hover:text-white'}`}
              >
                {showDemoControls && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                DEMO MODE
              </button>
            </div>
          </header>

          {showDemoControls && (
            <div className="absolute top-16 right-6 z-40">
              <DemoControls onClose={() => setShowDemoControls(false)} onReload={loadData} />
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 space-y-12">
            {/* Summary Header */}
            <section className="border-b border-neutral-800 pb-8 relative">
              <p className="text-sm font-semibold tracking-wider text-neutral-500 uppercase mb-2">Since you last checked</p>
              <div className="flex items-center gap-3 text-neutral-400 font-mono text-sm mb-6">
                <span>{session?.last_viewed_at ? new Date(session.last_viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                <span>→</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {inbox && (
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight text-white">
                    {inbox.summary.major_changes + inbox.summary.moderate_changes === 1 
                      ? '1 thing needs your attention' 
                      : `${inbox.summary.major_changes + inbox.summary.moderate_changes} things need your attention`}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="text-red-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> {inbox.summary.major_changes} major</span>
                    <span className="text-orange-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"/> {inbox.summary.moderate_changes} moderate</span>
                    <span className="text-neutral-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-neutral-600"/> {inbox.summary.unchanged} unchanged</span>
                  </div>
                </div>
              )}
              <button onClick={loadData} className="absolute right-0 bottom-8 text-neutral-500 hover:text-white transition-colors p-2" aria-label="Refresh">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </section>

            {/* Stale Warning */}
            <AnimatePresence>
              {inbox?.is_stale && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-400 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Market data may be stale.</p>
                    <p className="text-sm opacity-80 mt-1">{inbox.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

        {/* Watchlist empty state */}
        {session?.watchlist_tickers.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl">
            <p className="text-neutral-400 mb-6">Add stocks to start building your market inbox.</p>
            <button 
              onClick={() => setShowWatchlistManager(true)}
              className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
            >
              Manage Watchlist
            </button>
          </div>
        ) : (
          <>
            {/* Attention Section */}
            <section className="space-y-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {inbox?.results
                    .filter(r => r.classification !== 'unchanged')
                    .sort((a, b) => b.score - a.score)
                    .map((item, i) => (
                      <motion.div
                        key={item.ticker}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <AttentionCard item={item} onClick={() => setSelectedTicker(item.ticker)} />
                      </motion.div>
                    ))}
                </AnimatePresence>

                {inbox?.summary.major_changes === 0 && inbox?.summary.moderate_changes === 0 && (
                  <div className="p-8 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800/50">
                    <p className="text-neutral-400">Nothing important changed since your last check.</p>
                  </div>
                )}
              </div>

              {/* Unchanged summary */}
              {inbox && inbox.summary.unchanged > 0 && (
                <div className="pt-6 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Nothing else needs your attention
                  </div>
                  <p className="text-sm text-neutral-400">
                    {inbox.summary.unchanged} of your {session?.watchlist_tickers.length} stocks showed no meaningful change.
                  </p>
                </div>
              )}
            </section>

            {/* Market Stories */}
            {stories?.stories && stories.stories.length > 0 && (
              <section className="pt-12 space-y-6">
                <h2 className="text-xl font-medium text-neutral-300">Market Stories</h2>
                <MarketStories stories={stories.stories} />
              </section>
            )}

            {/* Acknowledge Button */}
            <section className="pt-10 pb-20 flex justify-center">
              <button 
                onClick={handleAcknowledge}
                className="group flex items-center gap-3 px-8 py-4 bg-white hover:bg-neutral-200 text-black rounded-full transition-all duration-300 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
                Mark as reviewed
              </button>
            </section>
          </>
        )}
          </div>
        </main>
      </div>

      <StockDetailDrawer 
        ticker={selectedTicker} 
        onClose={() => setSelectedTicker(null)} 
      />

      <WatchlistManager 
        isOpen={showWatchlistManager}
        onClose={() => setShowWatchlistManager(false)}
        currentTickers={session?.watchlist_tickers || []}
        onSaved={loadData}
      />
    </main>
  );
}
