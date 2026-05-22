'use client';

import { useState, useRef, useEffect } from "react";
import { Bell, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import styles from "./NotificationBell.module.css";

interface LowStockProduct {
  id: number;
  title: string;
  stock: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  user?: { email: string } | null;
}

interface NotificationBellProps {
  lowStock?: { count: number; products: LowStockProduct[] };
  recentOrders?: RecentOrder[];
  pendingCount?: number;
}

export default function NotificationBell({ lowStock, recentOrders, pendingCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("admin-dismissed");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalAlerts =
    (lowStock?.products?.filter((p) => !dismissed.has(`stock-${p.id}`)).length || 0) +
    (recentOrders?.filter((o) => !dismissed.has(`order-${o.id}`)).length || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("admin-dismissed", JSON.stringify([...dismissed]));
      } catch {
        // ignore
      }
    }
  }, [dismissed, mounted]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    const timer = setInterval(() => {
      window.location.reload();
    }, 60000);

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, [open]);

  function handleDismiss(itemId: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }

  const lowStockItems = lowStock?.products?.filter((p) => !dismissed.has(`stock-${p.id}`)) || [];
  const orderItems = recentOrders?.filter((o) => !dismissed.has(`order-${o.id}`)) || [];

  return (
    <div className={styles.bell} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label={`Notificaciones${totalAlerts > 0 ? ` (${totalAlerts})` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={18} />
        {totalAlerts > 0 && (
          <span className={styles.count} aria-label={`${totalAlerts} notificaciones`}>
            {totalAlerts > 99 ? "99+" : totalAlerts}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notificaciones">
          <div className={styles.header}>
            <h3 className={styles.title}>Notificaciones</h3>
          </div>

          <div className={styles.list}>
            {lowStockItems.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <AlertTriangle size={14} className={styles.sectionIconLow} />
                  <span className={styles.sectionLabel}>Bajo inventario ({lowStockItems.length})</span>
                </div>
                {lowStockItems.map((product) => (
                  <div key={`stock-${product.id}`} className={styles.item}>
                    <Package size={14} className={styles.itemIcon} />
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{product.title}</span>
                      <span className={styles.itemMeta}>
                        Stock: {product.stock === 0 ? "Agotado" : product.stock}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.dismissBtn}
                      onClick={() => handleDismiss(`stock-${product.id}`)}
                      aria-label={`Descartar alerta de ${product.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {orderItems.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ShoppingCart size={14} className={styles.sectionIconOrder} />
                  <span className={styles.sectionLabel}>Pedidos ({orderItems.length})</span>
                </div>
                {orderItems.map((order) => (
                  <div key={`order-${order.id}`} className={styles.item}>
                    <ShoppingCart size={14} className={styles.itemIcon} />
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{order.orderNumber}</span>
                      <span className={styles.itemMeta}>
                        {order.user?.email || "Sin email"} • {order.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.dismissBtn}
                      onClick={() => handleDismiss(`order-${order.id}`)}
                      aria-label={`Descartar alerta de ${order.orderNumber}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {lowStockItems.length === 0 && orderItems.length === 0 && (
              <div className={styles.empty}>
                <Bell size={24} className={styles.emptyIcon} />
                <span>No hay notificaciones</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
