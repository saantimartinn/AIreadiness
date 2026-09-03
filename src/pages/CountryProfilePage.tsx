import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { countryMap, mockCountries } from "@/data/mockCountries";
import { getPeerCountries } from "@/utils/countryUtils";
import { getScoreColor, getScoreBgClass } from "@/utils/scoreUtils";
import { formatChange, formatRank } from "@/utils/formatters";
import { formatMaybeEnabler, getEnablerLabel, getScoreSortedEnablers } from "@/utils/displayNames";
import RadarDimensionChart from "@/components/charts/RadarDimensionChart";
import LineTrendChart from "@/components/charts/LineTrendChart";
import BarComparisonChart from "@/components/charts/BarComparisonChart";

export default function CountryProfilePage() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const country = countryMap.get(countryCode ?? "");

  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500 text-lg">Country not found</p>
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => navigate("/rankings")}
        >
          Back to Rankings
        </button>
      </div>
    );
  }

  const peers = getPeerCountries(country, 3, mockCountries);
  const TrendIcon = country.yearlyChange >= 0 ? TrendingUp : TrendingDown;
  const trendColor = country.yearlyChange >= 0 ? "text-emerald-600" : "text-red-500";

  const scoreInterpretation =
    country.score >= 70
      ? "This country is a global AI leader with strong capacity across most pillars."
      : country.score >= 55
      ? "This country has a well-developed AI landscape with notable strengths in key pillars."
      : country.score >= 40
      ? "This country has a developing AI capacity with significant room for improvement."
      : "This country faces substantial challenges in AI maturity across most pillars.";

  return (
    <div>
      {/* Back button */}
      <button
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{country.name}</h1>
              <p className="text-slate-500 text-sm">{country.region} · {country.incomeGroup}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: getScoreColor(country.score) }}
              >
                {country.score.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                #{country.rank}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Global Rank</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold flex items-center gap-1 ${trendColor}`}>
                <TrendIcon size={16} />
                {formatChange(country.yearlyChange)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Annual Change</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-700">
                {country.dataCoverage}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Data Coverage</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800">
            <b>AI Readiness Assessment:</b> {scoreInterpretation}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Pillar Radar</h3>
          <p className="text-xs text-slate-500 mb-3">Performance across all 3 pillars</p>
          <div style={{ height: 280 }} className="w-full overflow-hidden">
            <RadarDimensionChart countries={[country]} />
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Historical Trend</h3>
          <p className="text-xs text-slate-500 mb-3">Overall score evolution 2018–2024</p>
          <div style={{ height: 280 }} className="w-full overflow-hidden">
            <LineTrendChart countries={[country]} />
          </div>
        </div>
      </div>

      {/* Dimension Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Pillar Breakdown</h3>
        <p className="text-xs text-slate-500 mb-3">Individual classifications by pillar</p>
        <div style={{ height: 240 }} className="w-full overflow-hidden">
          <BarComparisonChart countries={[country]} singleCountry />
        </div>
      </div>

      {/* Strengths & Weaknesses + Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* S&W */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Strengths & Weaknesses
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" /> Top Strengths
              </p>
              {country.strengths.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-700">{formatMaybeEnabler(s)}</span>
                  <span
                    className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${getScoreBgClass(country.dimensions[s as keyof typeof country.dimensions])}`}
                  >
                    {country.dimensions[s as keyof typeof country.dimensions]}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-500" /> Areas for Improvement
              </p>
              {country.weaknesses.map((w) => (
                <div
                  key={w}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-700">{formatMaybeEnabler(w)}</span>
                  <span
                    className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${getScoreBgClass(country.dimensions[w as keyof typeof country.dimensions])}`}
                  >
                    {country.dimensions[w as keyof typeof country.dimensions]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peer Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Peer Comparison
          </h3>
          <div className="space-y-3">
            {[country, ...peers].map((c, i) => (
              <div
                key={c.code}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-50 ${
                  i === 0 ? "bg-blue-50 border border-blue-100" : ""
                }`}
                onClick={() => navigate(`/country/${c.code}`)}
              >
                <span className="text-lg">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {c.name}
                    {i === 0 && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        (selected)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{formatRank(c.rank)} globally</p>
                </div>
                <span
                  className="text-base font-bold"
                  style={{ color: getScoreColor(c.score) }}
                >
                  {c.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dimension detail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Pillar Detail
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {getScoreSortedEnablers(country).map((dim) => {
            const score = country.dimensions[dim];
            return (
              <div key={dim} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{getEnablerLabel(dim)}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score),
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
