import { useNavigate } from "react-router-dom";
import type { CountryAIReadiness } from "@/types";
import { getScoreColor, getTrendColor } from "@/utils/scoreUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankingPanelProps {
  countries: CountryAIReadiness[];
  selected: CountryAIReadiness;
  onSelect: (c: CountryAIReadiness) => void;
  maxItems?: number;
}

export default function RankingPanel({
  countries,
  selected,
  onSelect,
  maxItems = 15,
}: RankingPanelProps) {
  const navigate = useNavigate();
  const displayed = countries.slice(0, maxItems);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Top Rankings</h3>
        <p className="text-xs text-slate-500">Click a country to view details</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayed.map((country, idx) => {
          const isSelected = country.code === selected.code;
          const TrendIcon =
            country.yearlyChange > 0
              ? TrendingUp
              : country.yearlyChange < 0
              ? TrendingDown
              : Minus;
          const trendColor = getTrendColor(country.yearlyChange);

          return (
            <div
              key={country.code}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                isSelected ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
              onClick={() => onSelect(country)}
              onDoubleClick={() => navigate(`/country/${country.code}`)}
            >
              <span
                className={`text-xs font-bold w-6 text-center ${
                  idx < 3 ? "text-amber-500" : "text-slate-400"
                }`}
              >
                {idx + 1}
              </span>
              <span className="text-base">{country.flag}</span>
              <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                {country.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-sm font-bold"
                  style={{ color: getScoreColor(country.score) }}
                >
                  {country.score.toFixed(1)}
                </span>
                <TrendIcon
                  size={11}
                  style={{ color: trendColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
