import Skeleton from "@/components/ui/Skeleton";
import s from "./ProfileSkeleton.module.css";

export default function Loading() {
  return (
    <div className={s.dashboard} role="status" aria-label="Cargando perfil">
      <aside className={s.sidebar}>
        <div className={s.sidebarUser}>
          <Skeleton variant="circle" width={80} height={80} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="72%" height={13} />
        </div>
        <nav className={s.sidebarNav}>
          <Skeleton width="90%" height={48} />
          <Skeleton width="85%" height={48} />
          <Skeleton width="70%" height={48} style={{ marginTop: "auto" }} />
        </nav>
      </aside>
      <main className={s.content}>
        <div className={s.section}>
          <div className={s.card}>
            <div className={s.cardHeader}>
              <Skeleton width="55%" height={22} />
              <Skeleton width={90} height={36} />
            </div>
            <div className={s.fields}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={s.field}>
                  <Skeleton width="30%" height={12} />
                  <Skeleton width="65%" height={17} style={{ marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>
          <div className={s.card}>
            <div className={s.cardHeader}>
              <Skeleton width="50%" height={22} />
            </div>
            <div className={s.fields}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={s.field}>
                  <Skeleton width="35%" height={12} />
                  <Skeleton width="100%" height={42} style={{ marginTop: 6 }} />
                </div>
              ))}
              <Skeleton width="55%" height={44} style={{ marginTop: 8 }} />
            </div>
          </div>
          <div className={s.divider} />
          <Skeleton width="48%" height={44} />
        </div>
      </main>
    </div>
  );
}
