"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return children;
}
