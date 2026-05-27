import { Suspense } from "react";
import { UsersClient, UserTableSkeleton, getAllUsers } from "@/features/admin";
import { loadExchangeRate } from "@/lib/utils/currency";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const exchangeRate = await loadExchangeRate();
  const { users, total, page, totalPages } = await getAllUsers(params);

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Usuarios ({total})</h3>
        </div>
        <Suspense fallback={<UserTableSkeleton />}>
          <UsersClient users={users} total={total} page={page} totalPages={totalPages} exchangeRate={exchangeRate} />
        </Suspense>
      </div>
    </div>
  );
}
