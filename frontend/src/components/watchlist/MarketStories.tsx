import { MarketStory } from "@/types";
import { BarChart2 } from "lucide-react";

export const MarketStories = ({ stories }: { stories: MarketStory[] }) => {
  return (
    <div className="space-y-4">
      {stories.map((story, i) => (
        <div key={i} className="border border-neutral-800 rounded-xl p-5 bg-neutral-950 flex flex-col sm:flex-row gap-6">
          <div className="sm:w-1/3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm tracking-widest uppercase text-neutral-300">{story.title}</h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">{story.description}</p>
          </div>
          <div className="sm:w-2/3 grid grid-cols-2 gap-2 sm:border-l sm:border-neutral-800 sm:pl-6">
            {story.affected.map(ticker => (
              <div key={ticker} className="px-3 py-2 bg-neutral-900 rounded-lg text-sm flex items-center justify-between border border-neutral-800/50">
                <span className="font-medium">{ticker}</span>
                <span className="text-neutral-500 text-xs">Included</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
