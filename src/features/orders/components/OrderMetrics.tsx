import { DollarSign, Clock, Percent, TrendingUp, type LucideIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";

interface OrderMetricsProps {
  metrics?: { totalRevenue?: number; pendingCount?: number; cancellationRate?: number; averageTicket?: number; };
}

interface MetricConfig {
  key: keyof NonNullable<OrderMetricsProps["metrics"]>; label: string; icon: LucideIcon; color: string; format: (v: number) => string;
}

const METRICS: MetricConfig[] = [
  { key: "totalRevenue", label: "Ingresos Totales", icon: DollarSign, color: "#24abf3", format: (v) => formatPrice(v) },
  { key: "pendingCount", label: "Pendientes", icon: Clock, color: "#fbbf24", format: (v) => String(v) },
  { key: "cancellationRate", label: "Tasa Cancelación", icon: Percent, color: "#ff3366", format: (v) => `${v}%` },
  { key: "averageTicket", label: "Ticket Promedio", icon: TrendingUp, color: "#22c55e", format: (v) => formatPrice(v) },
];

export default function OrderMetrics({ metrics }: OrderMetricsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-6 max-md:grid-cols-2 max-md:grid-cols-1">
      {METRICS.map((m) => {
        const Icon = m.icon;
        const value = metrics?.[m.key];
        return (
          <article
            key={m.key}
            className="bg-surface-22 border border-border-40 rounded-[10px] px-6 py-[22px] relative overflow-hidden transition-[transform,box-shadow,border-color] duration-[200ms] shadow-admin hover:-translate-y-0.5 hover:border-accent/15 hover:shadow-[0_0_20px_rgba(36,171,243,0.05),0_0_40px_rgba(255,51,102,0.02),0_8px_32px_rgba(0,0,0,0.5)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-[linear-gradient(90deg,transparent_0%,rgba(36,171,243,0.15)_30%,rgba(255,51,102,0.1)_70%,transparent_100%)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.7rem] font-semibold text-text-muted uppercase tracking-[0.8px]">{m.label}</span>
              <Icon size={18} color={m.color} aria-hidden="true" />
            </div>
            <p className="text-[1.65rem] font-semibold m-0 leading-[1.1] tracking-[-0.5px]" style={{ color: m.color }} data-mono={m.key === "totalRevenue" || m.key === "averageTicket" ? "true" : undefined}>
              {m.format(value ?? 0)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
