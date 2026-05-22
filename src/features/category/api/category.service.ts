import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { arsToUsd, usdToArs } from "@/lib/utils/currency";

interface CategoryProductsParams {
    categoryName: string;
    sort?: string;
    brand?: string;
    min?: string | number;
    max?: string | number;
    page?: string | number;
    limit?: number;
}

export function getCategoryProducts({
    categoryName,
    sort,
    brand,
    min,
    max,
    page = 1,
    limit = 9,
}: CategoryProductsParams) {
    const pageNum = Math.max(1, Number(page));
    const skip = (pageNum - 1) * limit;

    return unstable_cache(
        async () => {
            const where: Record<string, unknown> = {
                category: {
                    name: categoryName,
                },
                active: true,
            };

            if (brand) {
                where.brand = brand;
            }

            if (min || max) {
                where.price = {} as Record<string, number>;

                if (min) {
                    (where.price as Record<string, number>).gte = arsToUsd(Number(min));
                }

                if (max) {
                    (where.price as Record<string, number>).lte = arsToUsd(Number(max));
                }
            }

            let orderBy: Record<string, string> = {
                createdAt: "desc",
            };

            if (sort === "popular") {
                orderBy = { sold: "desc" };
            }

            if (sort === "rating") {
                orderBy = { rating: "desc" };
            }

            if (sort === "asc") {
                orderBy = { price: "asc" };
            }

            if (sort === "desc") {
                orderBy = { price: "desc" };
            }

            const rangeWhere: Record<string, unknown> = {
                category: {
                    name: categoryName,
                },
                active: true,
            };

            if (brand) {
                rangeWhere.brand = brand;
            }

            const [[products, total], brands, priceData] = await Promise.all([
                Promise.all([
                    prisma.product.findMany({
                        where,
                        include: {
                            category: true,
                        },
                        orderBy,
                        skip,
                        take: limit,
                    }),
                    prisma.product.count({ where }),
                ]),
                prisma.product.groupBy({
                    by: ["brand"],
                    where: {
                        category: {
                            name: categoryName,
                        },
                        active: true,
                    },
                    _count: true,
                    orderBy: {
                        brand: "asc",
                    },
                }),
                prisma.product.aggregate({
                    where: rangeWhere,
                    _min: {
                        price: true,
                    },
                    _max: {
                        price: true,
                    },
                }),
            ]);

            return {
                products,
                brands,
                minPrice: Math.floor(usdToArs(priceData._min.price || 0)),
                maxPrice: Math.ceil(usdToArs(priceData._max.price || 0)),
                page: pageNum,
                totalPages: Math.ceil(total / limit),
                total,
            };
        },
        [`category-${categoryName}-${sort}-${brand}-${min}-${max}-${pageNum}`],
        { revalidate: 60, tags: ["category-products"] }
    )();
}
