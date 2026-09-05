import { AttentionScoreResult } from "@/types";

interface AttentionCardProps {
  item: AttentionScoreResult;
  onClick: () => void;
}

export const AttentionCard = ({ item, onClick }: AttentionCardProps) => {
  const isPositive = item.delta_stock >= 0;
  const isMajor = item.classification === 'major_change';

  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(1) + "%";

  const getWhy = () => {
    if (item.catalyst) return `Catalyst: ${item.catalyst.title}`;
    if (item.has_corporate_action) return "A scheduled corporate event is affecting the price.";
    return "The system detected movement without a known external catalyst.";
  };

  const getUnusual = () => {
    if (Math.abs(item.alpha) > 0.02 && item.volume_ratio > 1.5) {
      return `Moving heavily on unusually high volume (${item.volume_ratio.toFixed(1)}x).`;
    }
    if (Math.abs(item.alpha) > 0.02) {
      return "Moving independently from its sector.";
    }
    if (item.volume_ratio > 1.5) {
      return `High trading volume (${item.volume_ratio.toFixed(1)}x) compared to normal.`;
    }
    return "Movement and volume are within normal statistical ranges.";
  };

  const getMatters = () => {
    if (isMajor) return "Significant divergence requires immediate review.";
    return "Notable divergence but doesn't require immediate action.";
  };

  return (
    <div className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-colors flex flex-col gap-3.5 bg-white dark:bg-slate-900 shadow-none
        ${isMajor ? 'border-red-200/80 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800/60' : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-slate-100">{item.ticker}</h3>
            {isMajor ? (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 rounded">Major</span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 rounded">Moderate</span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300">
            {item.catalyst?.title || (item.volume_ratio > 2 ? 'Unusually high trading volume' : 'Significant price movement')}
          </p>
        </div>
        <div className={`text-base font-semibold tabular-nums tracking-tight ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
          {formatPercent(item.delta_stock)}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div>
          <span className="block text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Why</span>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{getWhy()}</p>
        </div>
        <div>
          <span className="block text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Signal</span>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{getUnusual()}</p>
        </div>
        <div>
          <span className="block text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Impact</span>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{getMatters()}</p>
        </div>
      </div>

      <div className="pt-1">
        <button 
          onClick={onClick}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
        >
          View details <span>→</span>
        </button>
      </div>
    </div>
  );
};
