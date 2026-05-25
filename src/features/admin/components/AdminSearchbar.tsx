"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

type Scope = "orders" | "users" | "products";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "orders", label: "Órdenes" }, { value: "users", label: "Usuarios" }, { value: "products", label: "Productos" },
];

const PLACEHOLDERS: Record<Scope, string> = { orders: "Buscar órdenes...", users: "Buscar usuarios...", products: "Buscar productos..." };
const SCOPE_LABELS: Record<Scope, string> = { orders: "órdenes", users: "usuarios", products: "productos" };

export default function AdminSearchbar() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("orders");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) close(); }
    function handleEscape(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscape); document.body.style.overflow = ""; };
  }, [expanded, close]);

  useEffect(() => { if (expanded && inputRef.current) { const timer = setTimeout(() => inputRef.current?.focus(), 180); return () => clearTimeout(timer); } }, [expanded]);

  const handleToggle = () => setExpanded((prev) => !prev);
  const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (!query.trim()) return; router.push(`/admin/${scope}?search=${encodeURIComponent(query.trim())}`); setExpanded(false); };

  const scopeBtn = "bg-transparent border-none text-text-placeholder text-[0.65rem] font-semibold px-2 py-[3px] rounded uppercase tracking-[0.3px] cursor-pointer whitespace-nowrap transition-all duration-[150ms] min-h-7 hover:text-text-0";
  const scopeActive = "bg-accent/18 text-accent";

  return (
    <div className="relative" ref={containerRef}>
      <form className="flex items-center gap-1 max-xl:hidden" onSubmit={handleSubmit}>
        <div className="flex items-center gap-1.5 bg-surface-16 border border-white/5 rounded-md px-2.5 h-9 transition-colors duration-200 focus-within:border-white/10">
          <Search size={16} className="text-text-placeholder shrink-0" />
          <input type="text" value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder={PLACEHOLDERS[scope]} className="bg-transparent border-none outline-none text-text-0 text-[0.78rem] w-[160px] placeholder:text-[rgb(100,100,100)]" aria-label={`Buscar en ${SCOPE_LABELS[scope]}`} />
        </div>
        <div className="flex gap-0.5 bg-surface-16 border border-white/5 rounded-md p-0.5">
          {SCOPES.map((s) => (
            <button key={s.value} type="button" className={`${scopeBtn} ${scope === s.value ? scopeActive : ""}`} onClick={() => setScope(s.value)}>{s.label}</button>
          ))}
        </div>
      </form>

      <button type="button" className="hidden max-xl:flex max-xl:items-center max-xl:justify-center max-xl:min-w-11 max-xl:min-h-11 max-xl:bg-transparent max-xl:border max-xl:border-white/5 max-xl:rounded-md max-xl:text-text-muted max-xl:cursor-pointer max-xl:transition-all max-xl:duration-[150ms] max-xl:hover:text-text-0 max-xl:hover:border-white/10 max-xl:hover:bg-white/[0.03]" onClick={handleToggle} aria-label={expanded ? "Cerrar búsqueda" : "Abrir búsqueda"} aria-expanded={expanded}>
        {expanded ? <X size={20} /> : <Search size={20} />}
      </button>

      {expanded && (
        <>
          <div className="hidden max-xl:block max-xl:fixed max-xl:top-[var(--admin-header-height,56px)] max-xl:left-0 max-xl:right-0 max-xl:bottom-0 max-xl:z-[31] max-xl:bg-black/55 max-xl:backdrop-blur max-xl:[-webkit-backdrop-filter:blur(4px)] max-xl:animate-[fadeBackdrop_0.2s_ease-out] max-xl:motion-reduce:animate-none" onClick={close} aria-hidden="true" />

          <div className="hidden max-xl:block max-xl:fixed max-xl:top-[var(--admin-header-height,56px)] max-xl:left-0 max-xl:right-0 max-xl:z-32 max-xl:bg-surface-14 max-xl:border-b max-xl:border-white/5 max-xl:shadow-[0_16px_40px_rgba(0,0,0,0.7)] max-xl:animate-[slideDown_0.22s_cubic-bezier(0.4,0,0.2,1)] max-xl:motion-reduce:animate-none max-xl:max-h-[calc(100vh-var(--admin-header-height,56px))] max-xl:overflow-y-auto" role="dialog" aria-label="Buscar">
            <div className="flex items-center justify-between px-4 py-[14px] border-b border-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.8px] text-accent">Buscar</span>
              <button type="button" className="flex items-center justify-center size-8 border border-white/10 bg-transparent text-text-muted rounded-md cursor-pointer transition-all duration-[150ms] hover:text-white hover:border-white/15 hover:bg-white/5" onClick={close} aria-label="Cerrar búsqueda"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px] px-4 py-[14px]">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-[14px] text-[rgb(100,100,100)] pointer-events-none" />
                <input ref={inputRef} type="text" value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder={PLACEHOLDERS[scope]} className="w-full h-12 pl-[42px] pr-[14px] bg-surface-12 border border-white/10 rounded-lg text-text-0 text-[0.9rem] outline-none transition-colors duration-200 focus:border-accent placeholder:text-[rgb(80,80,80)] placeholder:font-semibold" aria-label={`Buscar en ${SCOPE_LABELS[scope]}`} autoComplete="off" />
              </div>

              <div className="flex gap-2">
                {SCOPES.map((s) => (
                  <button key={s.value} type="button" className={`flex-1 px-3 py-2.5 bg-surface-18 border border-white/5 rounded-md text-text-dim text-[0.72rem] font-semibold uppercase tracking-[0.4px] cursor-pointer transition-all duration-[150ms] min-h-[42px] hover:text-text-0 hover:border-white/10 ${scope === s.value ? "bg-accent/14 border-accent/35 text-accent" : ""}`} onClick={() => setScope(s.value)}>{s.label}</button>
                ))}
              </div>

              <button type="submit" className="flex items-center justify-center w-full h-[46px] bg-brand text-white border-none rounded-lg text-[0.88rem] font-semibold tracking-[0.5px] cursor-pointer transition-all duration-[150ms] hover:not-disabled:bg-brand-hover hover:not-disabled:shadow-[0_4px_16px_rgba(0,127,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed" disabled={!query.trim()}>Buscar</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
