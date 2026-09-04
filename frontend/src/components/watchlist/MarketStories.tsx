import { MarketStory } from "@/types";
import { BarChart2, Globe, TrendingDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const MarketStories = ({ stories }: { stories: MarketStory[] }) => {
  return (
    <div className="flex flex-col gap-6">
      {stories.map(story => (
        <MarketStoryCard key={story.title} story={story} />
      ))}
    </div>
  );
};

const MarketStoryCard = ({ story }: { story: MarketStory }) => {
  const [expanded, setExpanded] = useState(false);
  const isSector = story.type === 'SECTOR';
  
  const getContextType = () => {
    if (isSector) return 'SECTOR-WIDE';
    if (story.type === 'MACRO') return 'MARKET-WIDE';
    return 'STOCK-SPECIFIC';
  };
  
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md dark:hover:shadow-slate-900/50">
      <div className="flex items-center gap-2">
        {isSector ? <BarChart2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        <h3 className="font-bold text-xs tracking-wider text-gray-500 dark:text-slate-500">{getContextType()}</h3>
      </div>
      
      <div>
        <p className="text-gray-900 dark:text-slate-100 font-bold text-lg mb-1.5">{story.title}</p>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{story.description}</p>
      </div>
      
      <div className="pt-2">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
        >
          {expanded ? "Hide affected stocks ↑" : `${story.affected.length} ${story.affected.length === 1 ? 'stock' : 'stocks'} in your watchlist ${story.affected.length === 1 ? 'is' : 'are'} affected ↓`}
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 pb-1">
                {story.affected.map(ticker => (
                  <div key={ticker} className="px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm flex items-center justify-between border border-gray-200 dark:border-slate-700 shadow-sm">
                    <span className="font-semibold text-gray-900 dark:text-slate-200">{ticker}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
