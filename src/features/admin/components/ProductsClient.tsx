"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductSearch from "./ProductSearch";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import type { TableProduct } from "./ProductTable";
import type { Category } from "@/types/category";

interface ProductsClientProps {
  products: TableProduct[];
  total: number;
  page: number;
  totalPages: number;
  categories: Category[];
}

export default function ProductsClient({
  products,
  total,
  page,
  totalPages,
  categories,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId") || "";
  const status = searchParams.get("status") || "";
  const featured = searchParams.get("featured") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";

  function pushParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/products?${params.toString()}`, { scroll: false });
  }

  function handleFilter(key: string, value: string) {
    pushParams({ [key]: value, page: "1" });
  }

  function handleSort(field: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("sort") === field) {
      params.set("order", params.get("order") === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("order", "desc");
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`, { scroll: false });
  }

  function handlePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.push(`/admin/products?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <ProductSearch />
      <ProductFilters
        categories={categories}
        categoryId={categoryId}
        status={status}
        featured={featured}
        sort={sort}
        order={order}
        onChange={handleFilter}
      />
      <ProductTable
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        sort={sort}
        order={order}
        onSort={handleSort}
        onPage={handlePage}
      />
    </div>
  );
}
