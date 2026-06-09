import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CountryAIReadiness } from "@/types";
import {
  getAlphabeticalEnablers,
  getEnablerLabel,
  getMultilineEnablerLabel,
  getReadinessBandFromScore,
} from "@/utils/displayNames";

interface RadarDimensionChartProps {
  countries: CountryAIReadiness[];
  colors?: string[];
  hideScores?: boolean;
}

type SvgTextAnchor = "start" | "middle" | "end" | "inherit";

interface PolarTickProps {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
  textAnchor?: SvgTextAnchor;
}

const COMPARISON_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#334155"];

function getLabelLines(value: string) {
  return value.split("\n");
}

function CustomPolarAngleTick({
  x = 0,
  y = 0,
  payload,
  textAnchor = "middle",
}: PolarTickProps) {
  const value = payload?.value ?? "";
  const lines = getLabelLines(value);

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill="#64748b"
      fontSize={10}
      fontWeight={600}
    >
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function RadarDimensionChart({
  countries,
  colors = COMPARISON_COLORS,
  hideScores = false,
}: RadarDimensionChartProps) {
  const data = getAlphabeticalEnablers().map((enabler) => ({
    enabler: getMultilineEnablerLabel(enabler),
    fullEnabler: getEnablerLabel(enabler),
    ...Object.fromEntries(
      countries.map((country) => [country.name, country.dimensions[enabler]])
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <RadarChart
        data={data}
        margin={{
          top: 22,
          right: 58,
          bottom: 22,
          left: 58,
        }}
      >
        <PolarGrid stroke="#e2e8f0" />

        <PolarAngleAxis dataKey="enabler" tick={<CustomPolarAngleTick />} />

        <Tooltip
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.fullEnabler ?? "Enabler"
          }
          formatter={(value) =>
            hideScores
              ? [getReadinessBandFromScore(Number(value)), "Band"]
              : [`${value}`, ""]
          }
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        />

        {countries.map((country, index) => (
          <Radar
            key={country.code}
            name={country.name}
            dataKey={country.name}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.12}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
