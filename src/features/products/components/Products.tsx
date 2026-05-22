"use client";

import styles from "../styles/Products.module.css";
import ProductCard from "./ProductCard";

interface ProductsProps {
  products: Array<{
    id: number;
    title: string;
    slug: string;
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
    category?: { name: string } | null;
  }>;
  view?: "grid" | "list";
}

export default function Products({ products, view = "grid" }: ProductsProps) {
  const isList = view === "list";

  return (
    <main className={`${styles.products} ${isList ? styles.list : ""}`}>
      <ul>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} view={view} priority={index < 2} />
        ))}
      </ul>
    </main>
  );
}
