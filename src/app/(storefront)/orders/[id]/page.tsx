"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  PackageOpen,
  MapPin,
  CreditCard,
} from "lucide-react";
import dynamic from "next/dynamic";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";
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
}

interface Order {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  paymentMethod: string;
  createdAt: string;
  shippingAddress?: Record<string, string>;
  cardDetails?: { last4?: string; holder?: string };
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Pedido no encontrado");
          if (res.status === 403) throw new Error("No tenés acceso a este pedido");
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
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Cargando pedido...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBlock}>
            <AlertCircle size={24} />
            <p>{error}</p>
            <Link href="/orders" className={styles.backBtn}>
              <ArrowLeft size={16} />
              Volver a pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const shipping = order.shippingAddress || {};

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/orders" className={styles.backLink}>
            <ArrowLeft size={16} />
            Mis pedidos
          </Link>
          <div className={styles.headerRight}>
            <span className={styles.orderNumber}>{order.orderNumber}</span>
            <span className={`${styles.statusBadge} ${STATUS_CLASSES[order.status] || ""}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.main}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <PackageOpen size={18} />
                <h3>Productos</h3>
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
                {["fullName", "email", "phone", "address", "city", "department", "zip"].map((field) => (
                  <div key={field} className={styles.infoField}>
                    <span className={styles.infoLabel}>{field === "fullName" ? "Nombre" : field === "email" ? "Email" : field === "phone" ? "Teléfono" : field === "address" ? "Dirección" : field === "city" ? "Ciudad" : field === "department" ? "Provincia" : "CP"}</span>
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
            <div className={styles.sidebarCard}>
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
                  <span>{formatArs(usdToArs(order.subtotal) + (order.shippingCost ?? 0))}</span>
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
    </div>
  );
}
