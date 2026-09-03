import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { CountryAIReadiness } from "@/types";
import { getScoreColor } from "@/utils/scoreUtils";
import {
  getAverageScoreSortedEnablers,
  getEnablerLabel,
  getReadinessBandFromScore,
  getScoreSortedEnablers,
  getShortEnablerLabel,
} from "@/utils/displayNames";

interface BarComparisonChartProps {
  countries: CountryAIReadiness[];
  colors?: string[];
  singleCountry?: boolean;
  hideScores?: boolean;
}

const COMPARISON_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#334155"];

export default function BarComparisonChart({
  countries,
  colors = COMPARISON_COLORS,
  singleCountry = false,
  hideScores = false,
}: BarComparisonChartProps) {
  const sortedEnablers =
    singleCountry && countries.length === 1
      ? getScoreSortedEnablers(countries[0])
      : getAverageScoreSortedEnablers(countries);

  const data = sortedEnablers.map((enabler) => ({
    enabler: getShortEnablerLabel(enabler),
    fullEnabler: getEnablerLabel(enabler),
    ...Object.fromEntries(
      countries.map((country) => [country.name, country.dimensions[enabler]])
    ),
  }));

  if (singleCountry && countries.length === 1) {
    const country = countries[0];

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            bottom: 60,
            left: hideScores ? 10 : 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />

          <XAxis
            dataKey="enabler"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />

          {!hideScores && (
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
          )}

          <Tooltip
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullEnabler ?? "Pillar"
            }
            formatter={(value) =>
              hideScores
                ? [getReadinessBandFromScore(Number(value)), "Band"]
                : [value, ""]
            }
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />

          <Bar dataKey={country.name} radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.enabler}
                fill={getScoreColor(
                  (entry as Record<string, unknown>)[country.name] as number
                )}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 60, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

        <XAxis
          dataKey="enabler"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />

        {!hideScores && (
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
        )}

        <Tooltip
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.fullEnabler ?? "Pillar"
          }
          formatter={(value) =>
            hideScores
              ? [getReadinessBandFromScore(Number(value)), "Band"]
              : [value, ""]
          }
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        />

        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />

        {countries.map((country, index) => (
          <Bar
            key={country.code}
            dataKey={country.name}
            fill={colors[index % colors.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
