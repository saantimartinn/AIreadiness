import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
import { mockCountries } from "@/data/mockCountries";
import type { CountryAIReadiness, Region } from "@/types";
import { REGIONS } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import CountryFlag from "@/components/common/CountryFlag";
import {
  formatMaybeEnabler,
  getReadinessBandFromScore,
  type DisplayReadinessBand,
} from "@/utils/displayNames";

type ReadinessBand = DisplayReadinessBand;

interface BandMeta {
  key: ReadinessBand;
  description: string;
  color: string;
  softColor: string;
  borderColor: string;
}

const BANDS: BandMeta[] = [
  {
    key: "Mature",
    description:
      "Countries with the strongest coverage-adjusted AI maturity profile.",
    color: "#b9108f",
    softColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
  },
  {
    key: "Developing",
    description: "Countries with solid AI maturity and clear strengths.",
    color: "#06b812",
    softColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "Adopting",
    description:
      "Countries building relevant AI capabilities but still uneven.",
    color: "#f59e0b",
    softColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    key: "Early adopting",
    description:
      "Countries with relevant gaps across several AI maturity areas or limited coverage-adjusted performance.",
    color: "#ef4444",
    softColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

function getGroupedCountries(countries: CountryAIReadiness[]) {
  return BANDS.reduce<Record<ReadinessBand, CountryAIReadiness[]>>(
    (groups, band) => {
      groups[band.key] = countries.filter(
        (country) => getReadinessBandFromScore(country.score) === band.key
      );

      return groups;
    },
    {
      Mature: [],
      Developing: [],
      Adopting: [],
      "Early adopting": [],
    }
  );
}

export default function RankingsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<Region | "All Regions">("All Regions");

  const filteredCountries = useMemo(() => {
    let list = [...mockCountries];

    if (search.trim()) {
      const query = search.toLowerCase();

      list = list.filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query) ||
          country.region.toLowerCase().includes(query)
      );
    }

    if (region !== "All Regions") {
      list = list.filter((country) => country.region === region);
    }

    return list;
  }, [search, region]);

  const groupedCountries = useMemo(
    () => getGroupedCountries(filteredCountries),
    [filteredCountries]
  );

  const hasFilters = search !== "" || region !== "All Regions";

  const clearFilters = () => {
    setSearch("");
    setRegion("All Regions");
  };

  const openExtendedProfile = (countryCode: string) => {
    navigate(`/map?country=${countryCode}`);
  };

  return (
    <div>
      <PageHeader
        title="Country Classification"
        subtitle="Countries are grouped into AI maturity bands using the final coverage-adjusted classification."
      />

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            {search && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={region}
            onChange={(event) =>
              setRegion(event.target.value as Region | "All Regions")
            }
          >
            <option value="All Regions">All Continents</option>
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={clearFilters}
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {filteredCountries.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900">
            {mockCountries.length}
          </span>{" "}
          UN member states
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {BANDS.map((band) => (
            <div
              key={band.key}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              <span>{band.key}</span>
            </div>
          ))}
        </div>
      </div>

      {filteredCountries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          <p className="text-lg">No countries found</p>
          <p className="mt-1 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {BANDS.map((band) => {
            const countries = groupedCountries[band.key];

            return (
              <section
                key={band.key}
                className={`flex min-h-[520px] flex-col rounded-3xl border ${band.borderColor} ${band.softColor} p-4 shadow-sm`}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: band.color }}
                        />
                        <h2 className="text-lg font-black text-slate-950">
                          {band.key}
                        </h2>
                      </div>

                      <p className="text-sm leading-5 text-slate-600">
                        {band.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                      {countries.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {countries.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-4 text-center text-sm text-slate-400">
                      No countries in this group
                    </div>
                  ) : (
                    countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => openExtendedProfile(country.code)}
                        className="rounded-2xl border border-white/80 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                        aria-label={`Open extended profile for ${country.name}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-slate-100">
                            <CountryFlag
                              countryCode={country.code}
                              countryName={country.name}
                              size="md"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {country.name}
                            </h3>
                            <p className="truncate text-xs text-slate-500">
                              {country.region}
                            </p>
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="shrink-0 text-slate-300"
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {country.strengths.slice(0, 2).map((strength) => (
                            <span
                              key={strength}
                              className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                            >
                              {formatMaybeEnabler(strength)}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
