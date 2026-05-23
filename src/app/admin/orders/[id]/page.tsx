"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  PackageOpen,
  MapPin,
  CreditCard,
  User,
  Printer,
} from "lucide-react";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";
import OrderStatusTimeline from "@/features/orders/components/OrderStatusTimeline";
import styles from "./OrderDetail.module.css";

const ReceiptDownload = dynamic(
  () => import("@/features/orders/components/ReceiptDownload"),
  { ssr: false }
);

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

const PAYMENT_LABELS: Record<string, string> = {
  card: "Tarjeta de Crédito/Débito",
  transfer: "Transferencia Bancaria",
  cash: "Efectivo (al retirar)",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderItem {
  id: number;
  productTitle: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string;
  productId: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  shippingAddress?: Record<string, string>;
  cardDetails?: { last4?: string; holder?: string };
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Pedido no encontrado");
          if (res.status === 403) throw new Error("No autorizado");
          throw new Error("Error al cargar el pedido");
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="loading-spinner" role="status">
        <span className="sr-only">Cargando pedido...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div className="page-back-wrapper">
          <Link href="/admin/orders" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            Volver a pedidos
          </Link>
        </div>
        <div className="error-message" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          {error || "Pedido no encontrado"}
        </div>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const total = order.total ?? usdToArs(order.subtotal) + (order.shippingCost ?? 0);

  return (
    <div>
      <div className={styles.backWrapper}>
        <Link href="/admin/orders" className={styles.backLink}>
          <ArrowLeft size={16} />
          Volver a pedidos
        </Link>
      </div>

      <div className={styles.header}>
        <span className={styles.orderNumber}>{order.orderNumber}</span>
        <div className={styles.headerRight}>
          <span className={`${styles.statusBadge} ${STATUS_CLASSES[order.status] || ""}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm print-keep"
            aria-label="Imprimir factura"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>

      <OrderStatusTimeline order={order} />

      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <User size={18} />
              <h3>Cliente</h3>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Nombre</span>
                <span className={styles.infoValue}>{order.user?.name || "—"}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{order.user?.email || "—"}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <PackageOpen size={18} />
              <h3>Productos ({order.items.length})</h3>
            </div>
            <div className={styles.itemsList}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.productTitle}</span>
                    <span className={styles.itemSku}>SKU: {item.productSku}</span>
                    <span className={styles.itemQty}>
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <span className={styles.itemTotal}>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={18} />
              <h3>Dirección de envío</h3>
            </div>
            <div className={styles.infoGrid}>
              {(["fullName", "email", "phone", "address", "city", "department", "zip"] as const).map((field) => (
                <div key={field} className={styles.infoField}>
                  <span className={styles.infoLabel}>
                    {field === "fullName" ? "Nombre" : field === "email" ? "Email" : field === "phone" ? "Teléfono" : field === "address" ? "Dirección" : field === "city" ? "Ciudad" : field === "department" ? "Provincia" : "CP"}
                  </span>
                  <span className={styles.infoValue}>{shipping[field] || "—"}</span>
                </div>
              ))}
            </div>
            {shipping.notes && (
              <p className={styles.notes}>Nota: {shipping.notes}</p>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <CreditCard size={18} />
              <h3>Resumen</h3>
            </div>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>{order.shippingCost === 0 ? "Gratis" : formatArs(order.shippingCost)}</span>
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total</span>
                <span>{formatArs(total)}</span>
              </div>
            </div>

            <div className={styles.paymentInfo}>
              <span className={styles.infoLabel}>Método de pago</span>
              <span className={styles.infoValue}>
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
              {order.cardDetails?.last4 && (
                <span className={styles.cardInfo}>
                  **** {order.cardDetails.last4} · {order.cardDetails.holder}
                </span>
              )}
            </div>

            <div className={styles.dateInfo}>
              <span className={styles.infoLabel}>Fecha del pedido</span>
              <span className={styles.infoValue}>{formatDate(order.createdAt)}</span>
            </div>

            <ReceiptDownload order={order} />
          </div>
        </aside>
      </div>
    </div>
  );
}
