import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage, getProductBySlug, getRelatedProducts } from "@/features/products";
import { prisma } from "@/lib/prisma";
import { serializeProductForClient, serializeProductsForClient } from "@/lib/utils/serialize-product";

export const dynamic = "force-dynamic";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!product) return { title: "Producto no encontrado | ElectroShop" };

  const truncated = truncate(product.title, 29);
  return {
    title: `${truncated} - Hardware Gamer | ElectroShop`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <ProductPage
      product={serializeProductForClient(product) as never}
      relatedProducts={serializeProductsForClient(relatedProducts) as never}
    />
  );
}
