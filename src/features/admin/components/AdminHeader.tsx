import { Suspense } from "react";
import { getAdminNotifications } from "@/features/admin/services/notification.service";
import Breadcrumbs from "./Breadcrumbs";
import AdminSearchbar from "./AdminSearchbar";
import NotificationBell from "./NotificationBell";
import AdminProfileMenu from "./AdminProfileMenu";

export default async function AdminHeader() {
  const notifications = await getAdminNotifications();

  return (
    <div className="flex items-center flex-1 min-w-0 h-full gap-4">
      <div className="flex-1 min-w-0 flex items-center">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AdminSearchbar />

        <Suspense fallback={null}>
          <NotificationBell
            lowStock={notifications.lowStock}
            recentOrders={notifications.recentOrders}
            pendingCount={notifications.pendingCount}
          />
        </Suspense>

        <AdminProfileMenu />
      </div>
    </div>
  );
}
