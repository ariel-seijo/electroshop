"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import styles from "./ProductSearch.module.css";

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get("search") || "";

  const [local, setLocal] = useState(urlValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef(urlValue);

  /* Sync local state when URL changes externally (browser back/forward, direct navigation).
     Only syncs when the URL value differs from what we last committed — avoids
     overwriting user input when our own debounced push triggers a re-render.
     committedRef acts as the guard that prevents cascading renders. */
  useEffect(() => {
    if (urlValue !== committedRef.current) {
      committedRef.current = urlValue;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocal(urlValue);
    }
  }, [urlValue]);

  function pushToUrl(v: string) {
    committedRef.current = v;
    const params = new URLSearchParams(searchParams.toString());
    if (v) {
      params.set("search", v);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`, { scroll: false });
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pushToUrl(v);
    }, 300);
  }

  function handleClear() {
    setLocal("");
    if (timerRef.current) clearTimeout(timerRef.current);
    pushToUrl("");
  }

  return (
    <div className={styles.wrapper} role="search">
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder="Buscar por título, SKU o marca…"
        className={styles.input}
        aria-label="Buscar productos"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clear}
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
