import { DollarSign, Clock, Percent, TrendingUp, type LucideIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";
import styles from "./OrderMetrics.module.css";

interface OrderMetricsProps {
  metrics?: {
    totalRevenue?: number;
    pendingCount?: number;
    cancellationRate?: number;
    averageTicket?: number;
  };
}

interface MetricConfig {
  key: keyof NonNullable<OrderMetricsProps["metrics"]>;
  label: string;
  icon: LucideIcon;
  color: string;
  format: (v: number) => string;
}

const METRICS: MetricConfig[] = [
  {
    key: "totalRevenue",
    label: "Ingresos Totales",
    icon: DollarSign,
    color: "#24abf3",
    format: (v) => formatPrice(v),
  },
  {
    key: "pendingCount",
    label: "Pendientes",
    icon: Clock,
    color: "#fbbf24",
    format: (v) => String(v),
  },
  {
    key: "cancellationRate",
    label: "Tasa Cancelación",
    icon: Percent,
    color: "#ff3366",
    format: (v) => `${v}%`,
  },
  {
    key: "averageTicket",
    label: "Ticket Promedio",
    icon: TrendingUp,
    color: "#22c55e",
    format: (v) => formatPrice(v),
  },
];

export default function OrderMetrics({ metrics }: OrderMetricsProps) {
  return (
    <div className={styles.grid}>
      {METRICS.map((m) => {
        const Icon = m.icon;
        const value = metrics?.[m.key];
        return (
          <article key={m.key} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.label}>{m.label}</span>
              <Icon size={18} color={m.color} aria-hidden="true" />
            </div>
            <p
              className={styles.value}
              style={{ color: m.color }}
              data-mono={m.key === "totalRevenue" || m.key === "averageTicket" ? "true" : undefined}
            >
              {m.format(value ?? 0)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
