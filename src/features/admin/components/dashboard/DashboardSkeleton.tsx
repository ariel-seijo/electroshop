"use client";

import Skeleton from "@/components/ui/Skeleton";
import styles from "./StatsCards.module.css";
import chartStyles from "./RevenueChart.module.css";
import activityStyles from "./RecentActivity.module.css";

export default function DashboardSkeleton() {
  return (
    <div>
      <div className={styles.grid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.card} style={{ "--accent-color": "#24abf3" } as React.CSSProperties}>
            <div className={styles.cardHeader}>
              <Skeleton width="50%" height={14} />
              <Skeleton width={20} height={20} variant="circle" />
            </div>
            <Skeleton width="70%" height={32} />
          </div>
        ))}
      </div>

      <div className={chartStyles.wrapper}>
        <div className={chartStyles.header}>
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={12} />
        </div>
        <Skeleton width="100%" height={260} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Skeleton width="30%" height={14} />
          <Skeleton width="25%" height={14} />
        </div>
      </div>

      <div className={activityStyles.grid}>
        <div className={activityStyles.column}>
          <div className={activityStyles.columnHeader}>
            <Skeleton width={18} height={18} variant="circle" />
            <Skeleton width="50%" height={16} />
          </div>
          <table className={activityStyles.table}>
            <thead>
              <tr>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><Skeleton width="80%" height={14} /></td>
                  <td><Skeleton width="70%" height={14} /></td>
                  <td><Skeleton width={60} height={20} /></td>
                  <td><Skeleton width="70%" height={14} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={activityStyles.column}>
          <div className={activityStyles.columnHeader}>
            <Skeleton width={18} height={18} variant="circle" />
            <Skeleton width="50%" height={16} />
          </div>
          <div className={activityStyles.productsList}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={activityStyles.productItem}>
                <Skeleton width={24} height={24} variant="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="100%" height={4} style={{ marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
