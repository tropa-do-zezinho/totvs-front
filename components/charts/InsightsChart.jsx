"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const AXIS_STYLE = { fontFamily: "var(--font-mono)", fontSize: 11, fill: "#a0a0a0" };

const TOOLTIP_STYLE = {
  background: "#333333",
  border: "1px solid #4d4d4d",
  borderRadius: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "#f2f2f2",
};

/**
 * Gráfico genérico para o insights.json (contrato ainda em aberto com o
 * time do worker). Aceita `data` como [{ label, value }].
 */
export default function InsightsChart({ title, data, type = "line", accent = "#00dbff" }) {
  const ChartComponent = type === "bar" ? BarChart : LineChart;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {title && (
        <p className="mb-4 font-mono text-xs uppercase tracking-wider text-foreground-dim">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <ChartComponent data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#4d4d4d" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={{ stroke: "#4d4d4d" }} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={{ stroke: "#4d4d4d" }} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#4d4d4d" }} />
          {type === "bar" ? (
            <Bar dataKey="value" fill={accent} radius={[2, 2, 0, 0]} />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={accent}
              strokeWidth={2}
              dot={{ fill: accent, r: 3 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
