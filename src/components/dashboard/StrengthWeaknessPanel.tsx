import { TrendingUp, AlertTriangle } from "lucide-react";
import type { CountryAIReadiness } from "@/types";
import { formatMaybeEnabler } from "@/utils/displayNames";

interface StrengthWeaknessPanelProps {
  country: CountryAIReadiness;
}

export default function StrengthWeaknessPanel({ country }: StrengthWeaknessPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 h-full">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          {country.flag} {country.name}
        </h3>
        <p className="text-xs text-slate-500">Strengths & Weaknesses</p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={13} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Strengths
          </span>
        </div>
        <div className="space-y-1.5">
          {country.strengths.map((strength) => (
            <div key={strength} className="flex items-center justify-between">
              <span className="text-xs text-slate-700">
                {formatMaybeEnabler(strength)}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {country.dimensions[strength as keyof typeof country.dimensions]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Weaknesses
          </span>
        </div>
        <div className="space-y-1.5">
          {country.weaknesses.map((weakness) => (
            <div key={weakness} className="flex items-center justify-between">
              <span className="text-xs text-slate-700">
                {formatMaybeEnabler(weakness)}
              </span>
              <span className="text-xs font-bold text-amber-600">
                {country.dimensions[weakness as keyof typeof country.dimensions]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
