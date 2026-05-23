export function serializeProductForClient<T extends Record<string, unknown>>(product: T): Record<string, unknown> | T {
  if (!product) return product;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    thumbnail: product.thumbnail,
    stock: product.stock,
    brand: product.brand,
    sku: product.sku,
    rating: product.rating,
    sold: product.sold,
    featured: product.featured,
    category: product.category
      ? { id: (product.category as Record<string, unknown>).id, name: (product.category as Record<string, unknown>).name }
      : null,
    imagesRel: Array.isArray(product.imagesRel)
      ? (product.imagesRel as Array<Record<string, unknown>>).map((img) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          format: img.format,
          blurDataURL: img.blurDataURL,
        }))
      : undefined,
  };
}

export function serializeProductsForClient<T extends Record<string, unknown>>(products: T[]): Record<string, unknown>[] | T[] {
  if (!Array.isArray(products)) return products;
  return products.map(serializeProductForClient);
}
