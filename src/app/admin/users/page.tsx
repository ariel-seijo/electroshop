import { Suspense } from "react";
import UsersClient from "@/features/admin/components/users/UsersClient";
import UserTableSkeleton from "@/features/admin/components/users/UserTableSkeleton";
import * as userService from "@/features/admin/services/user.service";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { users, total, page, totalPages } = await userService.getAllUsers(params);

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Usuarios ({total})</h3>
        </div>
        <Suspense fallback={<UserTableSkeleton />}>
          <UsersClient users={users} total={total} page={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
