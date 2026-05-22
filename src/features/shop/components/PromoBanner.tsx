import Link from "next/link";
import { ChevronRight, Zap, Truck, ShieldCheck } from "lucide-react";
import styles from "../styles/PromoBanner.module.css";

export default function PromoBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.item}>
          <Zap size={20} />
          <div>
            <strong>Envío express</strong>
            <span>En CABA y GBA en 24hs</span>
          </div>
        </div>
        <div className={styles.item}>
          <Truck size={20} />
          <div>
            <strong>Envío gratis</strong>
            <span>Compras superiores a $50.000</span>
          </div>
        </div>
        <div className={styles.item}>
          <ShieldCheck size={20} />
          <div>
            <strong>12 meses de garantía</strong>
            <span>En todos los productos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
