import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { timeSeriesMap, mockTimeSeries } from "@/data/mockTimeSeries";
import type { CountryAIReadiness } from "@/types";

interface LineTrendChartProps {
  countries: CountryAIReadiness[];
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function LineTrendChart({
  countries,
  colors = DEFAULT_COLORS,
}: LineTrendChartProps) {
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

  const data = years.map((year) => {
    const entry: Record<string, number | string> = { year };
    countries.forEach((c) => {
      const ts = timeSeriesMap.get(c.code) ?? mockTimeSeries[0];
      const yearEntry = ts.entries.find((e) => e.year === year);
      entry[c.name] = yearEntry?.score ?? c.score;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[20, 100]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        {countries.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
        )}
        {countries.map((c, i) => (
          <Line
            key={c.code}
            type="monotone"
            dataKey={c.name}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: colors[i % colors.length] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
