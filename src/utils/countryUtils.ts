import type { CountryAIReadiness, DashboardFilters } from "@/types";

export function filterCountries(
  countries: CountryAIReadiness[],
  filters: DashboardFilters
): CountryAIReadiness[] {
  return countries.filter((country) => {
    if (
      filters.region !== "All Regions" &&
      country.region !== filters.region
    ) {
      return false;
    }

    return true;
  });
}

export function sortCountriesByScore(
  countries: CountryAIReadiness[]
): CountryAIReadiness[] {
  return [...countries].sort((a, b) => b.score - a.score);
}

export function getTopCountries(
  countries: CountryAIReadiness[],
  count = 10
): CountryAIReadiness[] {
  return sortCountriesByScore(countries).slice(0, count);
}


export function getPeerCountries(
  country: CountryAIReadiness,
  count = 3,
  countries?: CountryAIReadiness[]
): CountryAIReadiness[] {
  const sourceCountries = countries ?? [];

  if (sourceCountries.length === 0) {
    return [];
  }

  return sourceCountries
    .filter(
      (candidate) =>
        candidate.code !== country.code && candidate.region === country.region
    )
    .sort((left, right) => {
      const leftDistance = Math.abs(left.score - country.score);
      const rightDistance = Math.abs(right.score - country.score);

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, count);
}

export function getCountriesByRegion(countries: CountryAIReadiness[]) {
  return countries.reduce<Record<string, CountryAIReadiness[]>>(
    (groups, country) => {
      if (!groups[country.region]) {
        groups[country.region] = [];
      }

      groups[country.region].push(country);

      return groups;
    },
    {}
  );
}

export function getKPIStats(countries: CountryAIReadiness[]) {
  if (countries.length === 0) {
    return {
      count: 0,
      avgScore: 0,
      avgChange: 0,
      avgCoverage: 0,
      topRegion: "N/A",
      fastestImproving: null,
    };
  }

  const avgScore =
    countries.reduce((sum, country) => sum + country.score, 0) /
    countries.length;

  const avgChange =
    countries.reduce((sum, country) => sum + country.yearlyChange, 0) /
    countries.length;

  const avgCoverage =
    countries.reduce((sum, country) => sum + country.dataCoverage, 0) /
    countries.length;

  const byRegion = getCountriesByRegion(countries);

  const topRegion =
    Object.entries(byRegion)
      .map(([region, items]) => ({
        region,
        avg:
          items.reduce((sum, country) => sum + country.score, 0) /
          items.length,
      }))
      .sort((a, b) => b.avg - a.avg)[0]?.region ?? "N/A";

  const fastestImproving =
    [...countries].sort((a, b) => b.yearlyChange - a.yearlyChange)[0] ?? null;

  return {
    count: countries.length,
    avgScore,
    avgChange,
    avgCoverage,
    topRegion,
    fastestImproving,
  };
}