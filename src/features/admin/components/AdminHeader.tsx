import { Suspense } from "react";
import { getAdminNotifications } from "@/features/admin/services/notification.service";
import Breadcrumbs from "./Breadcrumbs";
import AdminSearchbar from "./AdminSearchbar";
import NotificationBell from "./NotificationBell";
import AdminProfileMenu from "./AdminProfileMenu";
import headerStyles from "./AdminHeader.module.css";

export default async function AdminHeader() {
  const notifications = await getAdminNotifications();

  return (
    <div className={headerStyles.inner}>
      <div className={headerStyles.left}>
        <Breadcrumbs />
      </div>

      <div className={headerStyles.right}>
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
