"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import styles from "./ViewSwitcher.module.css";

const STORAGE_KEY = "productView";

function persist(view: string) {
  localStorage.setItem(STORAGE_KEY, view);
  document.cookie = `${STORAGE_KEY}=${view}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function buildUrl(pathname: string, searchParams: URLSearchParams, newView: string) {
  const params = new URLSearchParams(searchParams.toString());
  if (newView === "grid") {
    params.delete("view");
  } else {
    params.set("view", newView);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

interface ViewSwitcherProps {
  resolvedView?: string;
}

export default function ViewSwitcher({ resolvedView = "grid" }: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeView = searchParams.get("view") || resolvedView;

  function handleToggle(newView: string) {
    persist(newView);
    router.replace(buildUrl(pathname, searchParams, newView), { scroll: false });
  }

  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Vista de productos">
      <button
        onClick={() => handleToggle("grid")}
        className={`${styles.btn} ${activeView === "grid" ? styles.active : ""}`}
        role="radio"
        aria-checked={activeView === "grid"}
        aria-label="Vista en cuadrícula"
      >
        <LayoutGrid size={16} aria-hidden="true" />
      </button>
      <button
        onClick={() => handleToggle("list")}
        className={`${styles.btn} ${activeView === "list" ? styles.active : ""}`}
        role="radio"
        aria-checked={activeView === "list"}
        aria-label="Vista en lista"
      >
        <List size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
