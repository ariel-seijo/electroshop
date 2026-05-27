"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Eye, PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";

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
  PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", CANCELLED: "Cancelado", DELIVERED: "Entregado",
};

function getStatusBadge(status: string): string {
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
  return new Date(dateStr).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

const pageBtnBase = "inline-flex items-center justify-center min-w-9 h-9 px-2 border border-white/10 bg-white/5 text-text-tertiary rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[150ms] shrink-0 hover:not-disabled:bg-accent/5 hover:not-disabled:border-accent/20 hover:not-disabled:text-[rgb(220,220,220)] disabled:opacity-30 disabled:cursor-not-allowed max-md:min-w-11 max-md:h-11";

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) params.delete("page");
      else params.set("page", String(newPage));
      router.push(`/admin/orders?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (totalPages <= 1) return null;

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((n) => {
    if (totalPages <= 7) return true;
    if (n === 1 || n === totalPages) return true;
    if (Math.abs(n - page) <= 1) return true;
    return false;
  });

  return (
    <nav className="flex items-center justify-center gap-1 px-4 py-[14px] border-t border-white/5 bg-[rgba(16,16,16,0.98)] max-md:flex-wrap" aria-label="Paginación de pedidos">
      <button type="button" className={pageBtnBase} onClick={() => goToPage(page - 1)} disabled={page <= 1}><ChevronLeft size={16} /></button>
      <div className="flex gap-1 max-md:flex-wrap max-md:justify-center">
        {visiblePages.map((n, idx, arr) => {
          const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
          return (
            <span key={n} className="flex items-center">
              {showEllipsis && <span className="text-[rgb(100,100,100)] text-[0.85rem] px-0.5" aria-hidden="true">…</span>}
              <button type="button" className={`${pageBtnBase} ${n === page ? "bg-accent/10 border-accent/30 text-accent" : ""}`} onClick={() => goToPage(n)} aria-current={n === page ? "page" : undefined}>{n}</button>
            </span>
          );
        })}
      </div>
      <button type="button" className={pageBtnBase} onClick={() => goToPage(page + 1)} disabled={page >= totalPages}><ChevronRight size={16} /></button>
    </nav>
  );
}

const viewBtn = "inline-flex items-center gap-1 px-3 py-1 rounded-md text-[0.7rem] font-semibold text-text-tertiary bg-white/5 border border-white/10 no-underline transition-all duration-[150ms] hover:bg-accent/10 hover:border-accent/25 hover:text-accent";

export default function OrderTable({ orders, total, page, totalPages }: OrderTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center px-6 py-14 text-text-subtle" role="status">
        <PackageOpen size={48} className="mb-[14px] opacity-30 mx-auto" aria-hidden="true" />
        <p className="text-[0.88rem] font-semibold m-0">No se encontraron pedidos</p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-white/5 rounded-[10px] overflow-x-auto bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)] max-[640px]:hidden">
        <table className="w-full border-collapse text-[0.82rem]" aria-label="Lista de pedidos">
          <caption className="visually-hidden">Pedidos — {total} registros, página {page} de {totalPages}</caption>
          <thead className="sticky top-0 z-10">
            <tr>
              {["Pedido","Cliente","Productos","Total","Estado","Fecha","Acciones"].map((h) => (
                <th key={h} className="px-[14px] py-3 text-left font-semibold text-[0.68rem] text-text-muted uppercase tracking-[0.8px] bg-[rgba(16,16,16,0.98)] backdrop-blur-[8px] border-b border-accent/10 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="relative transition-[background,box-shadow] duration-[150ms] even:bg-white/[0.01] hover:bg-accent/[0.03] hover:shadow-[inset_3px_0_0_rgba(36,171,243,0.5)] focus-within:bg-accent/[0.04] focus-within:outline-1 focus-within:outline-accent/20 focus-within:outline-offset-[-1px] [&>td]:px-[14px] [&>td]:py-3 [&>td]:border-b [&>td]:border-white/5 [&>td]:align-middle [&>td]:text-text-secondary">
                <td><span className="font-mono text-[0.8rem] font-semibold text-accent">{order.orderNumber}</span></td>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[0.84rem] text-[rgb(220,220,220)]">{order.user?.name || "—"}</span>
                    <span className="text-[0.72rem] text-text-subtle max-w-[180px] truncate">{order.user?.email || "—"}</span>
                  </div>
                </td>
                <td className="text-center font-semibold">{order._count?.items ?? 0}</td>
                <td><span className="font-mono font-semibold text-[0.82rem]">{formatPrice(order.total)}</span></td>
                <td><span className={`badge ${getStatusBadge(order.status)}`}>{STATUS_LABELS[order.status] || order.status}</span></td>
                <td className="text-[0.78rem] text-text-dim">{formatDate(order.createdAt)}</td>
                <td><Link href={`/admin/orders/${order.id}`} className={viewBtn}><Eye size={14} />Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden max-[640px]:flex max-[640px]:flex-col max-[640px]:gap-3">
        {orders.map((order) => (
          <article key={order.id} className="bg-surface-14 border border-white/5 rounded-[10px] p-[14px] transition-[border-color,box-shadow] duration-200 hover:border-accent/15 hover:shadow-[0_0_12px_rgba(36,171,243,0.05)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[0.85rem] font-semibold text-accent">{order.orderNumber}</span>
              <span className={`badge ${getStatusBadge(order.status)}`}>{STATUS_LABELS[order.status] || order.status}</span>
            </div>
            <div className="flex flex-col gap-2 py-2.5 border-y border-white/5 mb-2.5">
              {[
                ["Cliente", order.user?.name || "—"],
                ["Email", order.user?.email || "—"],
                ["Productos", String(order._count?.items ?? 0)],
                ["Total", formatPrice(order.total)],
                ["Fecha", formatDate(order.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[0.7rem] font-semibold text-text-muted uppercase tracking-[0.5px]">{label}</span>
                  <span className="text-[0.82rem] font-semibold text-text-0 max-w-[60%] truncate text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Link href={`/admin/orders/${order.id}`} className={viewBtn}><Eye size={14} />Ver pedido</Link>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
