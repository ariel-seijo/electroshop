"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import styles from "./AdminSearchbar.module.css";

type Scope = "orders" | "users" | "products";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "orders", label: "Órdenes" },
  { value: "users", label: "Usuarios" },
  { value: "products", label: "Productos" },
];

const PLACEHOLDERS: Record<Scope, string> = {
  orders: "Buscar órdenes...",
  users: "Buscar usuarios...",
  products: "Buscar productos...",
};

const SCOPE_LABELS: Record<Scope, string> = {
  orders: "órdenes",
  users: "usuarios",
  products: "productos",
};

export default function AdminSearchbar() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("orders");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => setExpanded(false), []);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setExpanded(false);
    setPrevPathname(pathname);
  }

  useEffect(() => {
    if (!expanded) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [expanded, close]);

  useEffect(() => {
    if (expanded && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/admin/${scope}?search=${encodeURIComponent(query.trim())}`);
    setExpanded(false);
  };

  return (
    <div className={styles.searchbar} ref={containerRef}>
      <form className={styles.desktopForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[scope]}
            className={styles.input}
            aria-label={`Buscar en ${SCOPE_LABELS[scope]}`}
          />
        </div>
        <div className={styles.scopeToggle}>
          {SCOPES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`${styles.scopeBtn} ${scope === s.value ? styles.scopeActive : ""}`}
              onClick={() => setScope(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>

      <button
        type="button"
        className={styles.mobileToggle}
        onClick={handleToggle}
        aria-label={expanded ? "Cerrar búsqueda" : "Abrir búsqueda"}
        aria-expanded={expanded}
      >
        {expanded ? <X size={20} /> : <Search size={20} />}
      </button>

      {expanded && (
        <>
          <div
            className={styles.backdrop}
            onClick={close}
            aria-hidden="true"
          />

          <div className={styles.mobilePanel} role="dialog" aria-label="Buscar">
            <div className={styles.mobilePanelHeader}>
              <span>Buscar</span>
              <button
                type="button"
                className={styles.mobilePanelClose}
                onClick={close}
                aria-label="Cerrar búsqueda"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.mobilePanelForm}>
              <div className={styles.mobileInputWrap}>
                <Search size={16} className={styles.mobileSearchIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  placeholder={PLACEHOLDERS[scope]}
                  className={styles.mobileInput}
                  aria-label={`Buscar en ${SCOPE_LABELS[scope]}`}
                  autoComplete="off"
                />
              </div>

              <div className={styles.mobileScopeToggle}>
                {SCOPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`${styles.mobileScopeBtn} ${scope === s.value ? styles.mobileScopeActive : ""}`}
                    onClick={() => setScope(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className={styles.mobileSubmitBtn}
                disabled={!query.trim()}
              >
                Buscar
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
