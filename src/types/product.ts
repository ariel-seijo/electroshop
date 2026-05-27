// ── Storefront (serialized, client-safe) ──────────────────────────────

export interface SerializedProductImage {
  url: string;
  width: number;
  height: number;
  format: string;
  blurDataURL?: string;
}

export interface SerializedProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  thumbnail: string;
  stock: number;
  brand: string;
  sku: string;
  rating: number;
  sold: number;
  featured: boolean;
  categoryId: number;
  category: { id: number; name: string } | null;
  imagesRel?: SerializedProductImage[];
}

// ── Admin ──────────────────────────────────────────────────────────────

/** Image asset with DB identity — used in admin galleries, upload widgets, and product forms. */
export interface AdminImageAsset {
  id: string;
  url: string;
  format: string;
  width: number;
  height: number;
  /** Legacy migration marker — set for images imported before Cloudinary migration. */
  _legacy?: boolean;
}

/** Full product record for admin CRUD forms. Nullable fields reflect API response shapes where properties may be absent or null. */
export interface AdminProductData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  brand: string;
  sku: string | null;
  categoryId: number | null;
  thumbnail: string | null;
  images: string[] | null;
  imagesRel?: AdminImageAsset[];
  rating: number;
  sold: number;
  featured: boolean;
  active: boolean;
  category?: { name: string } | null;
}

// ── Shared dashboard / alerts ──────────────────────────────────────────

/** Product with critically low stock — used in dashboard alerts and notification bell. */
export interface LowStockProduct {
  id: number;
  title: string;
  stock: number;
}
