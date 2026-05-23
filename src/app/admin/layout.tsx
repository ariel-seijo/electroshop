import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/features/admin/components/AdminHeader";
import AdminMobileMenuButton from "@/features/admin/components/AdminMobileMenuButton";
import { SidebarProvider } from "@/features/admin/components/SidebarContext";
import Skeleton from "@/components/ui/Skeleton";
import layoutStyles from "@/features/admin/styles/AdminLayout.module.css";

export const metadata: Metadata = {
  title: "Panel de Administración | ElectroShop",
  description: "Panel de administración para gestionar tu tienda online",
};

function HeaderSkeleton() {
  return (
    <Skeleton
      width="100%"
      height="var(--admin-header-height, 64px)"
      style={{ borderRadius: 0, flex: 1 }}
    />
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className={layoutStyles.layout} data-admin-root="true">
        <Suspense fallback={null}>
          <Sidebar className={layoutStyles.sidebar} />
        </Suspense>

        <div className={layoutStyles.main}>
          <header className={layoutStyles.header}>
            <AdminMobileMenuButton />

            <Suspense fallback={<HeaderSkeleton />}>
              <AdminHeader />
            </Suspense>
          </header>

          <main className={layoutStyles.content} id="admin-content" tabIndex={-1}>
            <div
              className="sr-announce"
              aria-live="polite"
              aria-atomic="true"
              id="sr-live"
            />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
