import Skeleton from "@/components/ui/Skeleton";
import s from "@/features/category/styles/CategorySkeleton.module.css";

export default function Loading() {
  return (
    <main className={s.page}>
      <div className={s.container}>
        <div className={s.breadcrumbRow}>
          <Skeleton width={45} height={14} />
          <Skeleton width={80} height={14} />
        </div>

        <div className={s.topbar}>
          <div className={s.topbarBread}>
            <Skeleton width={130} height={14} />
          </div>

          <div className={s.toolbarRight}>
            <div className={s.viewToggle}>
              <Skeleton width={36} height={36} />
              <Skeleton width={36} height={36} />
            </div>
            <div className={s.sortBtn}>
              <Skeleton width="100%" height="100%" />
            </div>
          </div>
        </div>

        <div className={s.chips}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={s.chip}>
              <Skeleton width="100%" height="100%" />
            </div>
          ))}
        </div>

        <div className={s.content}>
          <aside className={s.sidebar}>
            <div className={s.filterGroup}>
              <Skeleton width="45%" height={12} />
              <div className={s.selectedChip}>
                <Skeleton width="100%" height="100%" />
              </div>
              <div className={s.selectedChip}>
                <Skeleton width="100%" height="100%" />
              </div>
              <div className={s.selectedChip} style={{ width: 130 }}>
                <Skeleton width="100%" height="100%" />
              </div>
            </div>

            <div className={s.filterGroup}>
              <Skeleton width="45%" height={12} />
              <div className={s.rangeRow}>
                <Skeleton width={60} height={12} />
                <Skeleton width={60} height={12} />
              </div>
              <Skeleton width="100%" height={4} />
              <div className={s.rangeBtn}>
                <Skeleton width="100%" height="100%" />
              </div>
            </div>

            <div className={s.filterGroup}>
              <Skeleton width="45%" height={12} />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} width="100%" height={34} />
              ))}
            </div>
          </aside>

          <section className={s.productsArea} role="status" aria-label="Cargando productos">
            <div className={s.productsGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={s.productCard}>
                  <Skeleton width="100%" style={{ aspectRatio: "1/1" }} />
                  <div className={s.pcMeta}>
                    <Skeleton width="42%" height={15} />
                    <Skeleton width="88%" height={15} />
                    <Skeleton width="52%" height={17} />
                  </div>
                  <Skeleton width="100%" height={34} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
