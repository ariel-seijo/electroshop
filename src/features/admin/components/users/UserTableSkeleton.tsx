"use client";

import Skeleton from "@/components/ui/Skeleton";

interface UserTableSkeletonProps {
  rows?: number;
}

export default function UserTableSkeleton({ rows = 8 }: UserTableSkeletonProps) {
  return (
    <div className="border border-[rgba(255,255,255,0.05)] rounded-[10px] overflow-hidden bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)]" role="status" aria-label="Cargando usuarios">
      <div className="flex flex-wrap gap-3 px-4 pt-3.5">
        <Skeleton width={220} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={120} height={34} />
        <Skeleton width={100} height={34} />
      </div>

      <div className="">
        <div className="grid grid-cols-[22%_22%_12%_10%_12%_10%_12%] gap-3 px-4 py-3.5 border-b border-[rgba(36,171,243,0.12)] bg-[rgba(16,16,16,0.98)] items-center max-[640px]:hidden">
          <Skeleton width="60%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="40%" height={14} />
          <Skeleton width="40%" height={14} />
        </div>

        <div className="flex flex-col max-[640px]:gap-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-[22%_22%_12%_10%_12%_10%_12%] gap-3 px-4 py-3 items-center border-b border-[rgba(255,255,255,0.04)] last:border-b-0 even:bg-[rgba(255,255,255,0.01)] max-[640px]:grid-cols-1 max-[640px]:gap-2 max-[640px]:py-3.5">
              <div className="flex flex-col gap-1.5 max-[640px]:mb-1">
                <Skeleton width={36} height={36} variant="circle" />
                <div className="flex flex-col gap-1">
                  <Skeleton width="75%" height={14} />
                  <Skeleton width="45%" height={11} />
                </div>
              </div>
              <Skeleton width="70%" height={14} />
              <Skeleton width="60%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="50%" height={14} />
              <Skeleton width="40%" height={14} />
              <Skeleton width="40%" height={14} />
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
