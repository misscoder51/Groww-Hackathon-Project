import { useState } from "react";
import { api } from "@/lib/api";
import { X, Check, Search, Plus, Trash2 } from "lucide-react";
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

  const handleToggle = (ticker: string) => {
    if (tickers.includes(ticker)) {
      setTickers(tickers.filter(t => t !== ticker));
    } else {
      setTickers([...tickers, ticker]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateWatchlist(tickers);
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Watchlist</h2>
                <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white bg-black rounded-full">
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
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                          : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-bold">{stock.ticker}</div>
                        <div className="text-xs opacity-70">{stock.name}</div>
                      </div>
                      {isSelected ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleSave}
                  disabled={saving || tickers.length === 0}
                  className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save Watchlist"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
