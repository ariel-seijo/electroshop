"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styles from "../styles/FeaturedCarousel.module.css";
import ProductCard from "./ProductCard";

interface Product {
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
}

interface FeaturedCarouselProps {
  products: Product[];
}

export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {products.map((product) => (
          <div className={styles.emblaSlide} key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
