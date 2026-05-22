import styles from "../styles/BrandSection.module.css";

export default function Brands() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Marcas</h2>
      <div className={styles.grid}>
        {["NVIDIA", "AMD", "INTEL", "CORSAIR", "KINGSTON", "SEAGATE"].map((brand) => (
          <div key={brand} className={styles.brand}>
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
