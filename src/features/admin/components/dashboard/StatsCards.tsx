"use client";

import { DollarSign, ShoppingCart, Users, AlertTriangle, type LucideIcon } from "lucide-react";

interface DashboardData {
  totalRevenue: number; totalOrders: number; totalUsers: number; lowStockCount: number;
  revenueGrowth: number; ordersGrowth: number; usersGrowth: number;
}

interface StatConfig {
  key: keyof DashboardData; label: string; icon: LucideIcon; color: string;
  format: (v: number) => string; trendKey: keyof DashboardData | null; isRevenue?: boolean; isLowStock?: boolean;
}

interface StatsCardsProps { data?: DashboardData; formattedRevenue?: string; }

const STATS_CONFIG: StatConfig[] = [
  { key: "totalRevenue", label: "Ingresos Totales", icon: DollarSign, color: "#24abf3", format: (v) => String(v), trendKey: "revenueGrowth", isRevenue: true },
  { key: "totalOrders", label: "Órdenes", icon: ShoppingCart, color: "#f59e0b", format: (v) => String(v), trendKey: "ordersGrowth" },
  { key: "totalUsers", label: "Usuarios", icon: Users, color: "#a855f7", format: (v) => String(v), trendKey: "usersGrowth" },
  { key: "lowStockCount", label: "Stock Crítico", icon: AlertTriangle, color: "#22c55e", format: (v) => String(v), trendKey: null, isLowStock: true },
];

export default function StatsCards({ data, formattedRevenue }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 max-md:grid-cols-2 max-md:grid-cols-1">
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
            className="relative overflow-hidden bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] px-[22px] py-5 shadow-[var(--admin-shadow)] transition-[transform,box-shadow] duration-[var(--admin-transition)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,0,0,0.4),0_8px_32px_rgba(0,0,0,0.55)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[var(--accent-color,var(--admin-primary-glow))] before:shadow-[0_0_12px_var(--accent-color,var(--admin-primary-glow))] after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-px after:bg-[linear-gradient(90deg,transparent_0%,var(--accent-color,var(--admin-primary-glow))_30%,var(--accent-color,var(--admin-primary-glow))_70%,transparent_100%)] after:opacity-30 max-md:px-[18px] max-md:py-4"
            style={{ "--accent-color": color } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.7rem] font-semibold text-[var(--admin-muted)] uppercase tracking-[0.8px]">{stat.label}</span>
              <Icon size={20} color={color} aria-hidden="true" />
            </div>
            <p className="text-[1.65rem] font-semibold m-0 leading-[1.1] tracking-[-0.5px] max-md:text-[1.4rem]" style={{ color }} data-mono={isMono ? "true" : undefined}>
              {formattedValue}
            </p>
            {typeof trend === "number" && (
              <div className="inline-flex items-center gap-1 mt-2 px-2 py-[3px] rounded text-xs font-semibold bg-[var(--admin-hover-bg)] [&>span:last-child]:font-mono [&>span:last-child]:text-[0.72rem]" data-positive={isPositiveTrend || undefined} data-negative={isNegativeTrend || undefined}>
                <span className={isPositiveTrend ? "text-success" : isNegativeTrend ? "text-danger" : ""}>{isPositiveTrend ? "▲" : isNegativeTrend ? "▼" : "–"}</span>
                <span className={isPositiveTrend ? "text-success" : isNegativeTrend ? "text-danger" : ""}>{Math.abs(trend)}%</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
