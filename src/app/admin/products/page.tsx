import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllProducts } from "@/features/products";
import { ProductsClient, ProductTableSkeleton } from "@/features/admin";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { products, total, page, totalPages } = await getAllProducts(params);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Productos ({total})</h3>
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus size={16} />
            Agregar producto
          </Link>
        </div>
        <Suspense fallback={<ProductTableSkeleton />}>
          <ProductsClient products={products} total={total} page={page} totalPages={totalPages} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
