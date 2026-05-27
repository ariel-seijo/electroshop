import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="w-full px-4 py-8 pb-16 max-3lg:px-3 max-3lg:py-4 max-3lg:pb-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-[0.8rem] mb-4">
          <Skeleton width={45} height={14} />
          <Skeleton width={80} height={14} />
        </div>

        <div className="flex justify-between items-center gap-4 mb-[1.2rem] pb-4 border-b border-border-38 max-3lg:flex-col max-3lg:items-start max-3lg:gap-3">
          <div className="flex items-center gap-[0.8rem]">
            <Skeleton width={130} height={14} />
          </div>

          <div className="flex items-center gap-3 max-3lg:w-full max-3lg:justify-between max-2xs:flex-wrap max-2xs:gap-2">
            <div className="flex shrink-0 rounded-md border border-border-38 overflow-hidden max-3lg:hidden">
              <Skeleton width={36} height={36} />
              <Skeleton width={36} height={36} />
            </div>
            <div className="w-[160px] h-[34px] bg-surface-18 border border-border-44 max-3lg:flex-1">
              <Skeleton width="100%" height="100%" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-[110px] bg-surface-30 border border-border-44">
              <Skeleton width="100%" height="100%" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-[1.2rem] items-start max-7lg:grid-cols-1">
          <aside className="bg-surface-22 border border-border-34 p-6 flex flex-col gap-6 max-3lg:px-4 max-3lg:py-4">
            <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
              <Skeleton width="45%" height={12} />
              <div className="h-7 w-[105px] bg-accent/10 border border-accent/30">
                <Skeleton width="100%" height="100%" />
              </div>
              <div className="h-7 w-[105px] bg-accent/10 border border-accent/30">
                <Skeleton width="100%" height="100%" />
              </div>
              <div className="h-7 bg-accent/10 border border-accent/30" style={{ width: 130 }}>
                <Skeleton width="100%" height="100%" />
              </div>
            </div>

            <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
              <Skeleton width="45%" height={12} />
              <div className="flex justify-between">
                <Skeleton width={60} height={12} />
                <Skeleton width={60} height={12} />
              </div>
              <Skeleton width="100%" height={4} />
              <div className="h-9">
                <Skeleton width="100%" height="100%" />
              </div>
            </div>

            <div className="flex flex-col gap-[0.7rem] [&+div]:pt-[1.2rem] [&+div]:border-t [&+div]:border-border-38">
              <Skeleton width="45%" height={12} />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} width="100%" height={34} />
              ))}
            </div>
          </aside>

          <section className="bg-surface-22 border border-border-34 p-6 min-w-0 max-3lg:px-4 max-3lg:py-4" role="status" aria-label="Cargando productos">
            <div className="grid grid-cols-1 gap-2 p-2 ms:grid-cols-2 ms:gap-[0.7rem] ms:p-[0.7rem] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:gap-[0.9rem] md:p-0 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:gap-[1.2rem]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-md bg-[linear-gradient(160deg,rgb(24,24,24)_0%,rgb(18,18,18)_100%)] border border-white/5 p-[0.4rem] ms:p-3 md:p-4 md:rounded-lg lg:px-[1.2rem] lg:py-[1.2rem]">
                  <Skeleton width="100%" style={{ aspectRatio: "1/1" }} />
                  <div className="flex flex-col gap-[0.35rem] pt-[0.4rem] ms:pt-[0.6rem] md:pt-[0.7rem] lg:pt-[0.85rem]">
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
