"use client";

import { DollarSign, ShoppingCart, Users, AlertTriangle, type LucideIcon } from "lucide-react";
import styles from "./StatsCards.module.css";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  lowStockCount: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

interface StatConfig {
  key: keyof DashboardData;
  label: string;
  icon: LucideIcon;
  color: string;
  format: (v: number) => string;
  trendKey: keyof DashboardData | null;
  isRevenue?: boolean;
  isLowStock?: boolean;
}

interface StatsCardsProps {
  data?: DashboardData;
  formattedRevenue?: string;
}

const STATS_CONFIG: StatConfig[] = [
  {
    key: "totalRevenue",
    label: "Ingresos Totales",
    icon: DollarSign,
    color: "#24abf3",
    format: (v) => String(v),
    trendKey: "revenueGrowth",
    isRevenue: true,
  },
  {
    key: "totalOrders",
    label: "Órdenes",
    icon: ShoppingCart,
    color: "#f59e0b",
    format: (v) => String(v),
    trendKey: "ordersGrowth",
  },
  {
    key: "totalUsers",
    label: "Usuarios",
    icon: Users,
    color: "#a855f7",
    format: (v) => String(v),
    trendKey: "usersGrowth",
  },
  {
    key: "lowStockCount",
    label: "Stock Crítico",
    icon: AlertTriangle,
    color: "#22c55e",
    format: (v) => String(v),
    trendKey: null,
    isLowStock: true,
  },
];

export default function StatsCards({ data, formattedRevenue }: StatsCardsProps) {
  return (
    <div className={styles.grid}>
      {STATS_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value = data?.[stat.key] ?? 0;
        const trend = stat.trendKey ? data?.[stat.trendKey] ?? null : null;
        const isLowStock = stat.isLowStock && value > 0;
        const color = isLowStock ? "#ef4444" : stat.color;
        const formattedValue = stat.isRevenue ? formattedRevenue : stat.format(value);

        const isPositiveTrend = typeof trend === "number" && trend > 0;
        const isNegativeTrend = typeof trend === "number" && trend < 0;

        const isMono = stat.key === "totalRevenue";

        return (
          <article
            key={stat.key}
            className={styles.card}
            style={{ "--accent-color": color } as React.CSSProperties}
          >
            <div className={styles.cardHeader}>
              <span className={styles.label}>{stat.label}</span>
              <Icon size={20} color={color} aria-hidden="true" />
            </div>
            <p
              className={styles.value}
              style={{ color }}
              data-mono={isMono ? "true" : undefined}
            >
              {formattedValue}
            </p>
            {typeof trend === "number" && (
              <div
                className={styles.trend}
                data-positive={isPositiveTrend || undefined}
                data-negative={isNegativeTrend || undefined}
              >
                <span>{isPositiveTrend ? "▲" : isNegativeTrend ? "▼" : "–"}</span>
                <span className={styles.trendValue}>{Math.abs(trend)}%</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
