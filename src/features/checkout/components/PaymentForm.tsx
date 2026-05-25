"use client";

import { useCallback } from "react";
import { ChevronRight, CreditCard, ArrowLeft, Banknote, Building2, type LucideIcon } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { formatCardNumber, formatExpiry, formatCvc } from "@/lib/utils/input-formatters";
import MagicFillButton from "./MagicFillButton";

const PAYMENT_METHODS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "card", label: "Tarjeta de Crédito/Débito", icon: CreditCard },
  { id: "transfer", label: "Transferencia Bancaria", icon: Building2 },
  { id: "cash", label: "Efectivo (al retirar)", icon: Banknote },
];

const formBase = "bg-surface-22 border border-[#1f1f1f] p-8 max-3md:px-[1.2rem] max-3md:py-[1.2rem]";
const sectionHeader = "flex items-center justify-between mb-[1.8rem] pb-4 border-b border-[#1f1f1f] max-3md:flex-col max-3md:items-start max-3md:gap-3";
const sectionHeaderLeft = "flex items-center gap-[0.6rem] [&>svg]:text-accent [&>h3]:m-0 [&>h3]:text-[1.15rem] [&>h3]:font-semibold [&>h3]:uppercase [&>h3]:tracking-[1.5px] [&>h3]:text-text-body";
const row = "mb-[1.2rem]";
const row3 = "grid grid-cols-3 gap-4 max-3md:grid-cols-1";
const group = "flex flex-col gap-[0.35rem] [&>label]:text-xs [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.5px] [&>label]:text-text-dim";
const inputField = "px-[0.85rem] py-3 bg-surface-18 border border-border-42 text-text-body text-[0.92rem] outline-none transition-[border-color,box-shadow] duration-[250ms] focus:border-accent focus:shadow-[0_0_0_3px_rgba(36,171,243,0.1)]";
const requiredStar = "text-danger ml-[0.15rem]";
const btnPrimary = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border-none cursor-pointer transition-all duration-[250ms] bg-accent text-[#111] hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(36,171,243,0.35)] hover:-translate-y-px max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";
const btnSecondary = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border cursor-pointer transition-all duration-[250ms] bg-border-34 text-text-tertiary border-border-52 hover:bg-border-44 hover:text-white max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";
const actions = "mt-6 flex justify-end";
const actionsDual = "justify-between";

export default function PaymentForm() {
  const {
    paymentMethod,
    cardDetails,
    setPaymentMethod,
    setCardField,
    autoFillPayment,
    goNext,
    goPrev,
  } = useCheckout();

  const handleCardChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      let formatted = value;
      if (name === "cardNumber") formatted = formatCardNumber(value);
      else if (name === "cardExpiry") formatted = formatExpiry(value);
      else if (name === "cardCvc") formatted = formatCvc(value);
      setCardField(name, formatted);
    },
    [setCardField]
  );

  return (
    <div className={formBase}>
      <div className={sectionHeader}>
        <div className={sectionHeaderLeft}>
          <CreditCard size={20} />
          <h3>Método de Pago</h3>
        </div>
        <MagicFillButton onFill={autoFillPayment} />
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 px-[1.2rem] py-4 bg-surface-18 border border-border-42 cursor-pointer transition-all duration-[250ms] relative hover:border-[rgb(80,80,80)] hover:bg-surface-24 ${
              paymentMethod === method.id
                ? "border-accent bg-accent/5 shadow-[0_0_12px_rgba(36,171,243,0.08)] [&>svg]:text-accent"
                : ""
            } max-3md:px-4 max-3md:py-[0.8rem]`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={paymentMethod === method.id}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="absolute opacity-0"
            />
            <method.icon size={20} className="text-text-dim transition-colors duration-[250ms]" />
            <span className="text-[0.92rem] font-semibold text-text-tertiary flex-1">{method.label}</span>
            <div className={`size-5 rounded-full border-2 border-border-52 transition-all duration-[250ms] flex items-center justify-center ${
              paymentMethod === method.id
                ? "border-accent bg-accent shadow-[0_0_8px_rgba(36,171,243,0.4)] after:content-[''] after:size-1.5 after:bg-[#111] after:rounded-full"
                : ""
            }`} />
          </label>
        ))}
      </div>

      {paymentMethod === "card" && (
        <div className="mb-2 p-6 bg-surface-18 border border-border-34">
          <div className={row}>
            <div className={group}>
              <label>Número de tarjeta <span className={requiredStar}>*</span></label>
              <input name="cardNumber" value={cardDetails.cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" className={inputField} />
            </div>
          </div>
          <div className={`${row} ${row3}`}>
            <div className={group}>
              <label>Vencimiento <span className={requiredStar}>*</span></label>
              <input name="cardExpiry" value={cardDetails.cardExpiry} onChange={handleCardChange} placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" className={inputField} />
            </div>
            <div className={group}>
              <label>CVC <span className={requiredStar}>*</span></label>
              <input name="cardCvc" value={cardDetails.cardCvc} onChange={handleCardChange} placeholder="123" inputMode="numeric" autoComplete="cc-csc" className={inputField} />
            </div>
            <div className={group}>
              <label>Titular <span className={requiredStar}>*</span></label>
              <input name="cardHolder" value={cardDetails.cardHolder} onChange={handleCardChange} placeholder="Nombre en la tarjeta" autoComplete="cc-name" className={inputField} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button className={btnSecondary} onClick={goPrev}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <button className={btnPrimary} onClick={goNext}>
          Revisar pedido
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
