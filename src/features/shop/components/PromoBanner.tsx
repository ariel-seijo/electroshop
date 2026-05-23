import Link from "next/link";
import { ChevronRight, Zap, Truck, ShieldCheck } from "lucide-react";
import styles from "../styles/PromoBanner.module.css";

export default function PromoBanner() {
  return (
    <section className={styles.promo} aria-labelledby="promo-heading">
      <h2 id="promo-heading" className="visually-hidden">
        Beneficios de comprar con nosotros
      </h2>
      <div className={styles["promo-container"]}>
        <ul className={styles["promo-features"]}>
          <li className={styles["promo-feature"]}>
            <div className={styles["feature-icon"]} aria-hidden="true">
              <Truck size={22} />
            </div>
            <div className={styles["feature-text"]}>
              <span className={styles["feature-title"]}>Envío gratis</span>
              <span className={styles["feature-sub"]}>En compras +$50.000</span>
            </div>
          </li>

          <li className={styles["promo-feature"]}>
            <div className={styles["feature-icon"]} aria-hidden="true">
              <ShieldCheck size={22} />
            </div>
            <div className={styles["feature-text"]}>
              <span className={styles["feature-title"]}>Garantía oficial</span>
              <span className={styles["feature-sub"]}>
                12 meses en todos los productos
              </span>
            </div>
          </li>

          <li className={styles["promo-feature"]}>
            <div className={styles["feature-icon"]} aria-hidden="true">
              <Zap size={22} />
            </div>
            <div className={styles["feature-text"]}>
              <span className={styles["feature-title"]}>Envío rápido</span>
              <span className={styles["feature-sub"]}>
                Despacho en 24hs hábiles
              </span>
            </div>
          </li>
        </ul>

        <div className={styles["promo-cta"]}>
          <div className={styles["promo-cta-content"]}>
            <h3>¿Listo para armar tu PC gamer?</h3>
            <p>
              Encontrá los mejores componentes con los precios más competitivos
              del mercado.
            </p>
          </div>

          <Link
            href="/category/gpu"
            className={styles["promo-cta-btn"]}
            aria-label="Ver todos los componentes gaming"
          >
            Ver componentes
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
