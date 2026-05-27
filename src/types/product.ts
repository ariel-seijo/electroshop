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
