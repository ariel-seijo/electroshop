"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get("search") || "";

  const [local, setLocal] = useState(urlValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef(urlValue);

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
    <div className="relative flex items-center mb-4" role="search">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)] pointer-events-none" aria-hidden="true" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder="Buscar por título, SKU o marca…"
        className="w-full h-11 pr-14 pl-[38px] border border-[rgb(42,42,42)] rounded-md text-[0.82rem] text-[#e4e4e4] bg-[rgb(16,16,16)] transition-colors duration-[0.12s] outline-none placeholder:text-[rgb(72,72,72)] focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.08)]"
        aria-label="Buscar productos"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-10 min-h-10 bg-[rgb(16,16,16)] border border-[rgb(42,42,42)] rounded-md text-[rgb(145,145,145)] cursor-pointer transition-colors duration-[0.12s] hover:text-[#24abf3] hover:border-[#24abf3]"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
