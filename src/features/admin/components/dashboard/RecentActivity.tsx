"use client";

import { ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import { formatArs } from "@/lib/utils/currency";
import Link from "next/link";
import styles from "./RecentActivity.module.css";

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
    <div className={styles.grid}>
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <ShoppingCart size={18} color="#24abf3" aria-hidden="true" />
          <h3 className={styles.columnTitle}>Últimas Órdenes</h3>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
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
                      <span className={styles.mono}>{order.orderNumber}</span>
                    </td>
                    <td className={styles.clientCell}>
                      <span className={styles.clientName}>
                        {order.user?.email || "—"}
                      </span>
                      <span className={styles.clientEmail}>
                        {order.user?.name || ""}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_MAP[order.status]?.class || ""}`}>
                        {STATUS_MAP[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.mono}>{formatArs(order.total * exchangeRate)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No hay órdenes recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link href="/admin/orders" className={styles.viewAll}>
          Ver todos <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <TrendingUp size={18} color="#24abf3" aria-hidden="true" />
          <h3 className={styles.columnTitle}>Más Vendidos</h3>
        </div>

        <div className={styles.productsList}>
          {topProducts && topProducts.length > 0 ? (
            topProducts.map((product, index) => {
              const totalQty = product.sold + product.stock;
              const stockPct = totalQty > 0 ? (product.stock / totalQty) * 100 : 0;
              const isGreen = stockPct > 50;
              const isAmber = stockPct > 20 && stockPct <= 50;
              const isRed = stockPct <= 20;
              return (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productRank}>#{index + 1}</div>
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <span className={styles.productTitle}>{product.title}</span>
                      {product.brand && (
                        <span className={styles.productBrand}>{product.brand}</span>
                      )}
                    </div>
                    <div className={styles.productMeta}>
                      <span className={styles.soldCount}>{product.sold} vendidos</span>
                      <span className={styles.stockCount}>
                        {product.stock} en stock
                      </span>
                    </div>
                    <div className={styles.progressWrapper}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${stockPct}%` } as React.CSSProperties}
                        data-stock-green={isGreen ? "true" : undefined}
                        data-stock-amber={isAmber ? "true" : undefined}
                        data-stock-red={isRed ? "true" : undefined}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyProducts}>
              No hay productos populares aún
            </div>
          )}
        </div>

        <Link href="/admin/products" className={styles.viewAll}>
          Ver todos <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
