import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerColumn}>
            <h4>Atención al Cliente</h4>
            <ul>
              <li>Centro de ayuda</li>
              <li>Seguimiento de pedidos</li>
              <li>Medios de pago</li>
              <li>Garantías</li>
              <li>Devoluciones</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Categorías</h4>
            <ul>
              <li>Placas de video</li>
              <li>Procesadores</li>
              <li>Memorias RAM</li>
              <li>Almacenamiento</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Empresa</h4>
            <ul>
              <li>Nosotros</li>
              <li>Trabajá con nosotros</li>
              <li>Términos y condiciones</li>
              <li>Privacidad</li>
              <li>Blog tech</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Sucursal</h4>
            <ul>
              <li>Av. Rivadavia 15420</li>
              <li>San Justo, Buenos Aires</li>
              <li>Argentina</li>
              <li>Lun a Sáb 10:00 a 19:00</li>
              <li>+54 11 4587-2214</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Tecnologías</h4>
            <ul>
              <li>Next.js</li>
              <li>React</li>
              <li>Prisma ORM</li>
              <li>PostgreSQL</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} ElectroShop. Todos los derechos reservados.</p>

          <p>
            Desarrollado por{" "}
            <a
              href="https://www.linkedin.com/in/arielseijo/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ariel Seijo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
