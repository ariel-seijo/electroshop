import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main>
      <section className="w-full aspect-[1920/511] max-lg:aspect-[1920/550] max-md:aspect-[1920/650] max-[480px]:aspect-[1920/850]">
        <Skeleton width="100%" height="100%" />
      </section>

      <section className="max-w-[1200px] mx-auto px-4 max-[520px]:px-3">
        <div className="w-full flex justify-center my-6 max-[700px]:my-4">
          <Skeleton width={320} height={34} />
        </div>

        <div className="flex flex-nowrap gap-2 overflow-hidden mb-6" role="status" aria-label="Cargando productos destacados">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[65%] max-w-[220px] flex flex-col gap-1 bg-gradient-to-br from-[rgb(24,24,24)] to-[rgb(18,18,18)] border border-white/[0.06] rounded-md p-1.5 min-[480px]:w-[45%] min-[480px]:p-3 min-[768px]:w-[30%] min-[768px]:max-w-[240px] min-[768px]:p-4 min-[768px]:rounded-lg min-[1024px]:w-[26%] min-[1024px]:max-w-[260px] min-[1024px]:p-5">
              <Skeleton width="100%" style={{ aspectRatio: "1/1" }} />
              <div className="flex flex-col gap-[0.35rem] pt-1.5 min-[480px]:pt-2.5 min-[768px]:pt-[0.7rem] min-[1024px]:pt-[0.85rem]">
                <Skeleton width="42%" height={15} />
                <Skeleton width="88%" height={15} />
                <Skeleton width="52%" height={17} />
              </div>
              <Skeleton width="100%" height={34} />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mb-10">
        <div className="max-w-[1200px] mx-auto mt-10">
          <div className="grid grid-cols-3 gap-px bg-[rgb(34,34,34)] border border-[rgb(34,34,34)] rounded-lg overflow-hidden max-[900px]:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-[1.6rem] px-[1.8rem] bg-[rgb(20,20,20)] max-[600px]:py-5 max-[600px]:px-4">
                <Skeleton variant="circle" width={50} height={50} />
                <div className="flex flex-col gap-[0.15rem] flex-1">
                  <Skeleton width="72%" height={14} />
                  <Skeleton width="90%" height={12} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-px flex items-center justify-between gap-8 py-[2.2rem] px-10 bg-[rgb(20,20,20)] border border-[rgb(34,34,34)] rounded-b-lg max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-5 max-[600px]:py-6 max-[600px]:px-5">
            <div className="flex flex-col gap-[0.4rem] flex-1">
              <Skeleton width="70%" height={22} />
              <Skeleton width="85%" height={15} />
            </div>
            <Skeleton width={200} height={48} />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 max-[520px]:px-3">
        <div className="w-full flex justify-center my-6 max-[700px]:my-4">
          <Skeleton width={320} height={34} />
        </div>

        <div className="grid grid-cols-8 gap-4 max-w-[1200px] mx-auto max-[1200px]:grid-cols-6 max-[1200px]:p-4 max-[900px]:grid-cols-4 max-md:flex max-md:gap-3 max-md:p-4 max-md:overflow-hidden [&>*]:max-md:w-[140px] [&>*]:max-md:min-w-[140px] [&>*]:max-[480px]:w-[120px] [&>*]:max-[480px]:min-w-[120px]">
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
