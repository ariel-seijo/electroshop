"use client";

import Link from "next/link";
import styles from "./FiltersSidebar.module.css";
import { cn } from "@/lib/utils/cn";
import { buildCategoryUrl } from "../utils/buildCategoryUrl";

interface FiltersSidebarProps {
  name: string;
  brands: { brand: string }[];
  sort: string;
  brand: string;
  min: string;
  max: string;
  minPrice: number;
  maxPrice: number;
  view?: string;
}

export default function FiltersSidebar({
  name,
  brands,
  sort,
  brand,
  min,
  max,
  minPrice,
  maxPrice,
  view = "grid",
}: FiltersSidebarProps) {
  const baseParams = { sort, brand, min, max, view };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Filtros</h3>

      {brands.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Marcas</h4>
          <ul className={styles.brandList}>
            <li>
              <Link
                href={`/category/${name}`}
                className={cn(styles.brandLink, !brand && styles.active)}
              >
                Todas
              </Link>
            </li>
            {brands.map((b) => (
              <li key={b.brand}>
                <Link
                  href={buildCategoryUrl(name, baseParams, { brand: b.brand, page: "1" })}
                  className={cn(styles.brandLink, brand === b.brand && styles.active)}
                >
                  {b.brand}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {minPrice < maxPrice && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Precio</h4>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder={`${minPrice}`}
              defaultValue={min}
              className={styles.priceInput}
              onBlur={(e) => {
                const val = e.target.value;
                if (val) {
                  window.location.href = buildCategoryUrl(name, baseParams, { min: val, page: "1" });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) {
                    window.location.href = buildCategoryUrl(name, baseParams, { min: val, page: "1" });
                  }
                }
              }}
            />
            <span className={styles.priceDash}>-</span>
            <input
              type="number"
              placeholder={`${maxPrice}`}
              defaultValue={max}
              className={styles.priceInput}
              onBlur={(e) => {
                const val = e.target.value;
                if (val) {
                  window.location.href = buildCategoryUrl(name, baseParams, { max: val, page: "1" });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) {
                    window.location.href = buildCategoryUrl(name, baseParams, { max: val, page: "1" });
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
