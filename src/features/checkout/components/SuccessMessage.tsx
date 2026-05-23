"use client";

import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import styles from "../styles/Success.module.css";

interface OrderInfo {
  orderNumber: string;
  id: string;
}

interface SuccessMessageProps {
  email: string;
  order?: OrderInfo;
}

export default function SuccessMessage({ email, order }: SuccessMessageProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <Check size={40} strokeWidth={2} />
      </div>
      <h2>Pedido Confirmado</h2>
      {order && (
        <p className={styles.orderNumber}>
          Pedido <strong>{order.orderNumber}</strong>
        </p>
      )}
      <p>
        Gracias por tu compra. Te enviamos un email con los detalles a{" "}
        <strong>{email}</strong>.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.backLink}>
          Volver a la tienda
        </Link>
        {order && (
          <Link href={`/orders/${order.id}`} className={styles.viewOrderLink}>
            <ShoppingBag size={16} />
            Ver pedido
          </Link>
        )}
      </div>
    </div>
  );
}
