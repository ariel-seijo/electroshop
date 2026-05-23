import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 py-8 pb-16 max-3lg:px-[0.8rem] max-3lg:py-4 max-3lg:pb-12">
      <nav className="flex flex-wrap items-center gap-[1.25rem] mb-8">
        <Skeleton width={40} height={13} />
        <Skeleton width={80} height={13} />
        <Skeleton width={110} height={13} />
      </nav>

      <section className="grid grid-cols-[1.05fr_1fr] gap-12 mb-16 max-3xl:grid-cols-1 max-3xl:gap-8">
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-surface-26 border border-border-38 p-8 max-3xl:max-w-[600px] max-3xl:mx-auto">
            <Skeleton width="100%" height="100%" />
          </div>
          <div className="flex gap-[0.6rem]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 shrink-0 border-2 border-border-38 p-[0.35rem] bg-surface-26 max-ms:w-[60px] max-ms:h-[60px]">
                <Skeleton width="100%" height="100%" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[1.2rem]">
          <div className="flex flex-wrap gap-2">
            <div className="h-[26px] w-[90px] px-[0.65rem] py-[0.35rem] bg-border-34 border border-border-52">
              <Skeleton width="100%" height="100%" />
            </div>
            <div className="h-[26px] w-[72px] px-[0.65rem] py-[0.35rem] bg-border-34 border border-border-52">
              <Skeleton width="100%" height="100%" />
            </div>
            <div className="h-[26px] w-[90px] px-[0.65rem] py-[0.35rem] bg-border-34 border border-border-52">
              <Skeleton width="100%" height="100%" />
            </div>
          </div>
          <Skeleton width="85%" height={35} />
          <Skeleton width="45%" height={14} />
          <Skeleton width="38%" height={35} />
          <Skeleton width="88%" height={17} />
          <Skeleton width="88%" height={16} />
          <Skeleton width="56%" height={16} />
          <div className="grid grid-cols-2 gap-[0.7rem] max-3lg:grid-cols-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-[0.7rem] bg-surface-26 border border-border-38 px-4 py-[0.9rem]">
                <Skeleton width={18} height={18} />
                <div className="flex flex-col gap-[0.15rem] flex-1">
                  <Skeleton width="60%" height={11} />
                  <Skeleton width="82%" height={14} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-stretch max-3lg:flex-col">
            <div className="w-[130px] border border-border-52 max-3lg:w-full max-3lg:h-12">
              <Skeleton width="100%" height="100%" />
            </div>
            <Skeleton width="100%" height={52} style={{ flex: 1 }} />
          </div>
          <div className="flex flex-col gap-2 p-4 bg-surface-20 border border-border-34">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-[0.6rem]">
                <Skeleton width={16} height={16} />
                <Skeleton width="75%" height={13} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="flex items-center justify-between mb-[1.2rem]">
          <Skeleton width={260} height={21} />
          <Skeleton width={100} height={13} />
        </div>
        <div className="grid grid-cols-4 gap-4 max-3xl:grid-cols-2 max-3lg:grid-cols-2 max-3lg:gap-[0.7rem]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-md bg-[linear-gradient(160deg,rgb(24,24,24)_0%,rgb(18,18,18)_100%)] border border-white/5 p-[0.4rem] ms:p-3 md:p-4 lg:px-[1.2rem] lg:py-[1.2rem]">
              <Skeleton width="100%" style={{ aspectRatio: "1/1" }} />
              <div className="flex flex-col gap-[0.25rem] pt-[0.4rem] ms:gap-[0.35rem] ms:pt-[0.6rem] md:gap-[0.42rem] md:pt-[0.7rem] lg:gap-2 lg:pt-[0.85rem]">
                <Skeleton width="42%" height={15} />
                <Skeleton width="88%" height={15} />
                <Skeleton width="52%" height={17} />
              </div>
              <Skeleton width="100%" height={34} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
