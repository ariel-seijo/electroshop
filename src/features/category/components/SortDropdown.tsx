"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./SortDropdown.module.css";
import { cn } from "@/lib/utils/cn";
import { buildCategoryUrl } from "../utils/buildCategoryUrl";

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "asc", label: "Precio: menor a mayor" },
  { value: "desc", label: "Precio: mayor a menor" },
  { value: "popular", label: "Más vendidos" },
  { value: "rating", label: "Mejor rating" },
] as const;

interface SortDropdownProps {
  name: string;
  sort: string;
  brand: string;
  min: string;
  max: string;
  view?: string;
}

export default function SortDropdown({ name, sort, brand, min, max, view = "grid" }: SortDropdownProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    router.push(buildCategoryUrl(name, { sort, brand, min, max, view }, { sort: val, page: "1" }));
  };

  return (
    <select value={sort || "recent"} onChange={handleChange} className={styles.select}>
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
