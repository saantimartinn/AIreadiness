import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import CountryFlag from "@/components/common/CountryFlag";
import { mockCountries } from "@/data/mockCountries";
import type { AIDimension, CountryAIReadiness } from "@/types";
import {
  getAlphabeticalEnablers,
  getAverageScoreSortedEnablers,
  getEnablerLabel,
  getReadinessBandFromScore,
  getReadinessBandLabel,
  type DisplayReadinessBand,
} from "@/utils/displayNames";

const COLORS = ["#8fa4dd", "#f59279", "#bb7ff4", "#6be3d9"];

const DEFAULT_CODES = ["USA", "CHN", "SWE"];

type BadgeBand = DisplayReadinessBand | "Insufficient data";

const BAND_STYLES: Record<
  BadgeBand,
  {
    dot: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  Mature: {
    dot: "#b9108f",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  Developing: {
    dot: "#06b812",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Adopting: {
    dot: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  "Early adopting": {
    dot: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  "Insufficient data": {
    dot: "#64748b",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

function getInitialSelectedCountries() {
  const defaultCountries = DEFAULT_CODES.map((code) =>
    mockCountries.find((country) => country.code === code)
  ).filter(Boolean) as CountryAIReadiness[];

  if (defaultCountries.length >= 2) {
    return defaultCountries.slice(0, 4);
  }

  return mockCountries.slice(0, 3);
}

function getBestEnabler(country: CountryAIReadiness) {
  return Object.entries(country.dimensions).sort(
    ([, leftValue], [, rightValue]) => rightValue - leftValue
  )[0] as [AIDimension, number];
}

function getWeakestEnabler(country: CountryAIReadiness) {
  return Object.entries(country.dimensions).sort(
    ([, leftValue], [, rightValue]) => leftValue - rightValue
  )[0] as [AIDimension, number];
}

function ClassificationBadge({ value }: { value: number }) {
  const band = getReadinessBandFromScore(value);
  const style = BAND_STYLES[band];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${style.bg} ${style.text} ${style.border}`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {band}
    </span>
  );
}

function CountryClassBadge({ classification }: { classification: string }) {
  const band = getReadinessBandLabel(classification);
  const style = BAND_STYLES[band];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${style.bg} ${style.text} ${style.border}`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {band}
    </span>
  );
}

function CustomRadarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700">{item.name}</span>
            </div>

            <span className="text-xs font-black text-slate-500">
              {getReadinessBandFromScore(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700">{item.name}</span>
            </div>

            <span className="text-xs font-black text-slate-500">
              {getReadinessBandFromScore(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [selected, setSelected] = useState<CountryAIReadiness[]>(
    getInitialSelectedCountries
  );
  const [search, setSearch] = useState("");

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mockCountries
      .filter((country) => !selected.some((item) => item.code === country.code))
      .filter((country) => {
        if (!query) return true;

        return (
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query) ||
          country.region.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [search, selected]);

  const alphabeticalEnablers = useMemo(() => getAlphabeticalEnablers(), []);
  const scoreSortedEnablers = useMemo(
    () => getAverageScoreSortedEnablers(selected),
    [selected]
  );

  const radarData = useMemo(() => {
    return alphabeticalEnablers.map((enabler) => {
      const row: Record<string, string | number> = {
        enabler: getEnablerLabel(enabler),
      };

      selected.forEach((country) => {
        row[country.name] = country.dimensions[enabler];
      });

      return row;
    });
  }, [alphabeticalEnablers, selected]);

  const groupedBarData = useMemo(() => {
    return scoreSortedEnablers.map((enabler) => {
      const row: Record<string, string | number> = {
        enabler: getEnablerLabel(enabler),
      };

      selected.forEach((country) => {
        row[country.name] = country.dimensions[enabler];
      });

      return row;
    });
  }, [scoreSortedEnablers, selected]);

  function addCountry(country: CountryAIReadiness) {
    if (
      selected.length < 4 &&
      !selected.some((item) => item.code === country.code)
    ) {
      setSelected([...selected, country]);
      setSearch("");
    }
  }

  function removeCountry(code: string) {
    setSelected(selected.filter((country) => country.code !== code));
  }

  return (
    <div>
      <PageHeader
        title="Country Comparison"
        subtitle="Compare countries by AI maturity class and pillar profile. Internal scores and rankings are hidden."
      />

      <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Selected countries
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Choose between 2 and 4 countries to compare.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {selected.length}/4 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {selected.map((country, index) => (
            <div
              key={country.code}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <CountryFlag
                countryCode={country.code}
                countryName={country.name}
                size="sm"
              />
              <span className="text-sm font-bold text-slate-700">
                {country.name}
              </span>
              <button
                type="button"
                onClick={() => removeCountry(country.code)}
                className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                aria-label={`Remove ${country.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {selected.length < 4 && (
          <div className="relative mt-4 max-w-xl">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Add another country..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            {search && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {suggestions.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => addCountry(country)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {country.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {country.region}
                      </p>
                    </div>
                    <Plus size={15} className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {selected.length < 2 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Select at least two countries to compare.
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {selected.map((country) => {
              const bestEnabler = getBestEnabler(country);
              const weakestEnabler = getWeakestEnabler(country);

              return (
                <article
                  key={country.code}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      size="md"
                    />

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-900">
                        {country.name}
                      </h2>
                      <p className="truncate text-xs text-slate-500">
                        {country.region}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Readiness class
                    </p>
                    <div className="mt-2">
                      <CountryClassBadge
                        classification={country.classification}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Strongest pillar
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {getEnablerLabel(bestEnabler[0])}
                        </span>
                        <ClassificationBadge value={bestEnabler[1]} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Main improvement area
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {getEnablerLabel(weakestEnabler[0])}
                        </span>
                        <ClassificationBadge value={weakestEnabler[1]} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Pillar shape comparison
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visual comparison of each country&apos;s pillar profile. Pillars
                are ordered alphabetically clockwise.
              </p>
            </div>

            <div className="h-[430px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="enabler"
                    tick={{ fontSize: 12, fill: "#475569" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />

                  {selected.map((country, index) => (
                    <Radar
                      key={country.code}
                      name={country.name}
                      dataKey={country.name}
                      stroke={COLORS[index]}
                      fill={COLORS[index]}
                      fillOpacity={0.16}
                      strokeWidth={2}
                      dot
                    />
                  ))}

                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Pillar comparison
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Comparison by qualitative readiness band. Numeric scores remain
                internal. Rows are ordered from strongest to weakest average.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Pillar
                    </th>

                    {selected.map((country, index) => (
                      <th
                        key={country.code}
                        className="px-3 py-2 text-left text-xs font-black uppercase tracking-[0.16em]"
                        style={{ color: COLORS[index] }}
                      >
                        {country.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {scoreSortedEnablers.map((enabler) => (
                    <tr key={enabler}>
                      <td className="rounded-l-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800">
                        {getEnablerLabel(enabler)}
                      </td>

                      {selected.map((country, index) => {
                        const value = country.dimensions[enabler];

                        return (
                          <td
                            key={`${country.code}-${enabler}`}
                            className={`bg-slate-50 px-3 py-3 ${
                              index === selected.length - 1
                                ? "rounded-r-2xl"
                                : ""
                            }`}
                          >
                            <ClassificationBadge value={value} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Pillar-by-country column view
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pillars are ordered from strongest to weakest average. For each
                pillar, countries are shown as thin adjacent columns. Numeric
                values are hidden; hover shows the readiness band.
              </p>
            </div>

            <div className="h-[390px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupedBarData}
                  barGap={2}
                  barCategoryGap="38%"
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                  <XAxis
                    dataKey="enabler"
                    tick={{ fontSize: 12, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis domain={[0, 100]} hide />

                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />

                  {selected.map((country, index) => (
                    <Bar
                      key={country.code}
                      dataKey={country.name}
                      name={country.name}
                      fill={COLORS[index]}
                      barSize={12}
                      radius={[8, 8, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
