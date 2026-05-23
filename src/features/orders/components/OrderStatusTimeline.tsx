"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { updateOrderStatusAction } from "@/features/orders/actions/orderActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import styles from "./OrderStatusTimeline.module.css";

type StatusKey = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface StatusOption {
  key: StatusKey;
  label: string;
  icon: null;
}

const STATUSES: StatusOption[] = [
  { key: "PENDING", label: "Pendiente", icon: null },
  { key: "PAID", label: "Pagado", icon: null },
  { key: "SHIPPED", label: "Enviado", icon: null },
  { key: "DELIVERED", label: "Entregado", icon: null },
];

const STATUS_TRANSITIONS: Record<StatusKey, StatusKey[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const TRANSITION_LABELS: Record<string, string> = {
  PAID: "Marcar como Pagado",
  SHIPPED: "Marcar como Enviado",
  DELIVERED: "Marcar como Entregado",
  CANCELLED: "Cancelar Pedido",
};

function getStatusIndex(status: string): number {
  return STATUSES.findIndex((s) => s.key === status);
}

interface OrderStatusTimelineProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export default function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const toast = useToastStore((s) => s.toast);
  const [localStatus, setLocalStatus] = useState<string>(order.status);
  const [updating, setUpdating] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [transitioningTo, setTransitioningTo] = useState<string | null>(null);

  const status = localStatus;
  const currentIdx = getStatusIndex(status);
  const isCancelled = status === "CANCELLED";

  const handleTransition = async (newStatus: string) => {
    if (updating) return;

    if (newStatus === "CANCELLED") {
      setCancelModalOpen(true);
      return;
    }

    setUpdating(true);
    setTransitioningTo(newStatus);
    const result = await updateOrderStatusAction(order.id, newStatus);
    setUpdating(false);
    setTransitioningTo(null);

    if ("error" in result && result.error) {
      toast(result.error, "error");
    } else {
      setLocalStatus(newStatus);
      toast(`Pedido actualizado a "${STATUSES.find((s) => s.key === newStatus)?.label}"`, "success");
    }
  };

  const handleCancelConfirm = async () => {
    setCancelModalOpen(false);
    setUpdating(true);
    setTransitioningTo("CANCELLED");
    const result = await updateOrderStatusAction(order.id, "CANCELLED");
    setUpdating(false);
    setTransitioningTo(null);

    if ("error" in result && result.error) {
      toast(result.error, "error");
    } else {
      setLocalStatus("CANCELLED");
      toast("Pedido cancelado. Stock restaurado.", "success");
    }
  };

  const availableTransitions: StatusKey[] = isCancelled
    ? []
    : (STATUS_TRANSITIONS[status as StatusKey] || []);

  return (
    <>
      <div className={styles.wrapper}>
        <h3 className={styles.title}>Progresión del pedido</h3>

        <div className={styles.timeline}>
          {STATUSES.map((statusObj, idx) => {
            const isActive = idx <= currentIdx && !isCancelled;
            const isCurrent = idx === currentIdx && !isCancelled;
            const isCompleted = idx < currentIdx && !isCancelled;

            return (
              <div
                key={statusObj.key}
                className={`${styles.node} ${
                  isCompleted ? styles.completed : ""
                } ${isCurrent ? styles.current : ""} ${
                  isActive ? styles.active : ""
                }`}
              >
                <div className={styles.dot}>
                  {isCompleted ? (
                    <CheckCircle2 size={22} className={styles.checkIcon} aria-hidden="true" />
                  ) : isCurrent ? (
                    <div className={styles.currentDot}>
                      <Circle size={22} className={styles.currentCircle} aria-hidden="true" />
                    </div>
                  ) : (
                    <Circle size={22} className={styles.futureDot} aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`${styles.label} ${
                    isActive ? styles.labelActive : styles.labelMuted
                  }`}
                >
                  {statusObj.label}
                </span>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <div className={styles.cancelledBanner} role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            Este pedido fue cancelado. Las transiciones están bloqueadas.
          </div>
        )}

        {availableTransitions.length > 0 && !isCancelled && (
          <div className={styles.actions}>
            {availableTransitions
              .filter((t) => t !== "CANCELLED")
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleTransition(t)}
                  disabled={updating}
                  aria-label={TRANSITION_LABELS[t]}
                >
                  {updating && transitioningTo === t ? (
                    <Loader2 size={14} className={styles.spinner} aria-hidden="true" />
                  ) : null}
                  {TRANSITION_LABELS[t]}
                </button>
              ))}
            {availableTransitions.includes("CANCELLED") && (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setCancelModalOpen(true)}
                disabled={updating}
                aria-label="Cancelar pedido"
              >
                {updating && transitioningTo === "CANCELLED" ? (
                  <Loader2 size={14} className={styles.spinner} aria-hidden="true" />
                ) : null}
                Cancelar Pedido
              </button>
            )}
          </div>
        )}
      </div>

      {cancelModalOpen && (
        <ConfirmModal
          isOpen={cancelModalOpen}
          title="Cancelar pedido"
          message={`¿Estás seguro de que deseas cancelar el pedido ${order.orderNumber}?\n\nEl stock de los productos asociados será restaurado automáticamente. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, cancelar pedido"
          variant="danger"
          isConfirming={false}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelModalOpen(false)}
        />
      )}
    </>
  );
}
