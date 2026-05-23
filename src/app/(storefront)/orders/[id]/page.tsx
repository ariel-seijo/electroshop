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
      <div className="min-h-[calc(100vh-134px)] flex justify-center p-8 max-[600px]:p-4">
        <div className="flex items-center justify-center p-16 text-[rgb(130,130,130)] gap-2.5 text-[0.9rem] uppercase tracking-[1px]">
          <div className="w-5 h-5 border-2 border-[rgba(36,171,243,0.15)] border-t-[#24abf3] rounded-full animate-spin" />
          Cargando pedido...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-134px)] flex justify-center p-8 max-[600px]:p-4">
        <div className="w-full max-w-[1000px]">
          <div className="text-center px-8 py-12 bg-[rgb(22,22,22)] border border-[#1f1f1f] text-[#f87171] [&_p]:my-4 [&_p]:text-[0.95rem] [&_p]:font-semibold">
            <AlertCircle size={24} />
            <p>{error}</p>
            <Link href="/orders" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[rgb(150,150,150)] no-underline uppercase tracking-[0.8px] transition-colors duration-200 border-0 bg-transparent cursor-pointer p-0 font-[inherit] hover:text-[#24abf3]">
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
    <div className="min-h-[calc(100vh-134px)] flex justify-center p-8 max-[600px]:p-4">
      <div className="w-full max-w-[1000px]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[rgb(150,150,150)] no-underline uppercase tracking-[0.8px] transition-colors duration-200 border-0 bg-transparent cursor-pointer p-0 font-[inherit] hover:text-[#24abf3]">
            <ArrowLeft size={16} />
            Mis pedidos
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[1.15rem] font-semibold text-[#24abf3] tracking-[0.5px]">{order.orderNumber}</span>
            <span className={`inline-block py-[0.3rem] px-[0.8rem] text-[0.7rem] font-semibold uppercase tracking-[1px] ${STATUS_CLASSES[order.status] || ""}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-6 items-start max-[800px]:grid-cols-1">
          <div className="flex flex-col gap-6">
            <div className="bg-[rgb(22,22,22)] border border-[#1f1f1f] p-6 max-[600px]:p-4">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1f1f1f] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
                <PackageOpen size={18} />
                <h3>Productos</h3>
              </div>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-[rgb(18,18,18)] border border-[rgb(34,34,34)] gap-4">
                    <div className="flex flex-col gap-[0.2rem] flex-1">
                      <span className="text-[0.9rem] font-semibold text-[rgb(200,200,200)]">{item.productTitle}</span>
                      <span className="text-[0.7rem] text-[rgb(100,100,100)] uppercase tracking-[0.5px]">SKU: {item.productSku}</span>
                      <span className="text-[0.78rem] text-[rgb(130,130,130)]">
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                    <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)] whitespace-nowrap">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(22,22,22)] border border-[#1f1f1f] p-6 max-[600px]:p-4">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1f1f1f] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
                <MapPin size={18} />
                <h3>Dirección de envío</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 max-[800px]:grid-cols-1">
                {["fullName", "email", "phone", "address", "city", "department", "zip"].map((field) => (
                  <div key={field} className="flex flex-col gap-[0.25rem]">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">{field === "fullName" ? "Nombre" : field === "email" ? "Email" : field === "phone" ? "Teléfono" : field === "address" ? "Dirección" : field === "city" ? "Ciudad" : field === "department" ? "Provincia" : "CP"}</span>
                    <span className="text-[0.88rem] text-[rgb(200,200,200)] font-semibold">{shipping[field] || "—"}</span>
                  </div>
                ))}
              </div>
              {shipping.notes && (
                <p className="mt-4 p-3 bg-[rgb(18,18,18)] border-l-[3px] border-l-[#24abf3] text-[0.8rem] text-[rgb(150,150,150)] italic">Nota: {shipping.notes}</p>
              )}
            </div>
          </div>

          <aside className="sticky top-[100px] max-[800px]:static">
            <div className="bg-[rgb(22,22,22)] border border-[#1f1f1f] p-6 max-[600px]:p-4">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1f1f1f] [&_svg]:text-[#24abf3] [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[1px] [&_h3]:text-[rgb(214,214,214)]">
                <CreditCard size={18} />
                <h3>Resumen</h3>
              </div>

              <div className="flex flex-col gap-[0.6rem] pb-3 mb-4 border-b border-[#1f1f1f]">
                <div className="flex justify-between text-[0.85rem] text-[rgb(180,180,180)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[0.85rem] text-[rgb(180,180,180)]">
                  <span>Envío</span>
                  <span>{order.shippingCost === 0 ? "Gratis" : formatArs(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-[1rem] font-semibold text-[rgb(214,214,214)]">
                  <span>Total</span>
                  <span>{formatArs(usdToArs(order.subtotal) + (order.shippingCost ?? 0))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-[0.25rem] pb-3 mb-3 border-b border-[#1f1f1f]">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Método de pago</span>
                <span className="text-[0.88rem] text-[rgb(200,200,200)] font-semibold">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
                {order.cardDetails?.last4 && (
                  <span className="text-[0.8rem] text-[rgb(130,130,130)] mt-[0.3rem]">
                    **** {order.cardDetails.last4} · {order.cardDetails.holder}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-[0.25rem] pb-4 mb-4 border-b border-[#1f1f1f]">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.8px] text-[rgb(120,120,120)]">Fecha del pedido</span>
                <span className="text-[0.88rem] text-[rgb(200,200,200)] font-semibold">{formatDate(order.createdAt)}</span>
              </div>

              <ReceiptDownload order={order} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
