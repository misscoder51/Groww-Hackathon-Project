"use client";

import { AttentionScoreResult } from "@/types";
import { Search, Settings, Plus, LayoutGrid } from "lucide-react";

export const Sidebar = ({ 
  results = [], 
  selectedTicker, 
  onSelect, 
  onManage 
}: { 
  results: AttentionScoreResult[], 
  selectedTicker: string | null,
  onSelect: (ticker: string) => void,
  onManage: () => void
}) => {
  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(1) + "%";

  return (
    <aside className="w-72 flex-shrink-0 border-r border-neutral-800 bg-neutral-950 flex flex-col hidden md:flex h-full">
      {/* Branding */}
      <div className="p-6 pb-4 border-b border-neutral-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-black text-sm">
          C
        </div>
        <span className="font-semibold text-lg tracking-tight text-white">Context</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xs font-semibold text-neutral-500 tracking-widest uppercase">Watchlist</h2>
          <button onClick={onManage} className="text-neutral-400 hover:text-white transition-colors" aria-label="Manage Watchlist">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Fake Search */}
        <div className="relative mb-4 px-2">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div className="space-y-1">
          {results.map((item) => {
            const isSelected = selectedTicker === item.ticker;
            const isPos = item.delta_stock >= 0;
            const isMajor = item.classification === 'major_change';
            const isModerate = item.classification === 'moderate_change';
            
            return (
              <button
                key={item.ticker}
                onClick={() => onSelect(item.ticker)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm group ${
                  isSelected 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`font-medium ${isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                    {item.ticker}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(item.delta_stock)}
                  </div>
                  <div className="w-2 flex justify-center">
                    {isMajor ? '🔴' : isModerate ? '🟠' : '○'}
                  </div>
                </div>
              </button>
            );
          })}

          {results.length === 0 && (
            <div className="p-4 text-center text-sm text-neutral-500 mt-4 border border-dashed border-neutral-800 rounded-xl">
              Watchlist is empty
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
