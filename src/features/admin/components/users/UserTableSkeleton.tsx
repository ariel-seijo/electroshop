"use client";

import Skeleton from "@/components/ui/Skeleton";
import styles from "./UserTableSkeleton.module.css";

interface UserTableSkeletonProps {
  rows?: number;
}

export default function UserTableSkeleton({ rows = 8 }: UserTableSkeletonProps) {
  return (
    <div className={styles.wrapper} role="status" aria-label="Cargando usuarios">
      {/* Filter bar placeholder */}
      <div className={styles.filtersPlaceholder}>
        <Skeleton width={220} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={100} height={34} />
      </div>

      {/* Table card wrapper */}
      <div className={styles.tableCard}>
        <div className={styles.header}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="40%" height={14} />
          <Skeleton width="40%" height={14} />
        </div>

        <div className={styles.rows}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.userCell}>
                <Skeleton width={36} height={36} variant="circle" />
                <div className={styles.userMeta}>
                  <Skeleton width="75%" height={14} />
                  <Skeleton width="45%" height={11} />
                </div>
              </div>
              <Skeleton width="70%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="40%" height={14} />
              <Skeleton width="40%" height={14} />
            </div>
          ))}
        </div>

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
