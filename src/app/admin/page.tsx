import type { Metadata } from "next";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import { getDashboardData, StatsCards, RevenueChart, RecentActivity, LowStockAlert, DashboardSkeleton } from "@/features/admin";
import { prisma } from "@/lib/prisma";
import { formatArs } from "@/lib/utils/currency";

export const metadata: Metadata = {
  title: "Panel de Control | ElectroShop Admin",
  description: "Centro de control con métricas, tendencias y actividad reciente",
};

export const revalidate = 300;

async function DashboardContent() {
  const data = await getDashboardData();

  const settings = await prisma.siteSettings.findUnique({ where: { id: "site_settings" } });
  const exchangeRate = settings?.usdToArs || 1400;
  const formattedRevenue = formatArs(data.totalRevenue * exchangeRate);

  return (
    <>
      <StatsCards data={data} formattedRevenue={formattedRevenue} />
      <LowStockAlert lowStockCount={data.lowStockCount} lowStockProducts={data.lowStockProducts} />
      <RevenueChart data={data.timeline} totalRevenue={data.totalRevenue} exchangeRate={exchangeRate} />
      <RecentActivity latestOrders={data.latestOrders} topProducts={data.topProducts} exchangeRate={exchangeRate} />
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="admin-card-title admin-card-title-with-icon page-title-spacing">
        <LayoutDashboard size={20} color="var(--admin-primary-glow)" aria-hidden="true" />
        Panel de Control
      </h2>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
