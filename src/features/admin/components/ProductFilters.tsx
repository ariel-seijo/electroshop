"use client";

import styles from "./ProductFilters.module.css";

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  categoryId: string;
  status: string;
  featured: string;
  sort: string;
  order: "asc" | "desc";
  onChange: (key: string, value: string) => void;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "createdAt", label: "Fecha" },
  { value: "price", label: "Precio" },
  { value: "stock", label: "Inventario" },
  { value: "sold", label: "Vendidos" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function ProductFilters({
  categories,
  categoryId,
  status,
  featured,
  sort,
  order,
  onChange,
}: ProductFiltersProps) {
  return (
    <div className={styles.bar}>
      <select
        value={categoryId}
        onChange={(e) => onChange("categoryId", e.target.value)}
        className={styles.select}
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className={styles.pills}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.pill} ${status === opt.value ? styles.pillActive : ""}`}
            onClick={() => onChange("status", opt.value)}
            aria-pressed={status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.pill} ${featured === "true" ? styles.pillActive : ""}`}
        onClick={() => onChange("featured", featured === "true" ? "" : "true")}
        aria-pressed={featured === "true"}
      >
        Destacados
      </button>

      <div className={styles.sortRow}>
        <select
          value={sort}
          onChange={(e) => onChange("sort", e.target.value)}
          className={styles.select}
          aria-label="Ordenar por"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.orderBtn}
          onClick={() => onChange("order", order === "asc" ? "desc" : "asc")}
          aria-label={`Orden ${order === "asc" ? "descendente" : "ascendente"}`}
          title={`Orden ${order === "asc" ? "descendente" : "ascendente"}`}
        >
          {order === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}
