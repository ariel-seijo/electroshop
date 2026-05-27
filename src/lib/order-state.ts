export const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "CANCELLED",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof VALID_STATUSES)[number];

export const STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}
