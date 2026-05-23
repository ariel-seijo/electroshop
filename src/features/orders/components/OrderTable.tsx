"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Eye,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";
import styles from "./OrderTable.module.css";

interface OrderTableProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string | Date;
    user?: { name?: string | null; email?: string | null } | null;
    _count?: { items?: number };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
  DELIVERED: "Entregado",
};

function getStatusClass(status: string): string {
  switch (status) {
    case "PENDING": return "badge-warning";
    case "PAID": return "badge-info";
    case "SHIPPED": return "badge-blue";
    case "DELIVERED": return "badge-success";
    case "CANCELLED": return "badge-danger";
    default: return "badge-neutral";
  }
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PaginationProps {
  page: number;
  totalPages: number;
}

function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      router.push(`/admin/orders?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (totalPages <= 1) return null;

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => {
      if (totalPages <= 7) return true;
      if (n === 1 || n === totalPages) return true;
      if (Math.abs(n - page) <= 1) return true;
      return false;
    }
  );

  return (
    <nav className={styles.pagination} aria-label="Paginación de pedidos">
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      <div className={styles.pageNumbers}>
        {visiblePages.map((n, idx, arr) => {
          const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
          return (
            <span key={n} className={styles.pageGroup}>
              {showEllipsis && (
                <span className={styles.ellipsis} aria-hidden="true">…</span>
              )}
              <button
                type="button"
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ""}`}
                onClick={() => goToPage(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Página ${n}`}
              >
                {n}
              </button>
            </span>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default function OrderTable({ orders, total, page, totalPages }: OrderTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <PackageOpen size={48} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>No se encontraron pedidos</p>
      </div>
    );
  }

  return (
    <>
      {/* ---- DESKTOP TABLE ---- */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label="Lista de pedidos">
          <caption className="visually-hidden">
            Pedidos — {total} registros, página {page} de {totalPages}
          </caption>
          <thead className={styles.thead}>
            <tr>
              <th scope="col" className={styles.thOrder}>Pedido</th>
              <th scope="col" className={styles.thCustomer}>Cliente</th>
              <th scope="col" className={styles.thProducts}>Productos</th>
              <th scope="col" className={styles.thTotal}>Total</th>
              <th scope="col" className={styles.thStatus}>Estado</th>
              <th scope="col" className={styles.thDate}>Fecha</th>
              <th scope="col" className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={styles.row}>
                <td>
                  <span className={styles.orderNumber}>
                    {order.orderNumber}
                  </span>
                </td>
                <td>
                  <div className={styles.customerCell}>
                    <span className={styles.customerName}>
                      {order.user?.name || "—"}
                    </span>
                    <span className={styles.customerEmail}>
                      {order.user?.email || "—"}
                    </span>
                  </div>
                </td>
                <td className={styles.productsCell}>
                  {order._count?.items ?? 0}
                </td>
                <td className={styles.totalCell}>
                  <span className={styles.totalValue}>
                    {formatPrice(order.total)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {formatDate(order.createdAt)}
                </td>
                <td>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className={styles.viewBtn}
                    aria-label={`Ver pedido ${order.orderNumber}`}
                  >
                    <Eye size={14} />
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- MOBILE CARDS ---- */}
      <div className={styles.mobileCards}>
        {orders.map((order) => (
          <article key={order.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardOrderNumber}>
                {order.orderNumber}
              </span>
              <span className={`badge ${getStatusClass(order.status)}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Cliente</span>
                <span className={styles.cardValue}>
                  {order.user?.name || "—"}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Email</span>
                <span className={styles.cardValue}>
                  {order.user?.email || "—"}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Productos</span>
                <span className={styles.cardValue}>
                  {order._count?.items ?? 0}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Total</span>
                <span className={styles.cardValue}>
                  {formatPrice(order.total)}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Fecha</span>
                <span className={styles.cardValue}>
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Link
                href={`/admin/orders/${order.id}`}
                className={styles.viewBtn}
                aria-label={`Ver pedido ${order.orderNumber}`}
              >
                <Eye size={14} />
                Ver pedido
              </Link>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
