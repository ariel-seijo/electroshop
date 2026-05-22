export { generateOrderNumber } from "./lib/orderNumber";

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
