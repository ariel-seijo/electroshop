import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex max-md:flex-col" role="status" aria-label="Cargando perfil">
      <aside className="w-[260px] min-w-[260px] bg-[rgb(22,22,22)] border-r border-[rgb(38,38,38)] flex flex-col py-8 max-md:w-full max-md:min-w-0 max-md:border-r-0 max-md:border-b max-md:border-[rgb(38,38,38)] max-md:py-6">
        <div className="flex flex-col items-center gap-2.5 px-6 pb-8 border-b border-[rgb(38,38,38)] mb-6 max-md:px-6 max-md:pb-6 max-md:mb-4">
          <Skeleton variant="circle" width={80} height={80} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="72%" height={13} />
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          <Skeleton width="90%" height={48} />
          <Skeleton width="85%" height={48} />
          <Skeleton width="70%" height={48} style={{ marginTop: "auto" }} />
        </nav>
      </aside>
      <main className="flex-1 py-8 px-8 bg-[rgb(18,18,18)] max-md:py-6 max-md:px-6 max-[480px]:p-4">
        <div className="max-w-[780px] mx-auto max-md:max-w-full">
          <div className="bg-[rgb(22,22,22)] border border-[rgb(38,38,38)] p-7 mb-6 max-[480px]:p-5">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-[rgb(38,38,38)]">
              <Skeleton width="55%" height={22} />
              <Skeleton width={90} height={36} />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-2.5">
                  <Skeleton width="30%" height={12} />
                  <Skeleton width="65%" height={17} style={{ marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[rgb(22,22,22)] border border-[rgb(38,38,38)] p-7 mb-6 max-[480px]:p-5">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-[rgb(38,38,38)]">
              <Skeleton width="50%" height={22} />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-2.5">
                  <Skeleton width="35%" height={12} />
                  <Skeleton width="100%" height={42} style={{ marginTop: 6 }} />
                </div>
              ))}
              <Skeleton width="55%" height={44} style={{ marginTop: 8 }} />
            </div>
          </div>
          <div className="h-px bg-[rgb(38,38,38)] my-8" />
          <Skeleton width="48%" height={44} />
        </div>
      </main>
    </div>
  );
}
