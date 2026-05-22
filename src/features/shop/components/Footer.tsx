import styles from "../styles/Footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>ELECTROSHOP</span>
          <p className={styles.tagline}>Tecnología de alto rendimiento</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Tienda</h4>
            <Link href="/">Inicio</Link>
            <Link href="/category/gpu">GPUs</Link>
            <Link href="/category/cpu">CPUs</Link>
          </div>
          <div className={styles.col}>
            <h4>Soporte</h4>
            <Link href="/">Contacto</Link>
            <Link href="/">Garantía</Link>
          </div>
        </div>
        <div className={styles.copy}>
          &copy; {new Date().getFullYear()} ElectroShop. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
