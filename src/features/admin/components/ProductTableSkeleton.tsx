"use client";

import Skeleton from "@/components/ui/Skeleton";

interface ProductTableSkeletonProps {
  rows?: number;
}

export default function ProductTableSkeleton({ rows = 8 }: ProductTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando productos">
      <div className="mb-0">
        <Skeleton height={42} />
      </div>

      <div className="flex flex-wrap gap-3 pb-3.5 border-b border-[rgb(40,40,40)]">
        <Skeleton width={140} height={34} />
        <Skeleton width={200} height={34} />
        <Skeleton width={100} height={34} />
        <Skeleton width={130} height={34} />
      </div>

      <div className="border border-[rgba(255,255,255,0.05)] rounded-[10px] overflow-hidden bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-[28%_10%_10%_10%_8%_8%_8%_18%] gap-3 px-4 py-3.5 border-b border-[rgba(36,171,243,0.12)] bg-[rgba(16,16,16,0.98)] items-center max-[640px]:hidden">
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>

        <div className="flex flex-col">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-[28%_10%_10%_10%_8%_8%_8%_18%] gap-3 px-4 py-3 items-center border-b border-[rgba(255,255,255,0.04)] last:border-b-0 max-[640px]:grid-cols-1 max-[640px]:gap-2 max-[640px]:py-3.5">
              <div className="flex items-center gap-2.5 max-[640px]:mb-1">
                <Skeleton width={40} height={40} />
                <div className="flex flex-col gap-[5px] flex-1">
                  <Skeleton width="75%" height={14} />
                  <Skeleton width="45%" height={11} />
                </div>
              </div>
              <Skeleton width="70%" height={14} />
              <Skeleton width="70%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="50%" height={14} />
              <div className="flex gap-1.5">
                <Skeleton width={60} height={28} />
                <Skeleton width={60} height={28} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(16,16,16,0.98)] max-[640px]:flex-col max-[640px]:gap-2.5">
          <Skeleton width={160} height={14} />
          <div style={{ display: "flex", gap: 4 }}>
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
