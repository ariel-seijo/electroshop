"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";

interface MyOrdersProps { embedded?: boolean; }

interface MyOrder {
  id: string; orderNumber: string; status: string; subtotal: number;
  shippingCost: number | null; createdAt: string; items: Array<{ quantity: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PENDING": return "bg-warning/10 text-warning-light border border-warning/25";
    case "PAID": return "bg-success/10 text-success border border-success/25";
    case "SHIPPED": return "bg-accent/10 text-accent border border-accent/25";
    case "DELIVERED": return "bg-teal/10 text-teal border border-teal/25";
    case "CANCELLED": return "bg-danger/10 text-danger border border-danger/25";
    default: return "bg-white/5 text-text-tertiary border border-white/10";
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
}

export default function MyOrders({ embedded = false }: MyOrdersProps) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Error al cargar pedidos");
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally { setLoading(false); }
    }
    fetchOrders();
  }, []);

  const header = (
    <div className="flex items-center justify-between mb-8 max-3md:flex-col max-3md:items-start max-3md:gap-3">
      <h1 className="m-0 text-[1.4rem] font-semibold uppercase tracking-[1.5px] text-text-body">Mis Pedidos</h1>
      {!embedded && (
        <Link href="/profile" className="flex items-center gap-[0.4rem] text-[0.85rem] font-semibold text-[rgb(150,150,150)] no-underline uppercase tracking-[0.8px] transition-colors duration-200 hover:text-accent">
          <ArrowLeft size={16} />Volver al perfil
        </Link>
      )}
    </div>
  );

  const spinner = (
    <div className="flex items-center justify-center gap-[0.6rem] py-16 px-4 text-text-subtle text-[0.9rem] uppercase tracking-[1px]">
      <div className="size-5 border-2 border-accent/15 border-t-accent rounded-full animate-[spin_0.7s_linear_infinite]" />
      Cargando pedidos...
    </div>
  );

  const content = (
    <>
      {error && (
        <div className="px-[1.2rem] py-4 bg-danger/10 border border-danger/30 text-danger-light text-[0.85rem] font-semibold mb-6">
          <AlertCircle size={16} style={{ marginRight: 8, display: "inline", verticalAlign: "middle" }} />{error}
        </div>
      )}
      {!error && orders.length === 0 && (
        <div className="text-center px-8 py-16 bg-surface-22 border border-[#1f1f1f] [&>svg]:text-[rgb(80,80,80)] [&>svg]:mb-4">
          <ShoppingBag size={48} strokeWidth={1} />
          <h2 className="m-0 mb-2 text-[1.1rem] font-semibold uppercase tracking-[1px] text-text-tertiary">No tenés pedidos</h2>
          <p className="m-0 mb-6 text-[0.9rem] text-text-subtle">Todavía no realizaste ninguna compra.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-[1.8rem] py-3 bg-accent text-[#111] text-[0.9rem] font-semibold uppercase tracking-[1px] no-underline transition-all duration-[250ms] hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(36,171,243,0.35)] hover:-translate-y-px">Ir a la tienda</Link>
        </div>
      )}
      {orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block bg-surface-22 border border-[#1f1f1f] p-6 no-underline transition-[border-color,background] duration-[250ms] hover:border-border-52 hover:bg-surface-28 max-3md:p-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <span className="text-base font-semibold text-accent tracking-[0.5px]">{order.orderNumber}</span>
                  <span className={`inline-block px-[0.8rem] py-[0.3rem] text-[0.7rem] font-semibold uppercase tracking-[1px] ${statusBadgeClass(order.status)}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-[0.85rem] text-text-tertiary">{itemCount} {itemCount === 1 ? "producto" : "productos"}</span>
                  <span className="text-[0.8rem] text-text-subtle">{formatDate(order.createdAt)}</span>
                  <span className="text-[1.05rem] font-semibold text-text-body">{formatArs(usdToArs(order.subtotal) + (order.shippingCost ?? 0))}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );

  if (loading) return embedded ? spinner : <div className="min-h-[calc(100vh-134px)] flex justify-center px-4 py-8 max-3md:px-2 max-3md:py-4">{spinner}</div>;
  if (embedded) return <div>{header}{content}</div>;
  return (
    <div className="min-h-[calc(100vh-134px)] flex justify-center px-4 py-8 max-3md:px-2 max-3md:py-4">
      <div className="w-full max-w-[768px]">{header}{content}</div>
    </div>
  );
}
