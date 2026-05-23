"use client";

import { ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import { formatArs } from "@/lib/utils/currency";
import Link from "next/link";

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  user?: { name?: string | null; email?: string } | null;
}

interface TopProduct {
  id: number;
  title: string;
  brand: string;
  sold: number;
  stock: number;
}

interface RecentActivityProps {
  latestOrders?: RecentOrder[];
  topProducts?: TopProduct[];
  exchangeRate?: number;
}

const STATUS_MAP: Record<string, { class: string; label: string }> = {
  PENDING: { class: "badge-warning", label: "Pendiente" },
  PAID: { class: "badge-info", label: "Pagado" },
  SHIPPED: { class: "badge-info", label: "Enviado" },
  DELIVERED: { class: "badge-success", label: "Entregado" },
  CANCELLED: { class: "badge-danger", label: "Cancelado" },
};

export default function RecentActivity({ latestOrders, topProducts, exchangeRate = 1400 }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
      <div className="bg-[rgb(14,14,14)] border border-[rgb(40,40,40)] rounded-[10px] p-5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-[640px]:p-3.5">
        <div className="flex items-center gap-2.5 mb-[18px] pb-3 border-b border-[rgba(255,255,255,0.05)]">
          <ShoppingCart size={18} color="#24abf3" aria-hidden="true" />
          <h3 className="text-[0.85rem] font-semibold text-[#e4e4e4] uppercase tracking-[0.5px] m-0">Últimas Órdenes</h3>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-[0.8rem] [&_th]:text-left [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-[0.65rem] [&_th]:font-semibold [&_th]:text-[rgb(145,145,145)] [&_th]:uppercase [&_th]:tracking-[0.8px] [&_th]:border-b [&_th]:border-[rgba(255,255,255,0.05)] [&_td]:p-2.5 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.03)] [&_td]:align-middle [&_tr:hover_td]:bg-[rgba(255,255,255,0.02)] max-[640px]:[&_thead]:hidden max-[640px]:[&_tbody]:flex max-[640px]:[&_tbody]:flex-col max-[640px]:[&_tr]:grid max-[640px]:[&_tr]:grid-cols-[1fr_auto] max-[640px]:[&_tr]:gap-x-3 max-[640px]:[&_tr]:gap-y-0.5 max-[640px]:[&_tr]:py-2.5 max-[640px]:[&_tr]:border-b max-[640px]:[&_tr]:border-[rgba(255,255,255,0.04)] max-[640px]:[&_tr]:items-center max-[640px]:[&_tr]:last:border-0 max-[640px]:[&_td]:block max-[640px]:[&_td]:p-0 max-[640px]:[&_td:nth-child(1)]:col-start-1 max-[640px]:[&_td:nth-child(1)]:row-start-1 max-[640px]:[&_td:nth-child(2)]:col-start-2 max-[640px]:[&_td:nth-child(2)]:row-start-1 max-[640px]:[&_td:nth-child(2)]:text-right max-[640px]:[&_td:nth-child(3)]:col-start-1 max-[640px]:[&_td:nth-child(3)]:row-start-2 max-[640px]:[&_td:nth-child(4)]:col-start-2 max-[640px]:[&_td:nth-child(4)]:row-start-2 max-[640px]:[&_td:nth-child(4)]:text-right">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders && latestOrders.length > 0 ? (
                latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-[0.75rem] text-[#e4e4e4] max-[640px]:text-[0.72rem]">{order.orderNumber}</span>
                    </td>
                    <td className="flex flex-col gap-0.5 max-[640px]:items-end">
                      <span className="text-[0.8rem] text-[#e4e4e4] font-semibold max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap max-[640px]:text-[0.78rem]">
                        {order.user?.email || "—"}
                      </span>
                      <span className="text-[0.7rem] text-[rgb(145,145,145)] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap max-[640px]:hidden">
                        {order.user?.name || ""}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_MAP[order.status]?.class || ""}`}>
                        {STATUS_MAP[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[0.75rem] text-[#e4e4e4] max-[640px]:text-[0.72rem]">{formatArs(order.total * exchangeRate)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-[rgb(145,145,145)] !p-6 text-[0.8rem]">
                    No hay órdenes recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 mt-4 pt-3 text-[0.75rem] font-semibold text-[#24abf3] no-underline uppercase tracking-[0.5px] transition-[gap] duration-200 hover:gap-2.5">
          Ver todos <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="bg-[rgb(14,14,14)] border border-[rgb(40,40,40)] rounded-[10px] p-5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-[640px]:p-3.5">
        <div className="flex items-center gap-2.5 mb-[18px] pb-3 border-b border-[rgba(255,255,255,0.05)]">
          <TrendingUp size={18} color="#24abf3" aria-hidden="true" />
          <h3 className="text-[0.85rem] font-semibold text-[#e4e4e4] uppercase tracking-[0.5px] m-0">Más Vendidos</h3>
        </div>

        <div className="flex flex-col gap-3.5 flex-1">
          {topProducts && topProducts.length > 0 ? (
            topProducts.map((product, index) => {
              const totalQty = product.sold + product.stock;
              const stockPct = totalQty > 0 ? (product.stock / totalQty) * 100 : 0;
              const isGreen = stockPct > 50;
              const isAmber = stockPct > 20 && stockPct <= 50;
              const isRed = stockPct <= 20;
              return (
                <div key={product.id} className="flex items-start gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg transition-colors duration-200 hover:bg-[rgba(255,255,255,0.03)]">
                  <div className="w-6 h-6 flex items-center justify-center bg-[rgba(36,171,243,0.1)] border border-[rgba(36,171,243,0.2)] rounded text-[0.65rem] font-semibold text-[#24abf3] shrink-0">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-[0.8rem] font-semibold text-[#e4e4e4] whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] max-[640px]:max-w-[140px]">{product.title}</span>
                      {product.brand && (
                        <span className="text-[0.65rem] text-[rgb(145,145,145)] uppercase tracking-[0.5px]">{product.brand}</span>
                      )}
                    </div>
                    <div className="flex gap-3 mb-2">
                      <span className="font-mono text-[0.7rem] font-semibold text-[#22c55e]">{product.sold} vendidos</span>
                      <span className="text-[0.7rem] text-[rgb(145,145,145)]">
                        {product.stock} en stock
                      </span>
                    </div>
                    <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-[width] duration-300 ${isGreen ? "bg-gradient-to-r from-[#22c55e] to-[#16a34a]" : isAmber ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706]" : "bg-gradient-to-r from-[#ef4444] to-[#dc2626]"}`}
                        style={{ width: `${stockPct}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full min-h-[150px] text-[rgb(145,145,145)] text-[0.8rem]">
              No hay productos populares aún
            </div>
          )}
        </div>

        <Link href="/admin/products" className="inline-flex items-center gap-1.5 mt-4 pt-3 text-[0.75rem] font-semibold text-[#24abf3] no-underline uppercase tracking-[0.5px] transition-[gap] duration-200 hover:gap-2.5">
          Ver todos <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
