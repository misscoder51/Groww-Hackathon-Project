"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StockListItem } from "@/types";
import { Search } from "lucide-react";
import { StockDetailView } from "./StockDetailView";
import { DitherWave } from "@/components/ui/dither-wave";
import { TextReveal3D } from "@/components/ui/3d-text-reveal";

export const StocksView = () => {
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listStocks()
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (selectedTicker) {
    return (
      <StockDetailView
        ticker={selectedTicker}
        onBack={() => setSelectedTicker(null)}
      />
    );
  }

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
      {/* Restrained Dither Wave Header Banner */}
      <DitherWave className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/80 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 tracking-tight flex items-center">
          <TextReveal3D text="Explore Stocks" />
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-xl text-sm sm:text-base">
          Browse and analyze companies with Context attention intelligence.
        </p>
      </DitherWave>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stocks by ticker or company..."
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 shadow-sm transition-shadow"
        />
      </div>

      {/* Stock Cards List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 dark:bg-slate-800/60 rounded-xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => setSelectedTicker(stock.ticker)}
              className="w-full text-left p-4 sm:p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all flex justify-between items-center group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                    {stock.ticker}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                    {stock.sector}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {stock.company}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                  ₹{stock.current_price.toFixed(2)}
                </div>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-0.5">
                  Analyze <span>→</span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-gray-50/50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
              No stocks found matching &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StocksView;
