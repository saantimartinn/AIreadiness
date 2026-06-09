import { useNavigate } from "react-router-dom";
import type { CountryAIReadiness } from "@/types";
import { getScoreBgClass } from "@/utils/scoreUtils";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";

interface CountryRankingTableProps {
  countries: CountryAIReadiness[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUp size={11} className="text-slate-300" />;
  return dir === "asc" ? (
    <ArrowUp size={11} className="text-blue-600" />
  ) : (
    <ArrowDown size={11} className="text-blue-600" />
  );
}

const COLUMNS = [
  { key: "rank", label: "Rank", sortable: true, width: "w-14" },
  { key: "name", label: "Country", sortable: true, width: "w-auto" },
  { key: "region", label: "Region", sortable: true, width: "w-32" },
  { key: "score", label: "Score", sortable: true, width: "w-20" },
  { key: "yearlyChange", label: "Change", sortable: true, width: "w-20" },
  { key: "dataCoverage", label: "Coverage", sortable: true, width: "w-24" },
];

export default function CountryRankingTable({
  countries,
  sortKey,
  sortDir,
  onSort,
}: CountryRankingTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.width} ${
                  col.sortable ? "cursor-pointer hover:text-slate-700 select-none" : ""
                }`}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {countries.map((country, idx) => {
            const TrendIcon =
              country.yearlyChange > 0
                ? TrendingUp
                : country.yearlyChange < 0
                ? TrendingDown
                : Minus;
            const trendColor =
              country.yearlyChange > 0
                ? "text-emerald-600"
                : country.yearlyChange < 0
                ? "text-red-500"
                : "text-slate-400";

            return (
              <tr
                key={country.code}
                className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/country/${country.code}`)}
              >
                <td className="py-3 px-4">
                  <span
                    className={`font-bold ${
                      idx < 3 ? "text-amber-500" : "text-slate-400"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{country.flag}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{country.name}</p>
                      <p className="text-xs text-slate-400">{country.incomeGroup}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {country.region}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-bold text-base ${getScoreBgClass(country.score)} px-2 py-0.5 rounded-lg`}
                  >
                    {country.score.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                    <TrendIcon size={12} />
                    {country.yearlyChange > 0 ? "+" : ""}
                    {country.yearlyChange.toFixed(1)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${country.dataCoverage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {country.dataCoverage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
