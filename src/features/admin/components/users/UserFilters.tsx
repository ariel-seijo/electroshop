"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import styles from "./UserFilters.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activos" },
  { value: "BANNED", label: "Baneados" },
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
    <div className={styles.filtersRow}>
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre o email..."
          className={styles.searchInput}
          aria-label="Buscar usuarios"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className={styles.clearBtn}
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <select
        value={paramStatus}
        onChange={handleStatusChange}
        className={styles.filterSelect}
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
        className={styles.filterSelect}
        aria-label="Filtrar por rol"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {total !== undefined && (
        <span className={styles.resultCount}>
          {total} {total === 1 ? "usuario" : "usuarios"}
        </span>
      )}
    </div>
  );
}
