"use client";

import ProductCard from "./ProductCard";

interface ProductsProps {
  products: {
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
    category: { id: number; name: string } | null;
  }[];
  view?: "grid" | "list";
}

export default function Products({ products, view = "grid" }: ProductsProps) {
  const isList = view === "list";

  return (
    <main className={`w-full flex justify-center ${isList ? "md:[&>ul]:gap-[0.8rem] lg:[&>ul]:gap-4 min-[700px]:[&>ul]:flex min-[700px]:[&>ul]:flex-col min-[700px]:[&>ul]:gap-[0.6rem] min-[700px]:[&>ul]:max-w-full min-[700px]:[&>ul]:p-0" : ""}`}>
      <ul className={`w-full max-w-[1200px] grid grid-cols-1 gap-4 p-3 list-none m-0 max-[479px]:[&>*]:w-[80%] max-[479px]:[&>*]:justify-self-center ms:grid-cols-2 ms:gap-[0.7rem] ms:p-[0.7rem] md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:gap-[0.9rem] md:p-0 lg:grid-cols-3 lg:gap-[1.2rem]`}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} view={view} priority={index < 2} />
        ))}
      </ul>
    </main>
  );
}
