import type { DashboardFilters, AIDimension, Region } from "@/types";
import { AI_DIMENSIONS, REGIONS } from "@/types";
import { getEnablerLabel } from "@/utils/displayNames";

interface FilterBarProps {
  filters: DashboardFilters;
  onYearChange: (year: number) => void;
  onDimensionChange: (dimension: AIDimension | "Overall Score") => void;
  onRegionChange: (region: Region | "All Regions") => void;
  onReset: () => void;
}

const years = [2024, 2023, 2022];

export default function FilterBar({
  filters,
  onYearChange,
  onDimensionChange,
  onRegionChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.year !== 2024 ||
    filters.dimension !== "Overall Score" ||
    filters.region !== "All Regions";

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={filters.year}
          onChange={(event) => onYearChange(Number(event.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={filters.dimension}
          onChange={(event) =>
            onDimensionChange(
              event.target.value as AIDimension | "Overall Score"
            )
          }
        >
          <option value="Overall Score">Overall Classification</option>
          {AI_DIMENSIONS.map((dimension) => (
            <option key={dimension} value={dimension}>
              {getEnablerLabel(dimension)}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={filters.region}
          onChange={(event) =>
            onRegionChange(event.target.value as Region | "All Regions")
          }
        >
          <option value="All Regions">All Continents</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={onReset}
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}