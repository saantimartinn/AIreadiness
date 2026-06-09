export function formatScore(score: number, decimals = 1): string {
  return score.toFixed(decimals);
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function formatRank(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}
