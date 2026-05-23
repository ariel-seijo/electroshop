import Skeleton from "@/components/ui/Skeleton";

export default function DetailSkeleton() {
  const card = "bg-[rgba(12,12,12,0.95)] border border-white/5 rounded-[10px] p-6 shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)]";

  return (
    <div className="flex flex-col gap-[18px]" role="status" aria-label="Cargando detalle del pedido">
      <div className="flex items-center justify-between mb-1">
        <Skeleton width={100} height={34} />
        <Skeleton width={160} height={34} />
      </div>

      <div className={card}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Skeleton width={180} height={20} />
            <Skeleton width={140} height={12} />
          </div>
          <Skeleton width={160} height={42} />
        </div>
      </div>

      <div className={card}><Skeleton width="100%" height={80} /></div>

      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        <div className={card}><Skeleton width="100%" height={200} /></div>
        <div className={card}><Skeleton width="100%" height={200} /></div>
      </div>

      <div className={card}><Skeleton width="100%" height={200} /></div>
    </div>
  );
}
