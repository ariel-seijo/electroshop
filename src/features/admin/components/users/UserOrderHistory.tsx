"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackageOpen } from "lucide-react";
import { getUserOrderHistoryAction } from "@/features/admin/actions/userActions";
import { formatPrice } from "@/lib/utils/currency";

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
    case "PENDING": return "bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] text-[#fbbf24]"
    case "PAID": return "bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)] text-[#60a5fa]"
    case "SHIPPED": return "bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.3)] text-[#818cf8]"
    case "DELIVERED": return "bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] text-[#4ade80]"
    case "CANCELLED": return "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] text-[#f87171]"
    default: return "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[rgb(160,160,160)]"
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
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-[999]" onClick={onClose} role="presentation">
      <div
        className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[100vw] bg-[rgb(14,14,14)] border-l border-[rgb(40,40,40)] z-[1000] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.6),-1px_0_0_rgba(36,171,243,0.05)] max-[640px]:w-screen"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Historial de pedidos"
      >
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-[rgb(40,40,40)] shrink-0 max-[640px]:px-4 max-[640px]:py-3.5">
          <h3 className="text-[0.9rem] font-semibold text-[rgb(220,220,220)] m-0 tracking-[0.5px] uppercase">
            {data?.user?.name
              ? `Pedidos de ${data.user.name}`
              : "Historial de pedidos"}
          </h3>
          <button
            className="flex items-center justify-center min-w-11 min-h-11 border border-[rgb(40,40,40)] bg-[rgb(22,22,22)] text-[rgb(160,160,160)] cursor-pointer rounded-md transition-all duration-[0.15s] hover:bg-[rgb(40,40,40)] hover:text-[#24abf3] hover:border-[rgba(36,171,243,0.3)]"
            onClick={onClose}
            aria-label="Cerrar historial"
          >
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-[rgb(130,130,130)] flex-1">
            <Loader2 size={24} className="animate-spin mb-3 text-[#24abf3]" />
            Cargando...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-[rgb(130,130,130)] flex-1">
            <p className="text-[#f87171] text-[0.84rem] font-semibold m-0">{error}</p>
          </div>
        )}

        {!loading && !error && data && data.orders.length === 0 && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-[rgb(130,130,130)] flex-1">
            <PackageOpen size={48} className="mb-3.5 opacity-25 text-[rgb(130,130,130)]" />
            <p className="text-[0.84rem] font-semibold text-[rgb(130,130,130)] m-0">No tiene pedidos registrados</p>
          </div>
        )}

        {!loading && !error && data && data.orders.length > 0 && (
          <div className="flex-1 overflow-y-auto py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgb(50,50,50)] [&::-webkit-scrollbar-thumb]:rounded-sm">
            {data.orders.map((order) => (
              <div key={order.id} className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.03)] transition-colors duration-[0.12s] hover:bg-[rgba(36,171,243,0.03)] last:border-b-0 max-[640px]:px-4 max-[640px]:py-3">
                <div className="flex items-center justify-between mb-2 last:mb-0">
                  <span className="font-mono text-[0.78rem] font-semibold text-[#24abf3]">
                    {order.orderNumber}
                  </span>
                  <span className={`inline-flex items-center py-[3px] px-2 rounded text-[0.68rem] font-semibold uppercase tracking-[0.4px] ${getStatusClass(order.status)}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2 last:mb-0">
                  <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)]">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-[0.82rem] font-semibold text-[rgb(210,210,210)]">
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
