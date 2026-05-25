"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildCategoryUrl } from "../utils/buildCategoryUrl";
import { cn } from "@/lib/utils/cn";

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
    <div className="flex items-center gap-[0.6rem] relative max-3lg:w-full max-3lg:justify-between" ref={dropdownRef}>
      <span className="text-text-dim text-[0.82rem] font-semibold whitespace-nowrap">Ordenar por:</span>

      <button
        className={cn(
          "flex items-center justify-between gap-2 min-w-[160px] bg-surface-18 border border-border-44 text-text-secondary px-4 py-[0.6rem] text-[0.82rem] font-semibold cursor-pointer transition-colors duration-200 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 max-3lg:flex-1 max-3lg:w-full",
          isOpen && "border-accent"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentLabel}
        <span className={cn("text-[0.7rem] transition-transform duration-200 text-text-dim", isOpen && "rotate-180")} aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-[calc(100%+8px)] min-w-[200px] bg-surface-18 border border-border-44 list-none m-0 p-0 z-20 shadow-[0_12px_30px_rgba(0,0,0,0.5)] animate-menu-in max-3lg:left-0 max-3lg:right-auto max-3lg:w-full" role="listbox">
          {OPTIONS.map((item) => (
            <li key={item.value} role="option" aria-selected={item.value === sort}>
              <button
                className={cn(
                  "block w-full px-4 py-3 bg-transparent border-none text-[rgb(190,190,190)] text-[0.85rem] font-semibold text-left cursor-pointer transition-all duration-200 hover:bg-surface-30 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]",
                  item.value === sort && "text-accent bg-accent/5"
                )}
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
