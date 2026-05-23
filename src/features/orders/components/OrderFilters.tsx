"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagados" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

const inputStyle = "h-10 bg-surface-16 border border-border-42 text-text-0 text-[0.82rem] outline-none transition-[border-color,box-shadow] duration-[200ms] focus:border-accent focus:shadow-[0_0_10px_rgba(36,171,243,0.08)]";

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const [localFrom, setLocalFrom] = useState(dateFrom);
  const [localTo, setLocalTo] = useState(dateTo);

  useEffect(() => { setLocalFrom(dateFrom); setLocalTo(dateTo); }, [dateFrom, dateTo]);

  const datesDirty = localFrom !== dateFrom || localTo !== dateTo;
  const hasFilters = status || search || dateFrom || dateTo;

  const pushParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => { if (value) params.set(key, value); else params.delete(key); });
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  function handleSearch(e: FormEvent) { e.preventDefault(); const value = searchRef.current?.value?.trim() || ""; pushParams({ search: value || "" }); }
  function handleApplyDates() { pushParams({ dateFrom: localFrom, dateTo: localTo }); }
  function handleClear() { setLocalFrom(""); setLocalTo(""); router.push("/admin/orders", { scroll: false }); if (searchRef.current) searchRef.current.value = ""; }

  const chipBase = "inline-block px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-[12px] text-[0.7rem] font-semibold text-text-tertiary";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 flex-wrap max-md:flex-col">
        <form className="flex items-center bg-surface-16 border border-border-42 rounded-md overflow-hidden flex-1 min-w-[240px] max-w-[420px] transition-[border-color,box-shadow] duration-[200ms] focus-within:border-accent focus-within:shadow-[0_0_10px_rgba(36,171,243,0.08)] max-md:max-w-full" onSubmit={handleSearch} role="search">
          <Search size={16} className="ml-3 text-text-muted shrink-0" aria-hidden="true" />
          <input ref={searchRef} type="text" defaultValue={search} placeholder="Buscar por #orden o email..." className={`flex-1 bg-transparent border-none px-3 py-[9px] text-text-0 text-[0.82rem] outline-none h-10 placeholder:text-[rgb(100,100,100)]`} aria-label="Buscar pedidos por número de orden o email" />
          <button type="submit" className="px-4 py-[9px] bg-accent/10 border-none text-accent text-xs font-semibold cursor-pointer transition-colors duration-[200ms] hover:bg-accent/15">Buscar</button>
        </form>

        <select value={status} onChange={(e) => pushParams({ status: e.target.value })} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9a9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }} className={`${inputStyle} rounded-md px-3 py-[9px] font-semibold text-[0.78rem] cursor-pointer min-w-[150px] [appearance:none] [&>option]:bg-surface-16 [&>option]:text-text-0 max-md:w-full max-md:min-w-0`} aria-label="Filtrar por estado">
          {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <div className="flex items-center gap-1.5 max-md:w-full max-md:flex-wrap">
          <input type="date" value={localFrom} onChange={(e) => setLocalFrom(e.target.value)} className={`${inputStyle} rounded-md px-2.5 py-2 text-[0.78rem] w-[140px] [&::-webkit-calendar-picker-indicator]:[filter:invert(0.7)] [&::-webkit-calendar-picker-indicator]:cursor-pointer max-md:flex-1 max-md:min-w-0`} aria-label="Fecha desde" />
          <span className="text-text-muted text-[0.8rem]">-</span>
          <input type="date" value={localTo} onChange={(e) => setLocalTo(e.target.value)} className={`${inputStyle} rounded-md px-2.5 py-2 text-[0.78rem] w-[140px] [&::-webkit-calendar-picker-indicator]:[filter:invert(0.7)] [&::-webkit-calendar-picker-indicator]:cursor-pointer max-md:flex-1 max-md:min-w-0`} aria-label="Fecha hasta" />
          {datesDirty && (
            <button type="button" onClick={handleApplyDates} className="inline-flex items-center gap-1 px-3 py-2 bg-accent/10 border border-accent/25 rounded-md text-accent text-[0.73rem] font-semibold cursor-pointer transition-all duration-[200ms] whitespace-nowrap hover:bg-accent/16 hover:border-accent/35">
              <Check size={14} />Aplicar
            </button>
          )}
        </div>

        {hasFilters && (
          <button type="button" onClick={handleClear} className="inline-flex items-center gap-1 px-[14px] py-[9px] bg-danger/5 border border-danger/15 rounded-md text-danger-light text-xs font-semibold cursor-pointer transition-all duration-[200ms] hover:bg-danger/10 hover:border-danger/30 max-md:w-full max-md:justify-center">
            <X size={14} />Limpiar filtros
          </button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mt-2.5 px-3 py-2 bg-accent/3 border border-accent/5 rounded-md text-text-muted text-[0.72rem] flex-wrap" aria-live="polite">
          <Filter size={12} aria-hidden="true" />
          <span className="font-semibold text-text-muted mr-0.5">Filtros activos:</span>
          {status && <span className={chipBase}>{STATUS_OPTIONS.find((o) => o.value === status)?.label || status}</span>}
          {search && <span className={chipBase}>Buscar: {search}</span>}
          {dateFrom && <span className={chipBase}>Desde: {dateFrom}</span>}
          {dateTo && <span className={chipBase}>Hasta: {dateTo}</span>}
        </div>
      )}
    </div>
  );
}
