"use client";

import Image from "next/image";
import { useCart } from "@/features/cart";
import styles from "../styles/OrderSummary.module.css";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";

export default function OrderSummary() {
  const { cart } = useCart();

  const subtotal = cart.reduce((acc: number, item) => acc + item.price * item.quantity, 0);
  const subtotalArs = usdToArs(subtotal);
  const shippingCost = subtotalArs >= 50000 ? 0 : 1500;
  const totalArs = subtotalArs + shippingCost;

  return (
    <div className={styles.summary}>
      <h3>Resumen de Compra</h3>

      <ul className={styles.items}>
        {cart.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.itemImg}>
              <Image src={item.thumbnail} alt={item.title} width={48} height={48} />
              <span className={styles.qtyBadge}>{item.quantity}</span>
            </div>
            <div className={styles.itemInfo}>
              <span className={styles.itemTitle}>{item.title}</span>
            </div>
            <span className={styles.itemPrice}>
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className={styles.row}>
        <span>Envío</span>
        <span className={shippingCost === 0 ? styles.freeShipping : ""}>
          {shippingCost === 0 ? "GRATIS" : formatArs(shippingCost)}
        </span>
      </div>

      {shippingCost > 0 && (
        <p className={styles.hint}>¡Envío gratis en compras superiores a {formatArs(50000)}!</p>
      )}

      <div className={styles.divider} />

      <div className={`${styles.row} ${styles.total}`}>
        <span>Total</span>
        <span>{formatArs(totalArs)}</span>
      </div>
    </div>
  );
}
