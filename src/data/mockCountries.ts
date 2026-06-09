import { generatedCountryProfiles } from "@/data/generated/countryProfiles";
import type { CountryAIReadiness } from "@/types";

export const mockCountries: CountryAIReadiness[] = generatedCountryProfiles;

export const countryMap = new Map(
  mockCountries.map((country) => [country.code, country])
);