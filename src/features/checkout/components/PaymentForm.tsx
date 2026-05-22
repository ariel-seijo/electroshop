"use client";

import { useCallback } from "react";
import { ChevronRight, CreditCard, ArrowLeft, Banknote, Building2, type LucideIcon } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { formatCardNumber, formatExpiry, formatCvc } from "@/lib/utils/input-formatters";
import MagicFillButton from "./MagicFillButton";
import styles from "../styles/PaymentForm.module.css";

const PAYMENT_METHODS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "card", label: "Tarjeta de Crédito/Débito", icon: CreditCard },
  { id: "transfer", label: "Transferencia Bancaria", icon: Building2 },
  { id: "cash", label: "Efectivo (al retirar)", icon: Banknote },
];

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
    <div className={styles.form}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <CreditCard size={20} />
          <h3>Método de Pago</h3>
        </div>
        <MagicFillButton onFill={autoFillPayment} />
      </div>

      <div className={styles.methods}>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`${styles.option} ${paymentMethod === method.id ? styles.optionSelected : ""}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={paymentMethod === method.id}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <method.icon size={20} />
            <span>{method.label}</span>
            <div className={styles.radioDot} />
          </label>
        ))}
      </div>

      {paymentMethod === "card" && (
        <div className={styles.cardForm}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label>
                Número de tarjeta <span className={styles.required}>*</span>
              </label>
              <input
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardChange}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </div>
          </div>
          <div className={`${styles.row} ${styles.row3}`}>
            <div className={styles.group}>
              <label>
                Vencimiento <span className={styles.required}>*</span>
              </label>
              <input
                name="cardExpiry"
                value={cardDetails.cardExpiry}
                onChange={handleCardChange}
                placeholder="MM/AA"
                inputMode="numeric"
                autoComplete="cc-exp"
              />
            </div>
            <div className={styles.group}>
              <label>
                CVC <span className={styles.required}>*</span>
              </label>
              <input
                name="cardCvc"
                value={cardDetails.cardCvc}
                onChange={handleCardChange}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
            <div className={styles.group}>
              <label>
                Titular <span className={styles.required}>*</span>
              </label>
              <input
                name="cardHolder"
                value={cardDetails.cardHolder}
                onChange={handleCardChange}
                placeholder="Nombre en la tarjeta"
                autoComplete="cc-name"
              />
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.actions} ${styles.actionsDual}`}>
        <button className={styles.btnSecondary} onClick={goPrev}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <button className={styles.btnPrimary} onClick={goNext}>
          Revisar pedido
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
