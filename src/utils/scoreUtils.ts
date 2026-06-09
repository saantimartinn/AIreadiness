export type ScoreLevel =
  | "mature"
  | "developing"
  | "adopting"
  | "early-adopting";

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 70) return "mature";
  if (score >= 55) return "developing";
  if (score >= 40) return "adopting";
  return "early-adopting";
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "#b9108f";
  if (score >= 55) return "#06b812";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export function getScoreBgClass(score: number): string {
  if (score >= 70) return "bg-fuchsia-100 text-fuchsia-800";
  if (score >= 55) return "bg-green-100 text-green-800";
  if (score >= 40) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 70) return "text-fuchsia-600";
  if (score >= 55) return "text-green-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
}

export function getTrendColor(change: number): string {
  if (change > 0) return "#06b812";
  if (change < 0) return "#ef4444";
  return "#94a3b8";
}

export function getMapFillColor(score: number | null): string {
  if (score === null) return "rgba(51,65,85,0.8)";
  if (score >= 70) return "#b9108f";
  if (score >= 55) return "#06b812";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}
