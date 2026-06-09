import { AI_DIMENSIONS, type AIDimension, type CountryAIReadiness } from "@/types";

export type DisplayReadinessBand =
  | "Mature"
  | "Developing"
  | "Adopting"
  | "Early adopting";

export const DISPLAY_READINESS_BANDS: DisplayReadinessBand[] = [
  "Mature",
  "Developing",
  "Adopting",
  "Early adopting",
];

export const ENABLER_LABELS: Record<AIDimension, string> = {
  Government: "Policy and governance",
  Infrastructure: "Infrastructure",
  Society: "Digital inclusion",
  Market: "Ecosystem",
  "Skills & Capacity Building": "Human capital development",
};

export const SHORT_ENABLER_LABELS: Record<AIDimension, string> = {
  Government: "Policy/gov.",
  Infrastructure: "Infrastructure",
  Society: "Digital inclusion",
  Market: "Ecosystem",
  "Skills & Capacity Building": "Human capital",
};

const LEGACY_CLASSIFICATION_LABELS: Record<string, DisplayReadinessBand> = {
  Excellent: "Mature",
  Good: "Developing",
  Developing: "Developing",
  "Requires some improvement": "Early adopting",
  Mature: "Mature",
  Adopting: "Adopting",
  "Early adopting": "Early adopting",
};

export function getEnablerLabel(enabler: AIDimension | string): string {
  return ENABLER_LABELS[enabler as AIDimension] ?? enabler;
}

export function getShortEnablerLabel(enabler: AIDimension | string): string {
  return SHORT_ENABLER_LABELS[enabler as AIDimension] ?? getEnablerLabel(enabler);
}

export function getMultilineEnablerLabel(enabler: AIDimension | string): string {
  return getEnablerLabel(enabler)
    .replace("Policy and governance", "Policy and\ngovernance")
    .replace("Digital inclusion", "Digital\ninclusion")
    .replace("Human capital development", "Human capital\ndevelopment");
}

export function getAlphabeticalEnablers(): AIDimension[] {
  return [...AI_DIMENSIONS].sort((left, right) =>
    getEnablerLabel(left).localeCompare(getEnablerLabel(right))
  );
}

export function getScoreSortedEnablers(country: CountryAIReadiness): AIDimension[] {
  return [...AI_DIMENSIONS].sort((left, right) => {
    const scoreDifference =
      (country.dimensions[right] ?? 0) - (country.dimensions[left] ?? 0);

    if (scoreDifference !== 0) return scoreDifference;

    return getEnablerLabel(left).localeCompare(getEnablerLabel(right));
  });
}

export function getAverageScoreSortedEnablers(
  countries: CountryAIReadiness[]
): AIDimension[] {
  return [...AI_DIMENSIONS].sort((left, right) => {
    const rightAverage = getAverageEnablerScore(countries, right);
    const leftAverage = getAverageEnablerScore(countries, left);
    const scoreDifference = rightAverage - leftAverage;

    if (scoreDifference !== 0) return scoreDifference;

    return getEnablerLabel(left).localeCompare(getEnablerLabel(right));
  });
}

export function getReadinessBandFromScore(score: number): DisplayReadinessBand {
  if (score >= 70) return "Mature";
  if (score >= 55) return "Developing";
  if (score >= 40) return "Adopting";
  return "Early adopting";
}

export function getReadinessBandFromGrade(grade: number): DisplayReadinessBand {
  if (grade >= 0.7) return "Mature";
  if (grade >= 0.55) return "Developing";
  if (grade >= 0.4) return "Adopting";
  return "Early adopting";
}

export function getReadinessBandLabel(
  classification: string | null | undefined
): DisplayReadinessBand | "Insufficient data" {
  if (!classification || classification === "Insufficient data") {
    return "Insufficient data";
  }

  return LEGACY_CLASSIFICATION_LABELS[classification] ?? "Early adopting";
}

export function getReadinessBandWidth(
  label: DisplayReadinessBand | "Insufficient data"
): string {
  if (label === "Mature") return "100%";
  if (label === "Developing") return "75%";
  if (label === "Adopting") return "50%";
  if (label === "Early adopting") return "25%";
  return "0%";
}

export function formatMaybeEnabler(value: string): string {
  return getEnablerLabel(value);
}

function getAverageEnablerScore(
  countries: CountryAIReadiness[],
  enabler: AIDimension
): number {
  if (countries.length === 0) return 0;

  return (
    countries.reduce((sum, country) => sum + (country.dimensions[enabler] ?? 0), 0) /
    countries.length
  );
}
