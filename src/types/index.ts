export type Region =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Other";

export type AIPillar =
  | "Government"
  | "Infrastructure"
  | "Digital Skills";

export type AIDimension = AIPillar;
export type AIEnabler = AIPillar;

export type ReadinessClassification =
  | "Mature"
  | "Developing"
  | "Adopting"
  | "Early adopting"
  | "Insufficient data"
  // Legacy labels kept for compatibility with already generated datasets.
  | "Excellent"
  | "Good"
  | "Requires some improvement";

export const AI_DIMENSIONS: AIDimension[] = [
  "Government",
  "Infrastructure",
  "Digital Skills",
];

export const AI_PILLARS: AIPillar[] = AI_DIMENSIONS;
export const AI_ENABLERS: AIEnabler[] = AI_DIMENSIONS;

export const REGIONS: Region[] = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Other",
];

export interface PillarIndicator {
  source: string;
  indicator: string;
  year: number | null;
  value: string | number | null;
  grade: number;
}

export interface PillarProfile {
  value: number | null;
  classification: ReadinessClassification;
  coverage: number;
  availableIndicators: number;
  totalIndicators: number;
  indicators: PillarIndicator[];
}

export interface CountryAIReadiness {
  code: string;
  name: string;
  flag: string;
  region: Region;

  /**
   * Legacy optional field.
   * Do not use it in the UI anymore.
   * Kept temporarily so older data does not break while the model evolves.
   */
  incomeGroup?: string;

  rank: number;
  score: number;
  classification: ReadinessClassification;
  yearlyChange: number;
  dataCoverage: number;
  dimensions: Record<AIDimension, number>;
  pillars: Record<AIPillar, PillarProfile>;
  strengths: string[];
  weaknesses: string[];
  trend3y: number;
}

export interface TimeSeriesEntry {
  year: number;
  score: number;
  dimensions: Record<AIDimension, number>;
}

export interface CountryTimeSeries {
  countryCode: string;
  entries: TimeSeriesEntry[];
}

export interface DimensionMeta {
  key: AIDimension;
  label: string;
  description: string;
  indicators: string[];
  weight: number;
  color: string;
}

export interface DashboardFilters {
  year: number;
  dimension: AIDimension | "Overall Score";
  region: Region | "All Regions";
}
