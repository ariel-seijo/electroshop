"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCategoryUrl } from "@/features/category/utils/buildCategoryUrl";
import styles from "./Pagination.module.css";

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
    <nav className={styles.pagination} aria-label="Paginación de productos">
      {page <= 1 ? (
        <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`} aria-label="Página anterior">
          <ChevronLeft size={16} />
        </span>
      ) : (
        <Link
          href={prevHref}
          className={styles.pageBtn}
          aria-label="Página anterior"
          prefetch={false}
          scroll={false}
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      <div className={styles.pageNumbers}>
        {visiblePages.map((n, idx, arr) => {
          const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
          const pageHref = buildCategoryUrl(name, current, { page: String(n) });
          return (
            <span key={n} className={styles.pageGroup}>
              {showEllipsis && (
                <span className={styles.ellipsis} aria-hidden="true">…</span>
              )}
              {n === page ? (
                <span
                  className={`${styles.pageBtn} ${styles.pageBtnActive}`}
                  aria-current="page"
                  aria-label={`Página ${n}`}
                >
                  {n}
                </span>
              ) : (
                <Link
                  href={pageHref}
                  className={styles.pageBtn}
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
        <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`} aria-label="Página siguiente">
          <ChevronRight size={16} />
        </span>
      ) : (
        <Link
          href={nextHref}
          className={styles.pageBtn}
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
