// ── Shared core ───────────────────────────────────────────────────────

/** Fields shared by all order views (admin and customer). */
export interface OrderCore {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  paymentMethod: string;
  createdAt: string;
  shippingAddress?: Record<string, string>;
  cardDetails?: { last4?: string; holder?: string };
}

/** Fields shared by all order line items. */
export interface OrderItemCore {
  id: number;
  productTitle: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ── View-specific projections ──────────────────────────────────────────

/** Admin order detail — includes DB id, grand total, customer info, and admin-specific item fields. */
export type AdminOrder = OrderCore & {
  id: string;
  total: number;
  items: AdminOrderItem[];
  user?: { id: string; name: string; email: string };
};

/** Customer-facing order detail — minimal projection without internal IDs or admin fields. */
export type CustomerOrder = OrderCore & {
  items: CustomerOrderItem[];
};

/** Admin order line item — extends the core with product image and reference for admin linking. */
export type AdminOrderItem = OrderItemCore & {
  productImage: string;
  productId: number;
};

/** Customer-facing order line item — identical to the core, no admin extras. */
export type CustomerOrderItem = OrderItemCore;

// ── List / summary views ───────────────────────────────────────────────

/** Compact order summary for user order history lists (was incorrectly named OrderItem). */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

/** Recent order for dashboard activity feed and notification bell. */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  /** ISO string or Prisma Date — both appear depending on serialization context. */
  createdAt: Date | string;
  /** Present in admin dashboard queries, absent in header notification queries. */
  total?: number;
  user?: { name?: string | null; email?: string } | null;
}

// ── Query filters ──────────────────────────────────────────────────────

/** Query parameters for order listing and filtering. */
export interface OrderFilters {
  page?: string | number;
  limit?: string | number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: string;
}
