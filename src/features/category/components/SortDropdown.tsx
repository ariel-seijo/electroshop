"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildCategoryUrl } from "../utils/buildCategoryUrl";
import { cn } from "@/lib/utils/cn";
import styles from "./SortDropdown.module.css";

const OPTIONS = [
  { label: "Más reciente", value: "recent" },
  { label: "Más vendido", value: "popular" },
  { label: "Mejor valorado", value: "rating" },
  { label: "Menor precio", value: "asc" },
  { label: "Mayor precio", value: "desc" },
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const current = { sort, brand, min, max, view };

  const currentLabel =
    OPTIONS.find((item) => item.value === sort)?.label || "Más reciente";

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  function handleSelect(value: string) {
    close();
    router.push(buildCategoryUrl(name, current, { sort: value }));
  }

  return (
    <div className={styles.sortDropdown} ref={dropdownRef}>
      <span className={styles.sortLabel}>Ordenar por:</span>

      <button
        className={cn(styles.trigger, isOpen && styles.triggerActive)}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentLabel}
        <span className={cn(styles.arrow, isOpen && styles.arrowOpen)} aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {OPTIONS.map((item) => (
            <li key={item.value} role="option" aria-selected={item.value === sort}>
              <button
                className={cn(styles.option, item.value === sort && styles.optionActive)}
                onClick={() => handleSelect(item.value)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
