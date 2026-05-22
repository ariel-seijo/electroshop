"use client";

import styles from "./Pagination.module.css";
import Link from "next/link";
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
  const prevPage = page - 1;
  const nextPage = page + 1;

  const baseParams = { sort, brand, min, max, view };

  return (
    <div className={styles.pagination}>
      {prevPage >= 1 && (
        <Link
          href={buildCategoryUrl(name, { ...baseParams, page: String(prevPage) })}
          className={styles.prev}
        >
          Anterior
        </Link>
      )}
      <span>
        Página {page} de {totalPages}
      </span>
      {nextPage <= totalPages && (
        <Link
          href={buildCategoryUrl(name, { ...baseParams, page: String(nextPage) })}
          className={styles.next}
        >
          Siguiente
        </Link>
      )}
    </div>
  );
}
