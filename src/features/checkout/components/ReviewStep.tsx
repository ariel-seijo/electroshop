"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { PackageOpen, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCart } from "@/features/cart";
import { formatPrice } from "@/lib/utils/currency";
import { useCheckout } from "../context/CheckoutContext";
import styles from "../styles/Review.module.css";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta de Crédito/Débito" },
  { id: "transfer", label: "Transferencia Bancaria" },
  { id: "cash", label: "Efectivo (al retirar)" },
];

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
      setInternalError((err as Error).message);
    }
  }, [placeOrder]);

  const error = internalError || orderError;

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod;

  return (
    <>
      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner} />
          <span className={styles.processingText}>Procesando pago...</span>
        </div>
      )}

      <div className={styles.form}>
        <div className={styles.sectionHeader}>
          <PackageOpen size={20} />
          <h3>Revisá tu Pedido</h3>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.block}>
            <h4>Dirección de envío</h4>
            <p>{shipping.fullName}</p>
            <p>{shipping.address}</p>
            <p>
              {shipping.city}, {shipping.department} - CP {shipping.zip}
            </p>
            <p>{shipping.email}</p>
            {shipping.phone && <p>{shipping.phone}</p>}
            {shipping.notes && (
              <p style={{ color: "rgb(130,130,130)", fontSize: "0.82rem", marginTop: "0.4rem" }}>
                Nota: {shipping.notes}
              </p>
            )}
          </div>

          <div className={styles.block}>
            <h4>Método de pago</h4>
            <p>{paymentLabel}</p>
            {paymentMethod === "card" && (
              <p style={{ color: "rgb(130,130,130)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                {cardDetails.cardNumber} · Vence {cardDetails.cardExpiry} · {cardDetails.cardHolder}
              </p>
            )}
          </div>

          <div className={styles.reviewItems}>
            {cart.map((item) => (
              <div key={item.id} className={styles.reviewItem}>
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={60}
                  height={60}
                />
                <div className={styles.reviewItemInfo}>
                  <span className={styles.reviewItemTitle}>{item.title}</span>
                  <span className={styles.reviewItemQty}>
                    {item.quantity} x {formatPrice(item.price)}
                  </span>
                </div>
                <span className={styles.reviewItemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorText}>{error}</span>
            <button className={styles.retryBtn} onClick={handleConfirm}>
              Reintentar
            </button>
          </div>
        )}

        <div className={`${styles.actions} ${styles.actionsDual}`}>
          <button className={styles.btnSecondary} onClick={goPrev} disabled={isProcessing}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <button
            className={styles.btnConfirm}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} />
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
