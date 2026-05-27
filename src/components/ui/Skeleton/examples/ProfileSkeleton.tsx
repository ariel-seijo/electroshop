"use client";

import Skeleton from "../Skeleton";

export default function ProfileSkeleton() {
  return (
    <div>
      <Skeleton variant="circle" width={80} height={80} />
      <Skeleton width="60%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
    </div>
  );
}
