"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackageOpen } from "lucide-react";
import { getUserOrderHistoryAction } from "@/features/admin/actions/userActions";
import { formatPrice } from "@/lib/utils/currency";
import styles from "./UserOrderHistory.module.css";

interface OrderItem {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface OrderHistoryData {
  user: UserData;
  orders: OrderItem[];
}

interface UserOrderHistoryProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function getStatusClass(status: string): string {
  switch (status) {
    case "PENDING": return styles.badgeWarning;
    case "PAID": return styles.badgeInfo;
    case "SHIPPED": return styles.badgeBlue;
    case "DELIVERED": return styles.badgeSuccess;
    case "CANCELLED": return styles.badgeDanger;
    default: return styles.badgeNeutral;
  }
}

export default function UserOrderHistory({ userId, isOpen, onClose }: UserOrderHistoryProps) {
  const [data, setData] = useState<OrderHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isOpen) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      const result = await getUserOrderHistoryAction(userId!);
      setLoading(false);

      const orderErrorMsg = "error" in result ? result.error : undefined;
      if (orderErrorMsg) {
        setError(orderErrorMsg);
      } else {
        const successResult = result as { user: UserData; orders: unknown };
        setData({ user: successResult.user, orders: successResult.orders as OrderItem[] });
      }
    }

    fetchData();
  }, [userId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Historial de pedidos"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>
            {data?.user?.name
              ? `Pedidos de ${data.user.name}`
              : "Historial de pedidos"}
          </h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar historial"
          >
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className={styles.center}>
            <Loader2 size={24} className={styles.spinner} />
            Cargando...
          </div>
        )}

        {error && (
          <div className={styles.center}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {!loading && !error && data && data.orders.length === 0 && (
          <div className={styles.center}>
            <PackageOpen size={48} className={styles.emptyIcon} />
            <p className={styles.empty}>No tiene pedidos registrados</p>
          </div>
        )}

        {!loading && !error && data && data.orders.length > 0 && (
          <div className={styles.list}>
            {data.orders.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardRow}>
                  <span className={styles.orderNumber}>
                    {order.orderNumber}
                  </span>
                  <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.date}>
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className={styles.total}>
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
