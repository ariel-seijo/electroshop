import Skeleton from "@/components/ui/Skeleton";
import styles from "./DetailSkeleton.module.css";

export default function DetailSkeleton() {
  return (
    <div className={styles.wrapper} role="status" aria-label="Cargando detalle del pedido">
      {/* Header bar */}
      <div className={styles.header}>
        <Skeleton width={100} height={34} />
        <Skeleton width={160} height={34} />
      </div>

      {/* Order info card */}
      <div className={styles.card}>
        <div className={styles.cardRow}>
          <div>
            <Skeleton width={180} height={20} />
            <Skeleton width={140} height={12} />
          </div>
          <Skeleton width={160} height={42} />
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className={styles.card}>
        <Skeleton width="100%" height={80} />
      </div>

      {/* Two-column grid */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <Skeleton width="100%" height={200} />
        </div>
        <div className={styles.card}>
          <Skeleton width="100%" height={200} />
        </div>
      </div>

      {/* Products table skeleton */}
      <div className={styles.card}>
        <Skeleton width="100%" height={200} />
      </div>
    </div>
  );
}
