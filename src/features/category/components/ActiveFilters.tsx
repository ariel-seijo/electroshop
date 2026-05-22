import Link from "next/link";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  name: string;
  sort: string;
  brand: string;
  min: string;
  max: string;
}

export default function ActiveFilters({ name, sort, brand, min, max }: ActiveFiltersProps) {
  const hasFilters = sort || brand || min || max;

  if (!hasFilters) return null;

  const buildClearUrl = (remove: Record<string, string>) => {
    const params = new URLSearchParams();
    const keeps: Record<string, string> = { sort, brand, min, max, ...remove };
    if (keeps.sort && keeps.sort !== "recent") params.set("sort", keeps.sort);
    if (keeps.brand) params.set("brand", keeps.brand);
    if (keeps.min) params.set("min", keeps.min);
    if (keeps.max) params.set("max", keeps.max);
    const qs = params.toString();
    return `/category/${name}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {sort && sort !== "recent" && (
        <Link href={buildClearUrl({ sort: "" })} className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">
          {sort === "asc" ? "Precio: menor a mayor" : sort === "desc" ? "Precio: mayor a menor" : sort === "popular" ? "Más vendidos" : "Mejor rating"}
          <X size={12} />
        </Link>
      )}
      {brand && (
        <Link href={buildClearUrl({ brand: "" })} className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">
          {brand}
          <X size={12} />
        </Link>
      )}
      {min && (
        <Link href={buildClearUrl({ min: "" })} className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">
          Min: ${min}
          <X size={12} />
        </Link>
      )}
      {max && (
        <Link href={buildClearUrl({ max: "" })} className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">
          Max: ${max}
          <X size={12} />
        </Link>
      )}
    </div>
  );
}
