import "server-only";

import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { arsToUsd, usdToArs, loadExchangeRate } from "@/lib/utils/currency";

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
            await loadExchangeRate();

            const where: Prisma.ProductWhereInput = {
                category: {
                    name: categoryName,
                },
                active: true,
            };

            if (brand) {
                where.brand = brand;
            }

            if (min || max) {
                const priceFilter: Prisma.FloatFilter = {};

                if (min) {
                    priceFilter.gte = arsToUsd(Number(min));
                }

                if (max) {
                    priceFilter.lte = arsToUsd(Number(max));
                }

                where.price = priceFilter;
            }

            const orderBy: Prisma.ProductOrderByWithRelationInput = {
                createdAt: "desc",
            };

            if (sort === "popular") {
                orderBy.createdAt = undefined;
                orderBy.sold = "desc";
            } else if (sort === "rating") {
                orderBy.createdAt = undefined;
                orderBy.rating = "desc";
            } else if (sort === "asc") {
                orderBy.createdAt = undefined;
                orderBy.price = "asc";
            } else if (sort === "desc") {
                orderBy.createdAt = undefined;
                orderBy.price = "desc";
            }

            const rangeWhere: Prisma.ProductWhereInput = {
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
