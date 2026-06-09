import { Globe, BarChart2, TrendingUp, Database, MapPin, Zap } from "lucide-react";
import KPICard from "./KPICard";
import type { CountryAIReadiness } from "@/types";

interface KPISectionProps {
  count: number;
  avgScore: number;
  avgChange: number;
  avgCoverage: number;
  topRegion: string;
  fastestImproving: CountryAIReadiness;
}

export default function KPISection({
  count,
  avgScore,
  avgChange,
  avgCoverage,
  topRegion,
  fastestImproving,
}: KPISectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
      <KPICard
        label="Countries Analyzed"
        value={count}
        subtitle="in dataset"
        icon={Globe}
        iconColor="text-blue-600"
      />
      <KPICard
        label="Global Avg Score"
        value={avgScore.toFixed(1)}
        subtitle="out of 100"
        icon={BarChart2}
        iconColor="text-indigo-600"
      />
      <KPICard
        label="Avg Annual Improvement"
        value={`+${avgChange.toFixed(1)}`}
        subtitle="pts/year"
        icon={TrendingUp}
        trend={avgChange}
        iconColor="text-emerald-600"
      />
      <KPICard
        label="Data Coverage"
        value={`${avgCoverage}%`}
        subtitle="avg coverage"
        icon={Database}
        iconColor="text-purple-600"
      />
      <KPICard
        label="Top Region"
        value={topRegion}
        subtitle="highest avg score"
        icon={MapPin}
        iconColor="text-orange-500"
      />
      <KPICard
        label="Fastest Improving"
        value={`${fastestImproving.flag} ${fastestImproving.name}`}
        subtitle={`+${fastestImproving.yearlyChange.toFixed(1)} pts`}
        icon={Zap}
        trend={fastestImproving.yearlyChange}
        iconColor="text-yellow-500"
      />
    </div>
  );
}
