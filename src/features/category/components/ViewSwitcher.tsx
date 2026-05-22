"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "../components/ViewSwitcher.module.css";

interface ViewSwitcherProps {
  resolvedView?: string;
}

export default function ViewSwitcher({ resolvedView = "grid" }: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "grid") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.btn} ${resolvedView === "grid" ? styles.active : ""}`}
        onClick={() => switchView("grid")}
      >
        Grid
      </button>
      <button
        className={`${styles.btn} ${resolvedView === "list" ? styles.active : ""}`}
        onClick={() => switchView("list")}
      >
        Lista
      </button>
    </div>
  );
}
