"use client";

import { AttentionScoreResult } from "@/types";
import { Plus, Search, PanelLeftClose } from "lucide-react";

interface SidebarProps {
  results: AttentionScoreResult[];
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onManage: () => void;
  onCollapse?: () => void;
}

export const Sidebar = ({ results, selectedTicker, onSelect, onManage, onCollapse }: SidebarProps) => {
  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(1) + "%";

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-gray-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 shrink-0">
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold tracking-wider text-gray-500 dark:text-slate-400 uppercase">Watchlist</h2>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200/70 dark:hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide space-y-1">
        {results.length === 0 ? (
          <div className="text-center px-4 py-8 text-gray-400 dark:text-slate-500 text-sm">
            Your watchlist is empty
          </div>
        ) : (
          results.map((item) => {
            const isSelected = selectedTicker === item.ticker;
            const isPos = item.delta_stock >= 0;
            const isMajor = item.classification === 'major_change';
            const isModerate = item.classification === 'moderate_change';
            
            return (
              <button
                key={item.ticker}
                onClick={() => onSelect(item.ticker)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm group ${
                  isSelected 
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className={`font-semibold tracking-tight ${isSelected ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'}`}>
                  {item.ticker}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`font-medium ${isPos ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                    {formatPercent(item.delta_stock)}
                  </div>
                  <div className="w-2 flex justify-center text-xs">
                    {isMajor ? <span className="text-red-500 dark:text-red-400">●</span> : isModerate ? <span className="text-amber-500 dark:text-amber-400">●</span> : <span className="text-gray-300 dark:text-slate-600">○</span>}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button 
          onClick={onManage}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Manage watchlist
        </button>
      </div>
    </aside>
  );
};
