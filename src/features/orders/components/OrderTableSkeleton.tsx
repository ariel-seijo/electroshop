"use client";

import Skeleton from "@/components/ui/Skeleton";
import styles from "./OrderTableSkeleton.module.css";

interface OrderTableSkeletonProps {
  rows?: number;
}

export default function OrderTableSkeleton({ rows = 8 }: OrderTableSkeletonProps) {
  return (
    <div className={styles.wrapper} role="status" aria-label="Cargando pedidos">
      {/* Filter bar (standalone) */}
      <div className={styles.filtersPlaceholder}>
        <Skeleton width={140} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={220} height={34} />
      </div>

      {/* Table card wrapper */}
      <div className={styles.tableCard}>
        {/* Table header */}
        <div className={styles.header}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>

        {/* Table rows */}
        <div className={styles.rows}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.row}>
              <Skeleton width="80%" height={14} />
              <div className={styles.customerCell}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="80%" height={11} />
              </div>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={14} />
              <Skeleton width={80} height={22} />
              <Skeleton width="80%" height={14} />
              <Skeleton width={56} height={28} />
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
