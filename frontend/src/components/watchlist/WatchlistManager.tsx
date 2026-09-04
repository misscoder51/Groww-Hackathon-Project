"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { X, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AVAILABLE_STOCKS = [
  { ticker: "TCS", name: "Tata Consultancy Services" },
  { ticker: "INFY", name: "Infosys" },
  { ticker: "RELIANCE", name: "Reliance Industries" },
  { ticker: "HDFCBANK", name: "HDFC Bank" },
  { ticker: "ITC", name: "ITC Limited" },
];

export const WatchlistManager = ({ 
  isOpen, 
  onClose, 
  currentTickers,
  onSaved
}: { 
  isOpen: boolean, 
  onClose: () => void,
  currentTickers: string[],
  onSaved: () => void
}) => {
  const [tickers, setTickers] = useState<string[]>(currentTickers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTickers(currentTickers);
      setError(null);
    }
  }, [isOpen, currentTickers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = (ticker: string) => {
    setError(null);
    if (tickers.includes(ticker)) {
      setTickers(tickers.filter(t => t !== ticker));
    } else {
      setTickers([...tickers, ticker]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateWatchlist(tickers);
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save your watchlist. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="watchlist-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="watchlist-title"
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden outline-none"
          >
            <div className="flex justify-between items-center mb-6">
                <h2 id="watchlist-title" className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Manage Watchlist</h2>
                <button 
                  onClick={onClose} 
                  className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 bg-gray-50 dark:bg-slate-800 rounded-full transition-colors"
                  aria-label="Close manage watchlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {AVAILABLE_STOCKS.map(stock => {
                  const isSelected = tickers.includes(stock.ticker);
                  return (
                    <button
                      key={stock.ticker}
                      onClick={() => handleToggle(stock.ticker)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-900/50 text-teal-900 dark:text-teal-100 shadow-sm' 
                          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-left">
                        <div className={`font-bold ${isSelected ? 'text-teal-900 dark:text-teal-100' : 'text-gray-900 dark:text-slate-200'}`}>{stock.ticker}</div>
                        <div className="text-xs mt-0.5">{stock.name}</div>
                      </div>
                      {isSelected ? <Check className="w-5 h-5 text-teal-600 dark:text-teal-400" /> : <Plus className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                    {error}
                  </div>
                )}
                <button 
                  onClick={handleSave}
                  disabled={saving || tickers.length === 0}
                  className="w-full py-3.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saving ? "Saving..." : "Save Watchlist"}
                </button>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
