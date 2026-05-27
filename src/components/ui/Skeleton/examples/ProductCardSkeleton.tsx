"use client";

import Skeleton from "../Skeleton";

interface ProductCardSkeletonProps {
  className?: string;
}

export default function ProductCardSkeleton({ className = "" }: ProductCardSkeletonProps) {
  return (
    <div className={`${className}`}>
      <Skeleton width="100%" height={180} />
      <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
    </div>
  );
}
