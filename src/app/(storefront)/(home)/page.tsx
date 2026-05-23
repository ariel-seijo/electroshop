import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import FeaturedCarouselDynamic, { type Product } from "@/features/products/components/FeaturedCarouselDynamic";
import Slider from "@/components/Slider";
import SectionTitle from "@/components/SectionTitle";
import Brands from "@/components/Brands";
import PromoBanner from "@/components/PromoBanner";
import { serializeProductsForClient } from "@/lib/utils/serialize-product";

const getFeaturedProducts = unstable_cache(
    async () =>
        prisma.product.findMany({
            where: {
                featured: true,
            },
            take: 8,
            include: {
                category: true,
            },
        }),
    ["home-featured"],
    { revalidate: 60, tags: ["home-featured"] }
);

export const metadata: Metadata = {
    title: "ElectroShop | Hardware Gamer y Componentes de PC",
};

export default async function Home() {
    const products = await getFeaturedProducts();

    return (
        <>
            <Slider />
            <section>
                <SectionTitle>PRODUCTOS DESTACADOS</SectionTitle>
                <FeaturedCarouselDynamic products={serializeProductsForClient(products) as unknown as Product[]} />
            </section>
            <PromoBanner />
            <section>
                <SectionTitle>MARCAS QUE TRABAJAMOS</SectionTitle>
                <Brands />
            </section>
        </>
    );
}
