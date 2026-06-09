import type { CountryTimeSeries } from "@/types";
import { mockCountries } from "@/data/mockCountries";

const years = [2020, 2021, 2022, 2023, 2024];

export const mockTimeSeries: CountryTimeSeries[] = mockCountries.map(
  (country) => ({
    countryCode: country.code,
    entries: years.map((year) => ({
      year,
      score: country.score,
      dimensions: country.dimensions,
    })),
  })
);

export const timeSeriesMap = new Map(
  mockTimeSeries.map((timeSeries) => [timeSeries.countryCode, timeSeries])
);