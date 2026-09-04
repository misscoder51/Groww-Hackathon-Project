import { AttentionScoreResult } from "@/types";
import { TrendingDown, TrendingUp, AlertTriangle, Info } from "lucide-react";

export const AttentionCard = ({ item, onClick }: { item: AttentionScoreResult, onClick: () => void }) => {
  const isPositive = item.delta_stock >= 0;
  const isMajor = item.classification === 'major_change';
  
  const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";
  
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-300 group
        ${isMajor 
          ? 'bg-neutral-900 border-red-500/30 hover:border-red-500/50' 
          : 'bg-neutral-900/50 border-orange-500/20 hover:border-orange-500/40'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${isMajor ? 'bg-red-500 shadow-red-500/50' : 'bg-orange-500 shadow-orange-500/50'}`} />
          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">{item.ticker}</h3>
          {isMajor && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-red-500/10 text-red-400 rounded-sm">Major</span>}
        </div>
        <div className={`text-xl sm:text-2xl font-medium flex items-center gap-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />}
          {isPositive ? "+" : ""}{formatPercent(item.delta_stock)}
        </div>
      </div>

      <div className="space-y-2 text-sm sm:text-base text-neutral-400 pl-5 sm:pl-6 border-l-2 border-neutral-800">
        {item.catalyst ? (
          <p className="text-neutral-200">{item.catalyst.title}</p>
        ) : item.volume_ratio > 2 ? (
          <p className="text-neutral-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Unusual volume spike ({item.volume_ratio.toFixed(1)}x normal)
          </p>
        ) : (
          <p className="text-neutral-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {item.delta_sector < -0.01 && item.delta_stock < 0 ? "Broad sector weakness" : "Unusual relative movement"}
          </p>
        )}
      </div>
    </button>
  );
};
