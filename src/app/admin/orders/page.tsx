import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { getOrdersAction, getDashboardMetricsAction } from "@/features/orders/actions/orderActions";
import { OrderMetrics, OrderFilters, OrderTable, OrderTableSkeleton, OrdersRefreshOnMount } from "@/features/orders";

export const metadata: Metadata = {
  title: "Pedidos | Panel de Administración",
  description: "Gestión de pedidos — ElectroShop Admin",
};

async function OrdersContent({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [ordersResult, metricsResult] = await Promise.all([
    getOrdersAction({
      page: params.page,
      status: params.status,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getDashboardMetricsAction(),
  ]);

  if ("error" in metricsResult) {
    return (
      <div className="error-message" role="alert">
        <AlertCircle size={18} aria-hidden="true" />
        {metricsResult.error}
      </div>
    );
  }

  if ("error" in ordersResult) {
    return (
      <div className="error-message" role="alert">
        <AlertCircle size={18} aria-hidden="true" />
        {ordersResult.error}
      </div>
    );
  }

  const { orders, total, page, totalPages } = ordersResult;

  return (
    <>
      <OrderMetrics metrics={metricsResult} />
      <OrderFilters />
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Pedidos ({total})</h3>
        </div>
        <OrderTable orders={orders} total={total} page={page} totalPages={totalPages} />
      </div>
    </>
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <div>
      <h2 className="visually-hidden">Gestión de pedidos</h2>
      <Suspense fallback={<OrderTableSkeleton />}>
        <OrdersRefreshOnMount>
          <OrdersContent searchParams={searchParams} />
        </OrdersRefreshOnMount>
      </Suspense>
    </div>
  );
}
