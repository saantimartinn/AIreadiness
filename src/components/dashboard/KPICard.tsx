import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
}

export default function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  trend,
}: KPICardProps) {
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? "" : trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-slate-400";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-lg bg-blue-50 ${iconColor}`}>
          <Icon size={15} />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {(subtitle || TrendIcon) && (
          <div className="flex items-center gap-1.5 mt-1">
            {TrendIcon && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon size={12} />
                {trend !== undefined && Math.abs(trend).toFixed(1)}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
