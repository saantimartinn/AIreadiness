import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Globe2, Search, Sparkles, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import CountryFlag from "@/components/common/CountryFlag";
import RadarDimensionChart from "@/components/charts/RadarDimensionChart";
import BarComparisonChart from "@/components/charts/BarComparisonChart";
import { mockCountries } from "@/data/mockCountries";
import {
  AI_DIMENSIONS,
  type AIPillar,
  type CountryAIReadiness,
  type PillarIndicator,
} from "@/types";
import { getEnablerLabel, getScoreSortedEnablers } from "@/utils/displayNames";

type ReadinessBand =
  | "Mature"
  | "Developing"
  | "Adopting"
  | "Early adopting";

interface BandMeta {
  label: ReadinessBand;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
}

interface IndicatorWithPillar extends PillarIndicator {
  pillar: AIPillar;
}

const BAND_META: Record<ReadinessBand, BandMeta> = {
  Mature: {
    label: "Mature",
    color: "#b9108f",
    bgClass: "bg-fuchsia-50",
    textClass: "text-fuchsia-700",
    borderClass: "border-fuchsia-200",
    description:
      "Very strong performance. This area is currently one of the country's clear advantages.",
  },
  Developing: {
    label: "Developing",
    color: "#06b812",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
    description:
      "Solid performance. This area supports the country's overall AI maturity.",
  },
  Adopting: {
    label: "Adopting",
    color: "#f59e0b",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    description:
      "Moderate performance. This area is progressing but still has room for improvement.",
  },
  "Early adopting": {
    label: "Early adopting",
    color: "#ef4444",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
    description:
      "Weak performance. This area is currently limiting the country's AI maturity.",
  },
};

function getReadinessBandFromScore(score: number): ReadinessBand {
  if (score >= 70) return "Mature";
  if (score >= 55) return "Developing";
  if (score >= 40) return "Adopting";
  return "Early adopting";
}

function getReadinessBandFromGrade(grade: number): ReadinessBand {
  if (grade >= 0.7) return "Mature";
  if (grade >= 0.55) return "Developing";
  if (grade >= 0.4) return "Adopting";
  return "Early adopting";
}

function getCountryBand(country: CountryAIReadiness) {
  return BAND_META[getReadinessBandFromScore(country.score)];
}

function getDimensionBand(value: number) {
  return BAND_META[getReadinessBandFromScore(value)];
}

function getIndicatorBand(indicator: PillarIndicator) {
  return BAND_META[getReadinessBandFromGrade(indicator.grade)];
}

function getBandWidth(label: ReadinessBand) {
  if (label === "Mature") return "100%";
  if (label === "Developing") return "75%";
  if (label === "Adopting") return "50%";
  return "25%";
}

function getAllIndicators(country: CountryAIReadiness): IndicatorWithPillar[] {
  return AI_DIMENSIONS.flatMap((pillar) =>
    country.pillars[pillar].indicators.map((indicator) => ({
      ...indicator,
      pillar,
    }))
  );
}

function getBestIndicators(country: CountryAIReadiness) {
  return getAllIndicators(country)
    .sort((left, right) => right.grade - left.grade)
    .slice(0, 6);
}

function getWeakestIndicators(country: CountryAIReadiness) {
  return getAllIndicators(country)
    .sort((left, right) => left.grade - right.grade)
    .slice(0, 6);
}

function formatCoverage(value: number) {
  return `${Math.round(value)}%`;
}

function formatPillarCoverage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function cleanExcelSource(source: string) {
  return source.replace(/\.(xlsx|xlsm|xls)$/i, "");
}

function formatExcelSource(source: string) {
  return `“${cleanExcelSource(source)}”`;
}

function formatIndicatorWithSource(indicator: IndicatorWithPillar) {
  return formatExcelSource(indicator.source);
}

function getProfileSummary(country: CountryAIReadiness) {
  const allIndicators = getAllIndicators(country);

  if (allIndicators.length === 0) {
    return `${country.name} has an AI maturity classification, but there are no indicator-level details available yet.`;
  }

  const strongest = getBestIndicators(country)
    .slice(0, 3)
    .map(formatIndicatorWithSource)
    .join(", ");

  const weakest = getWeakestIndicators(country)
    .slice(0, 3)
    .map(formatIndicatorWithSource)
    .join(", ");

  return `${country.name}'s profile is driven most positively by ${strongest}. The clearest improvement areas are ${weakest}.`;
}

function IndicatorCard({ indicator }: { indicator: IndicatorWithPillar }) {
  const band = getIndicatorBand(indicator);

  return (
    <article
      className={`rounded-2xl border p-3 ${band.bgClass} ${band.borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">
            {indicator.indicator}
          </p>
          <p className="mt-1 text-xs text-slate-500">{getEnablerLabel(indicator.pillar)}</p>
        </div>

        <span
          className={`shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-black ${band.textClass}`}
        >
          {band.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-white/70 px-2 py-1">
          Year: {indicator.year ?? "N/A"}
        </span>
        <span className="rounded-full bg-white/70 px-2 py-1">
          Source: {formatExcelSource(indicator.source)}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full"
          style={{
            width: getBandWidth(band.label),
            backgroundColor: band.color,
          }}
        />
      </div>
    </article>
  );
}

export default function MapPage() {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const countryFromUrl = searchParams.get("country")?.toUpperCase() ?? null;
  const selectedCountryCode = countryFromUrl;

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return mockCountries;

    return mockCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.region.toLowerCase().includes(query)
    );
  }, [search]);

  const selectedCountry = useMemo(() => {
    if (!selectedCountryCode) return null;

    return (
      mockCountries.find((country) => country.code === selectedCountryCode) ??
      null
    );
  }, [selectedCountryCode]);

  const selectedBand = selectedCountry ? getCountryBand(selectedCountry) : null;

  const bestIndicators = selectedCountry
    ? getBestIndicators(selectedCountry)
    : [];

  const weakestIndicators = selectedCountry
    ? getWeakestIndicators(selectedCountry)
    : [];

  const selectCountry = (countryCode: string) => {
    setSearchParams({ country: countryCode });
  };

  return (
    <div>
      <PageHeader
        title="Extended Profile"
        subtitle="Explore each country's AI maturity profile by pillar and indicator-level detail."
      />

      <div className="grid items-stretch gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="flex h-full min-h-[620px] flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 shrink-0">
            <label
              htmlFor="country-search"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400"
            >
              Search country
            </label>

            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="country-search"
                type="text"
                placeholder="Spain, India, Japan..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mb-3 flex shrink-0 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Countries
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
              {filteredCountries.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredCountries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No countries found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another country or continent.
                </p>
              </div>
            ) : (
              filteredCountries.map((country) => {
                const band = getCountryBand(country);
                const isSelected = country.code === selectedCountryCode;

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => selectCountry(country.code)}
                    className={`w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? `${band.bgClass} ${band.borderClass}`
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        size="md"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {country.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {country.region}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: band.color }}
                      />
                      <span className={`text-xs font-bold ${band.textClass}`}>
                        {band.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {!selectedCountry || !selectedBand ? (
            <div className="flex min-h-[620px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <Globe2 size={30} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  Select a country
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use the search panel to choose a country and open its extended
                  AI maturity profile.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <section
                className={`overflow-hidden rounded-3xl border ${selectedBand.borderClass} bg-white shadow-sm`}
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: selectedBand.color }}
                />

                <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <CountryFlag
                          countryCode={selectedCountry.code}
                          countryName={selectedCountry.name}
                          size="lg"
                        />

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Extended Profile
                          </p>
                          <h1 className="mt-1 text-3xl font-black text-slate-950">
                            {selectedCountry.name}
                          </h1>
                          <p className="mt-1 text-sm text-slate-500">
                            {selectedCountry.region}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div
                          className={`rounded-2xl border px-4 py-3 ${selectedBand.bgClass} ${selectedBand.borderClass}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            Readiness class
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: selectedBand.color }}
                            />
                            <p
                              className={`text-lg font-black ${selectedBand.textClass}`}
                            >
                              {selectedBand.label}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            Data coverage
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {formatCoverage(selectedCountry.dataCoverage)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-5 rounded-2xl border p-4 ${selectedBand.bgClass} ${selectedBand.borderClass}`}
                    >
                      <p
                        className={`text-sm leading-6 ${selectedBand.textClass}`}
                      >
                        {getProfileSummary(selectedCountry)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3">
                      <h2 className="text-sm font-black text-slate-900">
                        Three-pillar profile
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Radar view of the country&apos;s relative pillar
                        profile. Internal scores are hidden.
                      </p>
                    </div>

                    <div className="h-[260px] min-w-0">
                      <RadarDimensionChart
                        countries={[selectedCountry]}
                        hideScores
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Pillar profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Coverage-adjusted performance by pillar. Internal
                      normalized scores are intentionally hidden.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.values(BAND_META).map((band) => (
                      <div
                        key={band.label}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: band.color }}
                        />
                        <span className="text-slate-500">{band.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[320px] min-w-0">
                  <BarComparisonChart
                    countries={[selectedCountry]}
                    singleCountry
                    hideScores
                  />
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-500" />
                    <h2 className="text-sm font-black text-slate-900">
                      Main strengths
                    </h2>
                  </div>

                  {bestIndicators.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
                      No indicator details available.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bestIndicators.map((indicator) => (
                        <IndicatorCard
                          key={`${getEnablerLabel(indicator.pillar)}-${indicator.indicator}-${indicator.source}`}
                          indicator={indicator}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h2 className="text-sm font-black text-slate-900">
                      Improvement areas
                    </h2>
                  </div>

                  {weakestIndicators.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
                      No indicator details available.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weakestIndicators.map((indicator) => (
                        <IndicatorCard
                          key={`${getEnablerLabel(indicator.pillar)}-${indicator.indicator}-${indicator.source}`}
                          indicator={indicator}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-black text-slate-900">
                    Development by pillar
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Indicator-level breakdown showing what is working well and
                    what needs improvement inside each pillar.
                  </p>
                </div>

                <div className="space-y-4">
                  {getScoreSortedEnablers(selectedCountry).map((pillar) => {
                    const pillarData = selectedCountry.pillars[pillar];
                    const value = selectedCountry.dimensions[pillar];
                    const band = getDimensionBand(value);

                    return (
                      <section
                        key={getEnablerLabel(pillar)}
                        className={`rounded-3xl border p-4 ${band.bgClass} ${band.borderClass}`}
                      >
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-slate-900">
                              {getEnablerLabel(pillar)}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Data coverage:{" "}
                              {formatPillarCoverage(pillarData.coverage)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full bg-white/80 px-3 py-1 text-xs font-black ${band.textClass}`}
                          >
                            {band.label}
                          </span>
                        </div>

                        {pillarData.indicators.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-5 text-center text-sm text-slate-400">
                            No indicator data available for this pillar.
                          </div>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {pillarData.indicators
                              .sort((left, right) => right.grade - left.grade)
                              .map((indicator) => (
                                <IndicatorCard
                                  key={`${getEnablerLabel(pillar)}-${indicator.indicator}-${indicator.source}`}
                                  indicator={{
                                    ...indicator,
                                    pillar,
                                  }}
                                />
                              ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
