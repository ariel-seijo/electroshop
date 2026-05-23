"use client";

import Skeleton from "@/components/ui/Skeleton";
import styles from "./ProductTableSkeleton.module.css";

interface ProductTableSkeletonProps {
  rows?: number;
}

export default function ProductTableSkeleton({ rows = 8 }: ProductTableSkeletonProps) {
  return (
    <div className={styles.wrapper} role="status" aria-label="Cargando productos">
      {/* Search bar placeholder (standalone) */}
      <div className={styles.searchPlaceholder}>
        <Skeleton height={42} />
      </div>

      {/* Filter bar placeholder (standalone) */}
      <div className={styles.filtersPlaceholder}>
        <Skeleton width={140} height={34} />
        <Skeleton width={200} height={34} />
        <Skeleton width={100} height={34} />
        <Skeleton width={130} height={34} />
      </div>

      {/* Table card wrapper */}
      <div className={styles.tableCard}>
        {/* Table header */}
        <div className={styles.header}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>

        {/* Table rows */}
        <div className={styles.rows}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.productCell}>
                <Skeleton width={40} height={40} />
                <div className={styles.productMeta}>
                  <Skeleton width="75%" height={14} />
                  <Skeleton width="45%" height={11} />
                </div>
              </div>
              <Skeleton width="70%" height={14} />
              <Skeleton width="70%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="50%" height={14} />
              <div className={styles.actionsCell}>
                <Skeleton width={60} height={28} />
                <Skeleton width={60} height={28} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <Skeleton width={160} height={14} />
          <div style={{ display: "flex", gap: 4 }}>
            <Skeleton width={80} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={80} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
