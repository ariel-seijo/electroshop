export { generateOrderNumber } from "./lib/orderNumber";

export { default as OrderMetrics } from "./components/OrderMetrics";
export { default as OrderFilters } from "./components/OrderFilters";
export { default as OrderTable } from "./components/OrderTable";
export { default as OrderTableSkeleton } from "./components/OrderTableSkeleton";
export { default as OrdersRefreshOnMount } from "./components/OrdersRefreshOnMount";
export { default as OrderStatusTimeline } from "./components/OrderStatusTimeline";
export { default as MyOrders } from "./components/MyOrders";
export { default as ReceiptDownload } from "./components/ReceiptDownload";

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardMetrics,
} from "./services/order.service";
export type { DashboardMetrics } from "./services/order.service";

export {
  getOrdersAction,
  getOrderDetailAction,
  updateOrderStatusAction,
  getDashboardMetricsAction,
} from "./actions/orderActions";
