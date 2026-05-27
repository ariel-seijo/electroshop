"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { PackageOpen, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCart } from "@/features/cart";
import { formatPrice } from "@/lib/utils/currency";
import { getErrorMessage } from "@/lib/errors";
import { useCheckout } from "../context/CheckoutContext";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta de Crédito/Débito" },
  { id: "transfer", label: "Transferencia Bancaria" },
  { id: "cash", label: "Efectivo (al retirar)" },
];

const formBase = "bg-surface-22 border border-[#1f1f1f] p-8 max-3md:px-[1.2rem] max-3md:py-[1.2rem]";
const btnPrimary = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border-none cursor-pointer transition-all duration-[250ms] bg-accent text-[#111] hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(36,171,243,0.35)] hover:-translate-y-px max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";
const btnSecondary = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border cursor-pointer transition-all duration-[250ms] bg-border-34 text-text-tertiary border-border-52 hover:bg-border-44 hover:text-white max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";
const btnConfirm = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border-none cursor-pointer transition-all duration-[250ms] bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] hover:shadow-[0_0_28px_rgba(0,127,255,0.4)] hover:-translate-y-px max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";

export default function ReviewStep() {
  const { cart } = useCart();
  const {
    shipping,
    paymentMethod,
    cardDetails,
    isProcessing,
    orderError,
    goPrev,
    placeOrder,
  } = useCheckout();
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    setInternalError(null);
    try {
      await placeOrder();
    } catch (err) {
      setInternalError(getErrorMessage(err));
    }
  }, [placeOrder]);

  const error = internalError || orderError;

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod;

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center gap-6 z-[1000] animate-fade-in">
          <div className="size-12 border-[3px] border-accent/15 border-t-accent rounded-full animate-[spin_0.7s_linear_infinite]" />
          <span className="text-text-secondary text-base font-semibold uppercase tracking-[1.5px]">Procesando pago...</span>
        </div>
      )}

      <div className={formBase}>
        <div className="flex items-center gap-[0.6rem] mb-[1.8rem] pb-4 border-b border-[#1f1f1f] [&>svg]:text-accent [&>h3]:m-0 [&>h3]:text-[1.15rem] [&>h3]:font-semibold [&>h3]:uppercase [&>h3]:tracking-[1.5px] [&>h3]:text-text-body">
          <PackageOpen size={20} />
          <h3>Revisá tu Pedido</h3>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-[1.2rem] bg-surface-18 border border-border-34 [&>h4]:m-0 [&>h4]:mb-[0.6rem] [&>h4]:text-[0.8rem] [&>h4]:font-semibold [&>h4]:uppercase [&>h4]:tracking-[1px] [&>h4]:text-text-dim [&>p]:m-0 [&>p]:mb-[0.2rem] [&>p]:text-[0.92rem] [&>p]:text-text-secondary">
            <h4>Dirección de envío</h4>
            <p>{shipping.fullName}</p>
            <p>{shipping.address}</p>
            <p>{shipping.city}, {shipping.department} - CP {shipping.zip}</p>
            <p>{shipping.email}</p>
            {shipping.phone && <p>{shipping.phone}</p>}
            {shipping.notes && (
              <p className="!text-text-subtle !text-[0.82rem] !mt-[0.4rem]">Nota: {shipping.notes}</p>
            )}
          </div>

          <div className="p-[1.2rem] bg-surface-18 border border-border-34 [&>h4]:m-0 [&>h4]:mb-[0.6rem] [&>h4]:text-[0.8rem] [&>h4]:font-semibold [&>h4]:uppercase [&>h4]:tracking-[1px] [&>h4]:text-text-dim [&>p]:m-0 [&>p]:mb-[0.2rem] [&>p]:text-[0.92rem] [&>p]:text-text-secondary">
            <h4>Método de pago</h4>
            <p>{paymentLabel}</p>
            {paymentMethod === "card" && (
              <p className="!text-text-subtle !text-[0.82rem] !mt-[0.3rem]">
                {cardDetails.cardNumber} · Vence {cardDetails.cardExpiry} · {cardDetails.cardHolder}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-18 border border-border-34 [&>img]:object-contain">
                <Image src={item.thumbnail} alt={item.title} width={60} height={60} />
                <div className="flex-1 flex flex-col gap-[0.2rem]">
                  <span className="text-[0.85rem] font-semibold text-text-secondary">{item.title}</span>
                  <span className="text-[0.78rem] text-text-subtle">{item.quantity} x {formatPrice(item.price)}</span>
                </div>
                <span className="text-[0.95rem] font-semibold text-text-body">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 px-[1.2rem] py-4 bg-danger/10 border border-danger/30 flex items-center justify-between gap-4 animate-shake-in max-3md:flex-col max-3md:text-center">
            <span className="text-danger-light text-[0.85rem] font-semibold flex-1">{error}</span>
            <button
              className="px-4 py-2 bg-border-34 text-danger-light border border-danger/30 text-[0.8rem] font-semibold uppercase tracking-[0.8px] cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-danger/15 hover:border-danger/50"
              onClick={handleConfirm}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button className={btnSecondary} onClick={goPrev} disabled={isProcessing}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <button className={btnConfirm} onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Confirmar pedido
                <Check size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
