import type { SerializedProduct } from "@/types/product";

export function serializeProductForClient(product: Record<string, unknown>): SerializedProduct {
  return {
    id: product.id as number,
    title: product.title as string,
    slug: product.slug as string,
    description: product.description as string,
    price: product.price as number,
    oldPrice: (product.oldPrice as number | null) ?? null,
    thumbnail: product.thumbnail as string,
    stock: product.stock as number,
    brand: product.brand as string,
    sku: product.sku as string,
    rating: product.rating as number,
    sold: product.sold as number,
    featured: (product.featured as boolean) ?? false,
    categoryId: product.categoryId as number,
    category: product.category
      ? {
          id: (product.category as Record<string, unknown>).id as number,
          name: (product.category as Record<string, unknown>).name as string,
        }
      : null,
    imagesRel: Array.isArray(product.imagesRel)
      ? (product.imagesRel as Record<string, unknown>[]).map((img) => ({
          url: img.url as string,
          width: img.width as number,
          height: img.height as number,
          format: img.format as string,
          blurDataURL: img.blurDataURL as string | undefined,
        }))
      : undefined,
  };
}

export function serializeProductsForClient(products: Record<string, unknown>[]): SerializedProduct[] {
  return products.map(serializeProductForClient);
}
