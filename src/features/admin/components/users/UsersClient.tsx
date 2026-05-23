"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import UserOrderHistory from "./UserOrderHistory";

interface UsersClientUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string | Date;
  deletedAt: string | Date | null;
  _count?: { orders?: number };
  lifetimeValue?: number;
}

interface UsersClientProps {
  users: UsersClientUser[];
  total: number;
  page: number;
  totalPages: number;
  exchangeRate: number;
}

export default function UsersClient({
  users,
  total,
  page,
  totalPages,
  exchangeRate,
}: UsersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";

  const [drawer, setDrawer] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });

  function handleSort(field: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("sort") === field) {
      params.set("order", params.get("order") === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("order", "desc");
    }
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`, { scroll: false });
  }

  function handlePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.push(`/admin/users?${params.toString()}`, { scroll: false });
  }

  function handleViewOrders(user: { id: string; email: string; name?: string | null; createdAt?: string }) {
    setDrawer({ isOpen: true, userId: user.id });
  }

  function handleCloseDrawer() {
    setDrawer({ isOpen: false, userId: null });
  }

  return (
    <div>
      <UserFilters total={total} />
      <UserTable
        users={users}
        total={total}
        page={page}
        totalPages={totalPages}
        sort={sort}
        order={order}
        exchangeRate={exchangeRate}
        onSort={handleSort}
        onPage={handlePage}
        onViewOrders={handleViewOrders}
      />
      {drawer.isOpen && drawer.userId && (
        <UserOrderHistory
          userId={drawer.userId}
          isOpen={drawer.isOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
