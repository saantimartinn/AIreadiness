import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import type { CountryAIReadiness } from "@/types";
import { getScoreColor } from "@/utils/scoreUtils";

interface ScatterQuadrantChartProps {
  countries: CountryAIReadiness[];
  selected?: CountryAIReadiness;
  onSelect?: (c: CountryAIReadiness) => void;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: CountryAIReadiness;
  selected?: CountryAIReadiness;
}

function CustomDot({ cx = 0, cy = 0, payload, selected }: CustomDotProps) {
  if (!payload) return null;
  const isSelected = selected?.code === payload.code;
  const color = getScoreColor(payload.score);
  const r = isSelected ? 8 : 5;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={isSelected ? 0.9 : 0.6}
        stroke={isSelected ? "#1e40af" : color}
        strokeWidth={isSelected ? 2 : 1}
        style={{ cursor: "pointer" }}
      />
      {isSelected && (
        <text
          x={cx + 10}
          y={cy + 4}
          fontSize={10}
          fill="#1e40af"
          fontWeight="bold"
        >
          {payload.flag} {payload.name}
        </text>
      )}
    </g>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CountryAIReadiness }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-md text-xs">
      <p className="font-bold text-slate-800">
        {d.flag} {d.name}
      </p>
      <p className="text-slate-500">Score: <b>{d.score}</b></p>
      <p className="text-slate-500">3y trend: <b>+{d.trend3y}</b></p>
    </div>
  );
};

export default function ScatterQuadrantChart({
  countries,
  selected,
  onSelect,
}: ScatterQuadrantChartProps) {
  const avgScore = countries.reduce((s, c) => s + c.score, 0) / countries.length;
  const avgTrend = countries.reduce((s, c) => s + c.trend3y, 0) / countries.length;

  const data = countries.map((c) => ({
    ...c,
    x: c.trend3y,
    y: c.score,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number"
          dataKey="x"
          domain={[0, 14]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          name="3-Year Trend"
        >
          <Label
            value="3-Year Trend (%)"
            position="insideBottom"
            offset={-12}
            style={{ fontSize: 10, fill: "#94a3b8" }}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="y"
          domain={[20, 100]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={30}
          name="Score"
        >
          <Label
            value="Overall Score"
            angle={-90}
            position="insideLeft"
            offset={8}
            style={{ fontSize: 10, fill: "#94a3b8" }}
          />
        </YAxis>
        <ReferenceLine
          x={avgTrend}
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          label={{ value: "Avg trend", position: "top", fontSize: 9, fill: "#94a3b8" }}
        />
        <ReferenceLine
          y={avgScore}
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          label={{ value: "Avg score", position: "right", fontSize: 9, fill: "#94a3b8" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          data={data}
          shape={(props: CustomDotProps) => (
            <CustomDot {...props} selected={selected} />
          )}
          onClick={(d) => onSelect?.(d as unknown as CountryAIReadiness)}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
