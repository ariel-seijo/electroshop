"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { buildCategoryUrl } from "../utils/buildCategoryUrl";
import { cn } from "@/lib/utils/cn";

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

const sortLabels: Record<string, string> = {
  asc: "Menor precio",
  desc: "Mayor precio",
  popular: "Más vendidos",
  rating: "Mejor valorados",
};

const filterTitle = "text-[0.72rem] font-semibold uppercase tracking-[1.5px] text-text-dim";

const selectedTag =
  "bg-accent/10 border border-accent/30 text-accent text-xs font-semibold px-[0.65rem] py-[0.35rem] no-underline transition-all duration-200 hover:bg-accent/18 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const brandLinkBase =
  "no-underline text-text-tertiary px-3 py-[0.65rem] text-[0.88rem] font-semibold border border-transparent transition-all duration-200 hover:bg-surface-30 hover:text-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1";

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
  const [isOpen, setIsOpen] = useState(false);
  const [minInput, setMinInput] = useState(min || "");
  const [maxInput, setMaxInput] = useState(max || "");
  const drawerRef = useRef<HTMLDivElement>(null);

  const current = { sort, brand, min, max, view };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const timer = setTimeout(() => {
        const el = drawerRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement | null;
        el?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filterGroups = (
    <>
      <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
        <span className={filterTitle}>Seleccionados</span>

        <div className="flex flex-wrap gap-2">
          {sort !== "recent" && (
            <Link
              href={buildCategoryUrl(name, current, { sort: "recent" })}
              className={selectedTag}
            >
              {sortLabels[sort]} ✕
            </Link>
          )}

          {brand && (
            <Link
              href={buildCategoryUrl(name, current, { brand: "" })}
              className={selectedTag}
            >
              {brand} ✕
            </Link>
          )}

          {(min || max) && (
            <Link
              href={buildCategoryUrl(name, current, { min: "", max: "" })}
              className={selectedTag}
            >
              ${min || minPrice} - ${max || maxPrice} ✕
            </Link>
          )}

          {!brand && sort === "recent" && !min && !max && (
            <span className="text-[rgb(100,100,100)] text-[0.82rem] font-semibold">Sin filtros</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
        <span className={filterTitle}>Precio</span>

        <form action={`/category/${name}`} method="GET" className="flex flex-col gap-[0.8rem]">
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="brand" value={brand} />
          {view !== "grid" && <input type="hidden" name="view" value={view} />}

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="flex flex-col gap-[0.35rem]">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[1px] text-text-dim">Mín</span>
              <input
                type="number"
                name="min"
                min="0"
                max={maxPrice}
                step="1"
                placeholder="0"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                onBlur={() => { if (minInput === "") return; const val = Number(minInput); if (val < 0) setMinInput("0"); }}
                className="w-full px-[0.7rem] py-[0.6rem] bg-surface-18 border border-border-44 text-text-secondary text-[0.85rem] font-semibold [appearance:textfield] transition-colors duration-200 hover:border-[rgb(70,70,70)] focus:outline-none focus:border-accent placeholder:text-[rgb(100,100,100)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
              />
            </label>
            <span className="text-[rgb(100,100,100)] font-semibold pb-[0.6rem]">—</span>
            <label className="flex flex-col gap-[0.35rem]">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[1px] text-text-dim">Máx</span>
              <input
                type="number"
                name="max"
                min="0"
                max={maxPrice}
                step="1"
                placeholder={String(maxPrice)}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                onBlur={() => { if (maxInput === "") return; const val = Number(maxInput); if (val > maxPrice) setMaxInput(String(maxPrice)); if (val < 0) setMaxInput("0"); }}
                className="w-full px-[0.7rem] py-[0.6rem] bg-surface-18 border border-border-44 text-text-secondary text-[0.85rem] font-semibold [appearance:textfield] transition-colors duration-200 hover:border-[rgb(70,70,70)] focus:outline-none focus:border-accent placeholder:text-[rgb(100,100,100)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
              />
            </label>
          </div>

          <button type="submit" className="border-none bg-accent text-[#111] px-[0.7rem] py-[0.7rem] cursor-pointer font-semibold text-[0.8rem] uppercase tracking-[0.5px] transition-all duration-[250ms] hover:bg-accent-hover hover:shadow-[0_0_16px_rgba(36,171,243,0.25)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">Aplicar</button>
        </form>
      </div>

      <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
        <span className={filterTitle}>Marca</span>

        {brands.map((item) => (
          <Link
            key={item.brand}
            href={buildCategoryUrl(name, current, { brand: item.brand })}
            className={cn(brandLinkBase, brand === item.brand && "bg-accent/10 border-accent/30 text-accent")}
          >
            {item.brand}
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <>
      <button
        className="flex items-center justify-center gap-2 w-full px-4 py-[0.85rem] bg-surface-22 border border-border-34 text-text-secondary text-[0.9rem] font-semibold cursor-pointer mb-4 transition-[background,border-color,color] duration-200 hover:bg-surface-28 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 [&>svg]:shrink-0 ms:px-[1.25rem] ms:py-[0.9rem] ms:text-[0.92rem] [&>svg]:ms:w-5 [&>svg]:ms:h-5 md:hidden"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="filter-drawer"
      >
        <SlidersHorizontal size={18} />
        Filtros
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[2000] animate-fade-in md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className="hidden md:flex md:flex-col md:gap-6 md:bg-surface-22 md:border md:border-border-34 md:p-6 md:sticky md:top-[100px]">
        {filterGroups}
      </aside>

      <div
        id="filter-drawer"
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 bottom-[60px] w-[320px] max-w-[85vw] bg-surface-16 border-l border-border-34 z-[2001] flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden max-ms:bottom-14",
          isOpen ? "translate-x-0" : "translate-x-[105%]"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de productos"
      >
        <div className="flex items-center justify-between px-5 py-5 pb-4 border-b border-[rgb(30,30,30)] shrink-0">
          <span className="text-base font-semibold text-[rgb(220,220,220)] uppercase tracking-[1px]">Filtros</span>
          <button
            className="flex items-center justify-center size-9 bg-transparent border border-border-44 text-text-muted cursor-pointer transition-[color,border-color] duration-200 hover:text-danger hover:border-danger/40 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar filtros"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">{filterGroups}</div>

        <button
          className="flex items-center justify-center w-[calc(100%-2.5rem)] mx-5 mb-5 py-[0.9rem] bg-accent text-[#111] border-none text-[0.9rem] font-semibold uppercase tracking-[0.5px] cursor-pointer shrink-0 transition-[background,box-shadow] duration-[250ms] hover:bg-accent-hover hover:shadow-[0_0_18px_rgba(36,171,243,0.3)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          onClick={() => setIsOpen(false)}
        >
          Ver resultados
        </button>
      </div>
    </>
  );
}
