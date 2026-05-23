"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activos" },
  { value: "BANNED", label: "Baneados" },
  { value: "DELETED", label: "Eliminados" },
];

const ROLE_OPTIONS = [
  { value: "", label: "Todos los roles" },
  { value: "CUSTOMER", label: "Clientes" },
  { value: "ADMIN", label: "Administradores" },
];

interface UserFiltersProps {
  total?: number;
}

export default function UserFilters({ total }: UserFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramSearch = searchParams.get("search") || "";
  const paramStatus = searchParams.get("status") || "";
  const paramRole = searchParams.get("role") || "";

  const [searchInput, setSearchInput] = useState(paramSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(paramSearch);
  }, [paramSearch]);

  function pushParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`, { scroll: false });
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setSearchInput(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pushParams({ search: v });
    }, 300);
  }

  function handleClearSearch() {
    setSearchInput("");
    if (timerRef.current) clearTimeout(timerRef.current);
    pushParams({ search: "" });
  }

  function handleStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    pushParams({ status: e.target.value });
  }

  function handleRoleChange(e: ChangeEvent<HTMLSelectElement>) {
    pushParams({ role: e.target.value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 pb-3.5 border-b border-[rgb(40,40,40)] max-[640px]:gap-2">
      <div className="relative flex-1 min-w-[220px] max-w-[360px] max-[640px]:min-w-full max-[640px]:max-w-full max-[640px]:basis-full">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(145,145,145)] pointer-events-none w-4 h-4" aria-hidden="true" />
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre o email..."
          className="w-full h-10 pr-3.5 pl-[38px] border border-[rgb(42,42,42)] rounded-md text-[0.82rem] text-[#e4e4e4] bg-[rgb(16,16,16)] transition-colors duration-[0.12s] outline-none placeholder:text-[rgb(72,72,72)] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)]"
          aria-label="Buscar usuarios"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-7 min-h-7 bg-[rgb(16,16,16)] border border-[rgb(42,42,42)] rounded text-[rgb(145,145,145)] cursor-pointer transition-colors duration-[0.12s] hover:text-[#24abf3] hover:border-[#24abf3]"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <select
        value={paramStatus}
        onChange={handleStatusChange}
        className={`h-10 pr-8 pl-3 border border-[rgb(42,42,42)] rounded-md text-[0.82rem] font-semibold text-[#e4e4e4] bg-[rgb(16,16,16)] cursor-pointer appearance-none outline-none min-w-[140px] transition-colors duration-[0.12s] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)] [&_option]:bg-[rgb(16,16,16)] [&_option]:text-[#e4e4e4] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9a9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center] max-[640px]:flex-1 max-[640px]:min-w-0`}
        aria-label="Filtrar por estado"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={paramRole}
        onChange={handleRoleChange}
        className={`h-10 pr-8 pl-3 border border-[rgb(42,42,42)] rounded-md text-[0.82rem] font-semibold text-[#e4e4e4] bg-[rgb(16,16,16)] cursor-pointer appearance-none outline-none min-w-[140px] transition-colors duration-[0.12s] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)] [&_option]:bg-[rgb(16,16,16)] [&_option]:text-[#e4e4e4] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9a9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center] max-[640px]:flex-1 max-[640px]:min-w-0`}
        aria-label="Filtrar por rol"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {total !== undefined && (
        <span className="text-[0.72rem] font-semibold whitespace-nowrap uppercase tracking-[0.5px] text-[rgb(145,145,145)] max-[640px]:basis-full max-[640px]:text-left">
          {total} {total === 1 ? "usuario" : "usuarios"}
        </span>
      )}
    </div>
  );
}
