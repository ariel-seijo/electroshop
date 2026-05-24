"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

const STORAGE_KEY = "productView";

function persist(view: string) {
  localStorage.setItem(STORAGE_KEY, view);
  document.cookie = `${STORAGE_KEY}=${view}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function buildUrl(pathname: string, searchParams: URLSearchParams, newView: string) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("view", newView);
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

  const btnBase =
    "flex items-center justify-center px-[0.55rem] py-[0.45rem] min-w-9 min-h-9 bg-surface-18 text-text-placeholder border-none cursor-pointer no-underline transition-[background,color,box-shadow] duration-[250ms] hover:text-text-secondary hover:bg-surface-24 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] focus-visible:z-[1] focus-visible:rounded-sm [&>svg]:size-[15px] [&>svg]:shrink-0 ms:px-[0.65rem] ms:py-2 ms:min-w-10 ms:min-h-10 ms:[&>svg]:size-4 md:min-w-11 md:min-h-11 md:[&>svg]:size-[18px]";

  return (
    <div className="flex border border-border-38 rounded-md overflow-hidden shrink-0 max-3lg:hidden" role="radiogroup" aria-label="Vista de productos">
      <button
        onClick={() => handleToggle("grid")}
        className={`${btnBase} border-r border-border-38 ${activeView === "grid" ? "bg-[rgba(36,171,243,0.1)] text-accent shadow-[inset_0_0_12px_rgba(36,171,243,0.08)] hover:bg-[rgba(36,171,243,0.14)] hover:text-accent" : ""}`}
        role="radio"
        aria-checked={activeView === "grid"}
        aria-label="Vista en cuadrícula"
      >
        <LayoutGrid size={16} aria-hidden="true" />
      </button>
      <button
        onClick={() => handleToggle("list")}
        className={`${btnBase} ${activeView === "list" ? "bg-[rgba(36,171,243,0.1)] text-accent shadow-[inset_0_0_12px_rgba(36,171,243,0.08)] hover:bg-[rgba(36,171,243,0.14)] hover:text-accent" : ""}`}
        role="radio"
        aria-checked={activeView === "list"}
        aria-label="Vista en lista"
      >
        <List size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
