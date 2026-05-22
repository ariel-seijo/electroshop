"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";
import styles from "./MyOrders.module.css";

interface MyOrdersProps {
  embedded?: boolean;
}

interface MyOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number | null;
  createdAt: string;
  items: Array<{ quantity: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: styles.statusPending,
  PAID: styles.statusPaid,
  SHIPPED: styles.statusShipped,
  DELIVERED: styles.statusDelivered,
  CANCELLED: styles.statusCancelled,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const header = (
    <div className={styles.header}>
      <h1>Mis Pedidos</h1>
      {!embedded && (
        <Link href="/profile" className={styles.backLink}>
          <ArrowLeft size={16} />
          Volver al perfil
        </Link>
      )}
    </div>
  );

  const content = (
    <>
      {error && (
        <div className={styles.errorMsg}>
          <AlertCircle size={16} style={{ marginRight: 8, display: "inline", verticalAlign: "middle" }} />
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className={styles.empty}>
          <ShoppingBag size={48} strokeWidth={1} />
          <h2>No tenés pedidos</h2>
          <p>Todavía no realizaste ninguna compra.</p>
          <Link href="/" className={styles.shopLink}>
            Ir a la tienda
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className={styles.list}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className={styles.orderCard}
            >
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>{order.orderNumber}</span>
                <span className={`${styles.statusBadge} ${STATUS_CLASSES[order.status] || ""}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className={styles.orderMeta}>
                <span className={styles.itemCount}>
                  {order.items.reduce((acc, item) => acc + item.quantity, 0)} {order.items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? "producto" : "productos"}
                </span>
                <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                <span className={styles.orderTotal}>{formatArs(usdToArs(order.subtotal) + (order.shippingCost ?? 0))}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  if (loading) {
    const spinner = (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Cargando pedidos...
      </div>
    );
    return embedded ? spinner : <div className={styles.page}>{spinner}</div>;
  }

  if (embedded) {
    return (
      <div>
        {header}
        {content}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {header}
        {content}
      </div>
    </div>
  );
}
