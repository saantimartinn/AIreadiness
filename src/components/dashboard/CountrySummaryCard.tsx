import { useNavigate } from "react-router-dom";
import type { AIDimension, CountryAIReadiness } from "@/types";
import { getScoreColor, getScoreBgClass } from "@/utils/scoreUtils";
import { formatRank, formatChange } from "@/utils/formatters";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { getEnablerLabel, getScoreSortedEnablers } from "@/utils/displayNames";

interface CountrySummaryCardProps {
  country: CountryAIReadiness;
}

export default function CountrySummaryCard({ country }: CountrySummaryCardProps) {
  const navigate = useNavigate();
  const TrendIcon = country.yearlyChange >= 0 ? TrendingUp : TrendingDown;
  const trendColor = country.yearlyChange >= 0 ? "text-emerald-600" : "text-red-500";
  const sortedEnablers = getScoreSortedEnablers(country);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Selected Country
        </span>
        <button
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          onClick={() => navigate(`/country/${country.code}`)}
        >
          Full Profile <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{country.flag}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-900 truncate">{country.name}</h2>
          <p className="text-xs text-slate-500">{country.region}</p>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold"
            style={{ color: getScoreColor(country.score) }}
          >
            {country.score.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getScoreBgClass(country.score)}`}>
          Rank #{country.rank} · {formatRank(country.rank)}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          {formatChange(country.yearlyChange)} pts/yr
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          Coverage: {country.dataCoverage}%
        </span>
      </div>

      <div className="space-y-1.5">
        {sortedEnablers.map((enabler: AIDimension) => {
          const score = country.dimensions[enabler];

          return (
            <div key={enabler} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-36 truncate">
                {getEnablerLabel(enabler)}
              </span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score),
                  }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-8 text-right">
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
