import styles from "../styles/BrandSection.module.css";

const brands = [
  "Intel",
  "AMD",
  "NVIDIA",
  "ASUS",
  "MSI",
  "Gigabyte",
  "Corsair",
  "Samsung",
  "Kingston",
  "Logitech",
  "HyperX",
  "Razer",
  "Cooler Master",
  "Western Digital",
  "Seagate",
  "Acer",
];

export default function BrandSection() {
  return (
    <div className={styles.brandsContainer}>
      {brands.map((brand) => (
        <div className={styles.brandBox} key={brand}>
          <h2>{brand.toUpperCase()}</h2>
        </div>
      ))}
    </div>
  );
}
