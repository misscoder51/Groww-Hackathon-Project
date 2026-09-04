import { MarketStory } from "@/types";
import { Zap } from "lucide-react";

export const MarketStories = ({ stories }: { stories: MarketStory[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stories.map((story, i) => (
        <div key={i} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold tracking-wider text-emerald-500 uppercase">{story.title}</h3>
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">{story.description}</p>
          <div className="flex flex-wrap gap-2">
            {story.affected.map(ticker => (
              <span key={ticker} className="px-2 py-1 bg-black border border-neutral-700 rounded text-xs text-neutral-400 font-medium">
                {ticker}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
