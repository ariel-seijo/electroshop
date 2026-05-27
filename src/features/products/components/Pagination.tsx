"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCategoryUrl } from "@/features/category/utils/buildCategoryUrl";

interface PaginationProps {
  name: string;
  page: number;
  totalPages: number;
  sort: string;
  brand: string;
  min: string;
  max: string;
  view: string;
}

export default function Pagination({
  name,
  page,
  totalPages,
  sort,
  brand,
  min,
  max,
  view,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = { sort, brand, min, max, view };

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => {
      if (totalPages <= 7) return true;
      if (n === 1 || n === totalPages) return true;
      if (Math.abs(n - page) <= 1) return true;
      return false;
    }
  );

  const prevHref = buildCategoryUrl(name, current, { page: String(page - 1) });
  const nextHref = buildCategoryUrl(name, current, { page: String(page + 1) });

  return (
    <nav className="flex items-center justify-center gap-1 pt-[1.2rem] mt-4 border-t border-border-38" aria-label="Paginación de productos">
      {page <= 1 ? (
        <span className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-border-44 bg-surface-30 text-text-tertiary rounded text-[0.82rem] font-semibold shrink-0 opacity-30 cursor-not-allowed pointer-events-none" aria-label="Página anterior">
          <ChevronLeft size={16} />
        </span>
      ) : (
        <Link
          href={prevHref}
          className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-border-44 bg-surface-30 text-text-tertiary rounded text-[0.82rem] font-semibold cursor-pointer shrink-0 transition-all duration-[150ms] hover:bg-border-44 hover:border-[rgb(70,70,70)] hover:text-[rgb(220,220,220)]"
          aria-label="Página anterior"
          prefetch={false}
          scroll={false}
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      <div className="flex gap-1">
        {visiblePages.map((n, idx, arr) => {
          const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
          const pageHref = buildCategoryUrl(name, current, { page: String(n) });
          return (
            <span key={n} className="flex items-center">
              {showEllipsis && (
                <span className="text-[rgb(100,100,100)] text-[0.85rem] px-0.5 select-none" aria-hidden="true">…</span>
              )}
              {n === page ? (
                <span
                  className="inline-flex items-center justify-center min-w-9 h-9 px-2 bg-accent/10 border border-accent/35 text-accent rounded text-[0.82rem] font-semibold shrink-0"
                  aria-current="page"
                  aria-label={`Página ${n}`}
                >
                  {n}
                </span>
              ) : (
                <Link
                  href={pageHref}
                  className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-border-44 bg-surface-30 text-text-tertiary rounded text-[0.82rem] font-semibold cursor-pointer shrink-0 transition-all duration-[150ms] hover:bg-border-44 hover:border-[rgb(70,70,70)] hover:text-[rgb(220,220,220)]"
                  aria-label={`Página ${n}`}
                  prefetch={false}
                  scroll={false}
                >
                  {n}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {page >= totalPages ? (
        <span className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-border-44 bg-surface-30 text-text-tertiary rounded text-[0.82rem] font-semibold shrink-0 opacity-30 cursor-not-allowed pointer-events-none" aria-label="Página siguiente">
          <ChevronRight size={16} />
        </span>
      ) : (
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-border-44 bg-surface-30 text-text-tertiary rounded text-[0.82rem] font-semibold cursor-pointer shrink-0 transition-all duration-[150ms] hover:bg-border-44 hover:border-[rgb(70,70,70)] hover:text-[rgb(220,220,220)]"
          aria-label="Página siguiente"
          prefetch={false}
          scroll={false}
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
