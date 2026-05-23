import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/features/admin/components/AdminHeader";
import AdminMobileMenuButton from "@/features/admin/components/AdminMobileMenuButton";
import { SidebarProvider } from "@/features/admin/components/SidebarContext";
import Skeleton from "@/components/ui/Skeleton";

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
      <div
        className="grid grid-cols-1 min-h-screen bg-surface-0 font-[var(--admin-font)] text-text-0 overflow-x-hidden lg:grid-cols-[var(--admin-sidebar-width)_1fr]"
        data-admin-root="true"
        style={{ isolation: "isolate" } as React.CSSProperties}
      >
        <Suspense fallback={null}>
          <Sidebar className="fixed top-0 left-0 bottom-0 w-[var(--admin-sidebar-width)] h-screen bg-surface-14 border-r border-white/5 z-40 overflow-y-auto flex flex-col [scrollbar-width:thin] [scrollbar-color:rgb(50,50,50)_transparent] -translate-x-full transition-transform [transition:transform_var(--admin-transition-sidebar)] lg:translate-x-0 lg:[box-shadow:none] open:translate-x-0 open:shadow-[4px_0_24px_rgba(0,0,0,0.5)] lg:open:shadow-none motion-reduce:transition-none [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgb(50,50,50)] [&::-webkit-scrollbar-thumb]:rounded-sm" />
        </Suspense>

        <div className="col-span-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden lg:col-span-2">
          <header
            className="fixed top-0 left-0 right-0 z-30 h-[var(--admin-header-height)] bg-surface-0/88 backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)] border-b border-white/5 flex items-center gap-0 px-4 lg:left-[var(--admin-sidebar-width)] lg:right-0 lg:px-6 max-[1023px]:px-[18px] max-md:backdrop-blur-[8px] max-md:[-webkit-backdrop-filter:blur(8px)] max-md:px-3"
            style={{ "--header-height": "var(--admin-header-height)" } as React.CSSProperties}
          >
            <AdminMobileMenuButton />

            <Suspense fallback={<HeaderSkeleton />}>
              <AdminHeader />
            </Suspense>
          </header>

          <main
            className="flex-1 px-7 pt-[calc(var(--admin-header-height)+28px)] max-w-[1440px] w-full mx-auto min-w-0 max-[1023px]:px-4 max-[1023px]:pt-[calc(var(--admin-header-height)+16px)] max-md:px-3 max-md:pt-[calc(var(--admin-header-height)+12px)]"
            id="admin-content"
            tabIndex={-1}
          >
            <div className="sr-announce" aria-live="polite" aria-atomic="true" id="sr-live" />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
