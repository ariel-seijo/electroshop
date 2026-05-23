import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Products, Pagination } from "@/features/products";
import {
  getCategoryProducts,
  FiltersSidebar,
  CategoryHeader,
  EmptyProducts,
  SortDropdown,
  ViewSwitcher,
} from "@/features/category";
import { serializeProductsForClient } from "@/lib/utils/serialize-product";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "\u2026";
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const displayName = truncate(name.toUpperCase(), 23);
  return {
    title: `${displayName} - Componentes | ElectroShop`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { name } = await params;
  const query = await searchParams;

  const categoryName = name.toUpperCase();
  const sort = query.sort || "recent";
  const brand = query.brand || "";
  const min = query.min || "";
  const max = query.max || "";
  const page = query.page || "1";

  const { products, brands, minPrice, maxPrice, page: currentPage, totalPages } = await getCategoryProducts({
    categoryName,
    sort,
    brand,
    min,
    max,
    page,
  });

  const cookieStore = await cookies();
  const cookieView = cookieStore.get("productView")?.value;
  const view = query.view || cookieView || "grid";

  return (
    <main className="w-full px-4 py-8 pb-16 max-3lg:px-3 max-3lg:pb-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 gap-[1.2rem] items-start md:grid-cols-[260px_1fr]">
          <FiltersSidebar
            name={name}
            brands={brands}
            sort={sort}
            brand={brand}
            min={min}
            max={max}
            minPrice={minPrice}
            maxPrice={maxPrice}
            view={view}
          />

          <section className="bg-surface-22 border border-border-34 p-6 min-w-0 max-3lg:p-4">
            <div className="flex justify-between items-center gap-4 mb-[1.2rem] pb-4 border-b border-border-38 max-3lg:flex-col max-3lg:items-start max-3lg:gap-3">
              <CategoryHeader categoryName={categoryName} />

              <div className="flex items-center gap-3 max-3lg:w-full max-3lg:justify-between max-2xs:flex-wrap max-2xs:gap-2">
                <ViewSwitcher resolvedView={view} />
                <SortDropdown
                  name={name}
                  sort={sort}
                  brand={brand}
                  min={min}
                  max={max}
                  view={view}
                />
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <Products products={serializeProductsForClient(products) as never} view={view as "grid" | "list"} />
                <Pagination
                  name={name}
                  page={currentPage}
                  totalPages={totalPages}
                  sort={sort}
                  brand={brand}
                  min={min}
                  max={max}
                  view={view}
                />
              </>
            ) : (
              <EmptyProducts name={name} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
