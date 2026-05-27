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
import { getErrorMessage } from "@/lib/errors";
import OrderStatusTimeline from "@/features/orders/components/OrderStatusTimeline";

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
  PENDING: "bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]",
  PAID: "bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.25)]",
  SHIPPED: "bg-[rgba(36,171,243,0.12)] text-[#24abf3] border border-[rgba(36,171,243,0.25)]",
  DELIVERED: "bg-[rgba(16,185,129,0.12)] text-[#10b981] border border-[rgba(16,185,129,0.25)]",
  CANCELLED: "bg-[rgba(239,68,68,0.12)] text-[#ef4444] border border-[rgba(239,68,68,0.25)]",
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
        const data: { order: Order; error?: string } = await res.json();
        setOrder(data.order);
      } catch (err) {
        setError(getErrorMessage(err));
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
    <div className="pb-10">
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

  const handleStatusChange = (newStatus: string) => {
    setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  return (
    <div className="pb-10">
      <div className="mb-5">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[rgb(150,150,150)] no-underline uppercase tracking-[0.8px] transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0 font-[inherit] hover:text-[#24abf3]">
          <ArrowLeft size={16} />
          Volver a pedidos
        </Link>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <span className="text-[1.15rem] font-semibold text-[#24abf3] tracking-[0.5px]">{order.orderNumber}</span>
        <div className="flex items-center gap-3">
          <span className={`inline-block py-1 px-3 text-[0.7rem] font-semibold uppercase tracking-[1px] ${STATUS_CLASSES[order.status] || ""}`}>
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

      <OrderStatusTimeline order={order} onStatusChange={handleStatusChange} />

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start max-[860px]:grid-cols-1">
        <div className="flex flex-col gap-6">
          <div className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] p-6 max-[600px]:p-4">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[rgb(40,40,40)] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.85rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
              <User size={18} />
              <h3>Cliente</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
              <div className="flex flex-col gap-[0.2rem]">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Nombre</span>
                <span className="text-[0.85rem] text-[rgb(200,200,200)] font-semibold">{order.user?.name || "—"}</span>
              </div>
              <div className="flex flex-col gap-[0.2rem]">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Email</span>
                <span className="text-[0.85rem] text-[rgb(200,200,200)] font-semibold">{order.user?.email || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] p-6 max-[600px]:p-4">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[rgb(40,40,40)] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.85rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
              <PackageOpen size={18} />
              <h3>Productos ({order.items.length})</h3>
            </div>
            <div className="flex flex-col gap-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#080808] border border-[rgba(255,255,255,0.05)] gap-4">
                  <div className="flex flex-col gap-[0.15rem] flex-1">
                    <span className="text-[0.88rem] font-semibold text-[rgb(200,200,200)]">{item.productTitle}</span>
                    <span className="text-[0.68rem] text-[rgb(100,100,100)] uppercase tracking-[0.5px]">SKU: {item.productSku}</span>
                    <span className="text-[0.75rem] text-[rgb(130,130,130)]">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <span className="text-[0.92rem] font-semibold text-[rgb(214,214,214)] whitespace-nowrap">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] p-6 max-[600px]:p-4">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[rgb(40,40,40)] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.85rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
              <MapPin size={18} />
              <h3>Dirección de envío</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
              {(["fullName", "email", "phone", "address", "city", "department", "zip"] as const).map((field) => (
                <div key={field} className="flex flex-col gap-[0.2rem]">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">
                    {field === "fullName" ? "Nombre" : field === "email" ? "Email" : field === "phone" ? "Teléfono" : field === "address" ? "Dirección" : field === "city" ? "Ciudad" : field === "department" ? "Provincia" : "CP"}
                  </span>
                  <span className="text-[0.85rem] text-[rgb(200,200,200)] font-semibold">{shipping[field] || "—"}</span>
                </div>
              ))}
            </div>
            {shipping.notes && (
              <p className="mt-4 p-3 bg-[rgb(16,16,16)] border-l-[3px] border-l-[#24abf3] text-[0.78rem] text-[rgb(150,150,150)] italic">Nota: {shipping.notes}</p>
            )}
          </div>
        </div>

        <aside className="sticky top-[calc(64px+1.5rem)] flex flex-col gap-6 max-[860px]:static">
          <div className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] p-6 max-[600px]:p-4">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[rgb(40,40,40)] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.85rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
              <CreditCard size={18} />
              <h3>Resumen</h3>
            </div>

            <div className="flex flex-col gap-[0.55rem] pb-3 mb-4 border-b border-[rgb(40,40,40)]">
              <div className="flex justify-between text-[0.82rem] text-[rgb(180,180,180)]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[0.82rem] text-[rgb(180,180,180)]">
                <span>Envío</span>
                <span>{order.shippingCost === 0 ? "Gratis" : formatArs(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-[0.95rem] font-semibold text-[rgb(214,214,214)]">
                <span>Total</span>
                <span>{formatArs(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-[0.2rem] pb-3 mb-3 border-b border-[rgb(40,40,40)]">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Método de pago</span>
              <span className="text-[0.85rem] text-[rgb(200,200,200)] font-semibold">
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
              {order.cardDetails?.last4 && (
                <span className="text-[0.78rem] text-[rgb(130,130,130)] mt-1">
                  **** {order.cardDetails.last4} · {order.cardDetails.holder}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-[0.2rem] pb-3 mb-3 border-b border-[rgb(40,40,40)]">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Fecha del pedido</span>
              <span className="text-[0.85rem] text-[rgb(200,200,200)] font-semibold">{formatDate(order.createdAt)}</span>
            </div>

            <ReceiptDownload order={order} />
          </div>
        </aside>
      </div>
    </div>
  );
}
