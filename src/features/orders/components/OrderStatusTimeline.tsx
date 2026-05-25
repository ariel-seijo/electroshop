"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { updateOrderStatusAction } from "@/features/orders/actions/orderActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";

type StatusKey = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface StatusOption { key: StatusKey; label: string; icon: null; }

const STATUSES: StatusOption[] = [
  { key: "PENDING", label: "Pendiente", icon: null },
  { key: "PAID", label: "Pagado", icon: null },
  { key: "SHIPPED", label: "Enviado", icon: null },
  { key: "DELIVERED", label: "Entregado", icon: null },
];

const STATUS_TRANSITIONS: Record<StatusKey, StatusKey[]> = {
  PENDING: ["PAID", "CANCELLED"], PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"], DELIVERED: [], CANCELLED: [],
};

const TRANSITION_LABELS: Record<string, string> = {
  PAID: "Marcar como Pagado", SHIPPED: "Marcar como Enviado",
  DELIVERED: "Marcar como Entregado", CANCELLED: "Cancelar Pedido",
};

function getStatusIndex(status: string): number { return STATUSES.findIndex((s) => s.key === status); }

interface OrderStatusTimelineProps { order: { id: string; orderNumber: string; status: string; }; }

const btnBase = "inline-flex items-center gap-1.5 px-5 py-2.5 border rounded-lg text-[0.8rem] font-semibold tracking-[0.4px] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [&>svg]:animate-[spin_0.7s_linear_infinite]";
const actionBtn = `${btnBase} bg-[linear-gradient(135deg,rgba(36,171,243,0.12),rgba(36,171,243,0.04))] border-accent/20 text-accent hover:not-disabled:bg-[linear-gradient(135deg,rgba(36,171,243,0.18),rgba(36,171,243,0.06))] hover:not-disabled:border-accent/35 hover:not-disabled:shadow-[0_0_16px_rgba(36,171,243,0.1)] hover:not-disabled:-translate-y-px`;
const dangerBtn = `${btnBase} bg-[rgba(255,51,102,0.06)] border-[rgba(255,51,102,0.15)] text-cancelled not-disabled:hover:bg-[rgba(255,51,102,0.12)] not-disabled:hover:border-[rgba(255,51,102,0.3)] not-disabled:hover:shadow-[0_0_16px_rgba(255,51,102,0.1)]`;

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
    if (newStatus === "CANCELLED") { setCancelModalOpen(true); return; }
    setUpdating(true);
    setTransitioningTo(newStatus);
    const result = await updateOrderStatusAction(order.id, newStatus);
    setUpdating(false);
    setTransitioningTo(null);
    if ("error" in result && result.error) toast(result.error, "error");
    else { setLocalStatus(newStatus); toast(`Pedido actualizado a "${STATUSES.find((s) => s.key === newStatus)?.label}"`, "success"); }
  };

  const handleCancelConfirm = async () => {
    setCancelModalOpen(false);
    setUpdating(true);
    setTransitioningTo("CANCELLED");
    const result = await updateOrderStatusAction(order.id, "CANCELLED");
    setUpdating(false);
    setTransitioningTo(null);
    if ("error" in result && result.error) toast(result.error, "error");
    else { setLocalStatus("CANCELLED"); toast("Pedido cancelado. Stock restaurado.", "success"); }
  };

  const availableTransitions: StatusKey[] = isCancelled ? [] : (STATUS_TRANSITIONS[status as StatusKey] || []);

  return (
    <>
      <div className="bg-surface-14 border border-white/5 rounded-[10px] p-6 mb-6 shadow-[0_0_20px_rgba(36,171,243,0.03)]">
        <h3 className="text-[0.8rem] font-semibold text-text-muted uppercase tracking-[1px] m-0 mb-6">Progresión del pedido</h3>

        <div className="flex items-start justify-between relative px-2 max-md:flex-col max-md:gap-4 max-md:items-start before:content-[''] before:absolute before:top-[11px] before:left-11 before:right-11 before:h-0.5 before:bg-white/5 before:z-0 max-md:before:left-[11px] max-md:before:right-auto max-md:before:top-[22px] max-md:before:bottom-[22px] max-md:before:w-0.5 max-md:before:h-auto">
          {STATUSES.map((statusObj, idx) => {
            const isActive = idx <= currentIdx && !isCancelled;
            const isCurrent = idx === currentIdx && !isCancelled;
            const isCompleted = idx < currentIdx && !isCancelled;
            return (
              <div key={statusObj.key} className={`flex flex-col items-center gap-2.5 relative z-[1] flex-1 max-w-[100px] text-center max-md:flex-row max-md:max-w-none max-md:gap-[14px] max-md:w-full ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isActive ? "active" : ""}`}>
                <div className="relative z-[1] bg-[rgba(12,12,12,0.98)] rounded-full p-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={22} className="text-accent [filter:drop-shadow(0_0_6px_rgba(36,171,243,0.5))]" aria-hidden="true" />
                  ) : isCurrent ? (
                    <div className="animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none">
                      <Circle size={22} className="text-accent fill-accent/15" aria-hidden="true" />
                    </div>
                  ) : (
                    <Circle size={22} className="text-[rgb(80,80,80)]" aria-hidden="true" />
                  )}
                </div>
                <span className={`text-[0.68rem] font-semibold uppercase tracking-[0.5px] ${isActive ? "text-accent" : "text-[rgb(100,100,100)]"}`}>{statusObj.label}</span>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <div className="flex items-center gap-2 mt-6 px-4 py-3 bg-[rgba(255,51,102,0.06)] border border-[rgba(255,51,102,0.15)] rounded-lg text-cancelled text-[0.78rem] font-semibold" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            Este pedido fue cancelado. Las transiciones están bloqueadas.
          </div>
        )}

        {availableTransitions.length > 0 && !isCancelled && (
          <div className="flex gap-2.5 mt-6 pt-5 border-t border-white/5 flex-wrap max-md:flex-col">
            {availableTransitions.filter((t) => t !== "CANCELLED").map((t) => (
              <button key={t} type="button" className={actionBtn} onClick={() => handleTransition(t)} disabled={updating}>
                {updating && transitioningTo === t ? <Loader2 size={14} aria-hidden="true" /> : null}{TRANSITION_LABELS[t]}
              </button>
            ))}
            {availableTransitions.includes("CANCELLED") && (
              <button type="button" className={dangerBtn} onClick={() => setCancelModalOpen(true)} disabled={updating}>
                {updating && transitioningTo === "CANCELLED" ? <Loader2 size={14} aria-hidden="true" /> : null}Cancelar Pedido
              </button>
            )}
          </div>
        )}
      </div>

      {cancelModalOpen && (
        <ConfirmModal
          isOpen={cancelModalOpen} title="Cancelar pedido"
          message={`¿Estás seguro de que deseas cancelar el pedido ${order.orderNumber}?\n\nEl stock de los productos asociados será restaurado automáticamente. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, cancelar pedido" variant="danger" isConfirming={false}
          onConfirm={handleCancelConfirm} onCancel={() => setCancelModalOpen(false)}
        />
      )}
    </>
  );
}
