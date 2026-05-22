import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getProductBySlug = (slug: string) =>
    unstable_cache(
        async () =>
            prisma.product.findUnique({
                where: {
                    slug,
                },
                include: {
                    category: true,
                    imagesRel: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
            }),
        ["product", slug],
        { revalidate: 60, tags: [`product-${slug}`] }
    )();

export const getRelatedProducts = (categoryId: number, excludeId: number) =>
    unstable_cache(
        async () =>
            prisma.product.findMany({
                where: {
                    categoryId,
                    id: {
                        not: excludeId,
                    },
                    active: true,
                },
                take: 4,
            }),
        ["related", String(categoryId), String(excludeId)],
        { revalidate: 120 }
    )();
