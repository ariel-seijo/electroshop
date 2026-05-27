"use client";

import type { Category } from "@/types/category";

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
    <div className="flex flex-wrap gap-x-6 gap-y-3 items-end mb-[18px] pb-3.5 border-b border-[rgb(40,40,40)] max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
      <select
        value={categoryId}
        onChange={(e) => onChange("categoryId", e.target.value)}
        className={`h-10 pr-8 pl-3 border border-[rgb(42,42,42)] rounded-md text-[0.82rem] font-semibold text-[#e4e4e4] bg-[rgb(16,16,16)] cursor-pointer appearance-none outline-none min-w-[140px] transition-colors duration-[0.12s] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)] [&_option]:bg-[rgb(16,16,16)] [&_option]:text-[#e4e4e4] max-[640px]:w-full max-[640px]:min-w-0 bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9a9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center]`}
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="flex gap-1 h-10 max-[640px]:flex-wrap max-[640px]:h-auto">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`inline-flex items-center gap-[5px] px-3.5 h-10 border rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.12s] whitespace-nowrap hover:border-[rgba(36,171,243,0.25)] hover:text-[#e4e4e4] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 ${status === opt.value ? "bg-[rgba(36,171,243,0.1)] border-[#24abf3] text-[#24abf3] shadow-[0_0_8px_rgba(36,171,243,0.15)]" : "bg-[rgb(16,16,16)] border-[rgb(42,42,42)] text-[rgb(145,145,145)]"}`}
            onClick={() => onChange("status", opt.value)}
            aria-pressed={status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`inline-flex items-center gap-[5px] px-3.5 h-10 border rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.12s] whitespace-nowrap hover:border-[rgba(36,171,243,0.25)] hover:text-[#e4e4e4] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 ${featured === "true" ? "bg-[rgba(36,171,243,0.1)] border-[#24abf3] text-[#24abf3] shadow-[0_0_8px_rgba(36,171,243,0.15)]" : "bg-[rgb(16,16,16)] border-[rgb(42,42,42)] text-[rgb(145,145,145)]"}`}
        onClick={() => onChange("featured", featured === "true" ? "" : "true")}
        aria-pressed={featured === "true"}
      >
        Destacados
      </button>

      <div className="flex gap-1.5 items-center h-10">
        <select
          value={sort}
          onChange={(e) => onChange("sort", e.target.value)}
          className={`min-w-[150px] max-[640px]:w-full max-[640px]:min-w-0 h-10 pr-8 pl-3 border border-[rgb(42,42,42)] rounded-md text-[0.82rem] font-semibold text-[#e4e4e4] bg-[rgb(16,16,16)] cursor-pointer appearance-none outline-none transition-colors duration-[0.12s] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)] [&_option]:bg-[rgb(16,16,16)] [&_option]:text-[#e4e4e4] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9a9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center]`}
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
          className="inline-flex items-center justify-center w-10 h-10 shrink-0 bg-[rgb(16,16,16)] border border-[rgb(42,42,42)] rounded-md text-[rgb(145,145,145)] cursor-pointer transition-all duration-[0.12s] hover:border-[#24abf3] hover:text-[#24abf3]"
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
