import Skeleton from "@/components/ui/Skeleton";
import s from "./HomeSkeleton.module.css";

export default function Loading() {
  return (
    <main>
      <section className={s.slider}>
        <Skeleton width="100%" height="100%" />
      </section>

      <section className={s.section}>
        <div className={s.sectionTitle}>
          <Skeleton width={320} height={34} />
        </div>

        <div className={s.featuredScroll} role="status" aria-label="Cargando productos destacados">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s.fcCard}>
              <Skeleton width="100%" style={{ aspectRatio: "1/1" }} />
              <div className={s.fcCardMeta}>
                <Skeleton width="42%" height={15} />
                <Skeleton width="88%" height={15} />
                <Skeleton width="52%" height={17} />
              </div>
              <Skeleton width="100%" height={34} />
            </div>
          ))}
        </div>
      </section>

      <section className={s.promo}>
        <div className={s.promoContainer}>
          <div className={s.promoFeatures}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s.promoFeature}>
                <Skeleton variant="circle" width={50} height={50} />
                <div className={s.promoText}>
                  <Skeleton width="72%" height={14} />
                  <Skeleton width="90%" height={12} />
                </div>
              </div>
            ))}
          </div>

          <div className={s.promoCta}>
            <div className={s.promoCtaContent}>
              <Skeleton width="70%" height={22} />
              <Skeleton width="85%" height={15} />
            </div>
            <Skeleton width={200} height={48} />
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionTitle}>
          <Skeleton width={320} height={34} />
        </div>

        <div className={s.brandsGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              width="100%"
              style={{ aspectRatio: "1/1" }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
