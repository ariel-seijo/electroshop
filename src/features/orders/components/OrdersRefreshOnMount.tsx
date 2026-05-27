"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Calls router.refresh() on mount to bust the client router cache.
 * Ensures the orders page always shows fresh data after navigation
 * from order detail (where status changes happen).
 */
export default function OrdersRefreshOnMount({ children }: { children: ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return <>{children}</>;
}
