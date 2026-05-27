"use client";

import Skeleton from "@/components/ui/Skeleton";

interface OrderTableSkeletonProps { rows?: number; }

export default function OrderTableSkeleton({ rows = 8 }: OrderTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando pedidos">
      <div className="flex flex-wrap gap-2.5 pb-[14px] border-b border-border-40">
        <Skeleton width={140} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={220} height={34} />
      </div>

      <div className="border border-white/5 rounded-[10px] overflow-hidden bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-[14%_18%_10%_12%_12%_12%_1fr] gap-3 px-4 py-[14px] border-b border-accent/10 bg-[rgba(16,16,16,0.98)] items-center max-md:hidden">
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>

        <div className="flex flex-col">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-[14%_18%_10%_12%_12%_12%_1fr] gap-3 px-4 py-3 items-center border-b border-white/5 last:border-b-0 max-md:grid-cols-1 max-md:gap-2 max-md:px-4 max-md:py-[14px]">
              <Skeleton width="80%" height={14} />
              <div className="flex flex-col gap-[5px] max-md:mb-1">
                <Skeleton width="70%" height={14} />
                <Skeleton width="80%" height={11} />
              </div>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={14} />
              <Skeleton width={80} height={22} />
              <Skeleton width="80%" height={14} />
              <Skeleton width={56} height={28} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-[14px] border-t border-white/5 bg-[rgba(16,16,16,0.98)] max-md:flex-col max-md:gap-2.5">
          <Skeleton width={160} height={14} />
          <div className="flex gap-1">
            <Skeleton width={80} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={80} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
