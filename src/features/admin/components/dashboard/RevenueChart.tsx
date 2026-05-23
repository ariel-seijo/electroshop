"use client";

import { formatArs } from "@/lib/utils/currency";
import styles from "./RevenueChart.module.css";

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  totalRevenue?: number;
  exchangeRate?: number;
}

export default function RevenueChart({ data, totalRevenue, exchangeRate = 1400 }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3 className={styles.title}>Tendencia de Ventas</h3>
          <span className={styles.subtitle}>Últimos 7 días</span>
        </div>
        <div className={styles.empty}>
          <span>No hay datos de ventas en los últimos 7 días</span>
        </div>
      </div>
    );
  }

  const width = 700;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.revenue);
  const maxRevenue = Math.max(...values);
  const computedMax = maxRevenue > 0 ? maxRevenue : 1000;

  function xPos(i: number) {
    return padding.left + (i / (data!.length - 1)) * chartWidth;
  }

  function yPos(value: number) {
    return padding.top + chartHeight - (value / computedMax) * chartHeight;
  }

  const dataPoints = data.map((d, i) => ({
    x: xPos(i),
    y: yPos(d.revenue),
    value: d.revenue,
    date: d.date,
  }));

  const firstX = padding.left;
  const lastX = padding.left + chartWidth;
  const baselineY = padding.top + chartHeight;

  const areaPathD = [
    `M ${firstX},${baselineY}`,
    ...dataPoints.map((p) => `L ${p.x},${p.y}`),
    `L ${lastX},${baselineY}`,
    "Z",
  ].join(" ");

  const linePathD = [
    `M ${dataPoints[0].x},${dataPoints[0].y}`,
    ...dataPoints.slice(1).map((p) => `L ${p.x},${p.y}`),
  ].join(" ");

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((computedMax / yTicks) * i)
  );

  const xLabels = data.map((d) => {
    const [, month, day] = d.date.split("-");
    return `${day}/${month}`;
  });

  const isEmpty = maxRevenue === 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tendencia de Ventas</h3>
        <span className={styles.subtitle}>Últimos 7 días</span>
      </div>

      {isEmpty && (
        <div className={styles.emptyBanner}>
          <span>Sin ventas en este período</span>
        </div>
      )}

      <div className={styles.chartContainer}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          className={styles.chart}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24abf3" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#24abf3" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#24abf3" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#24abf3" floodOpacity="0.5" />
            </filter>
          </defs>

          {yTickValues.map((tick, i) => {
            const y = yPos(tick);
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className={styles.axisLabel}
                >
                  {formatArs(tick * exchangeRate)}
                </text>
              </g>
            );
          })}

          {xLabels.map((label, i) => {
            if (i % 2 !== 0 && i !== xLabels.length - 1) return null;
            const x = xPos(i);
            return (
              <text
                key={`x-${i}`}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {label}
              </text>
            );
          })}

          {computedMax > 0 && (
            <>
              <path
                d={areaPathD}
                fill="url(#areaGradient)"
                className={styles.area}
              />

              <path
                d={linePathD}
                fill="none"
                stroke="#24abf3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                className={styles.line}
              />
            </>
          )}

          {dataPoints.map((p, i) => {
            const formattedRevenue = formatArs(p.value * exchangeRate);
            const dateLabel = xLabels[i];
            return (
              <g key={`point-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={maxRevenue === 0 ? 4 : 5}
                  fill="#0a0a0a"
                  stroke="#24abf3"
                  strokeWidth="2"
                  className={styles.point}
                >
                  <title>{`${dateLabel}: ${formattedRevenue}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>Total período</span>
        <span className={styles.footerValue}>{formatArs((totalRevenue || 0) * exchangeRate)}</span>
      </div>
    </div>
  );
}
