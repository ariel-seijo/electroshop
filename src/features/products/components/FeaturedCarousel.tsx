"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const isDragging = useRef(false);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      emblaApi?.plugins()?.autoplay?.play();
    },
    [emblaApi]
  );

  const onSelect = useCallback((api: ReturnType<typeof useEmblaCarousel>[1]) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("reInit", () => setScrollSnaps(emblaApi.scrollSnapList()));
    emblaApi.on("pointerDown", () => {
      isDragging.current = false;
    });
    // @ts-expect-error pointerMove exists at runtime but not in embla types
    emblaApi.on("pointerMove", () => {
      isDragging.current = true;
    });

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleMouseEnter = useCallback(() => {
    emblaApi?.plugins()?.autoplay?.stop();
  }, [emblaApi]);

  const handleMouseLeave = useCallback(() => {
    emblaApi?.plugins()?.autoplay?.play();
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return (
      <div className={styles.fc} role="status">
        <p className={styles["fc-empty"]}>
          No hay productos destacados en este momento.
        </p>
      </div>
    );
  }

  return (
    <section
      className={styles.fc}
      aria-roledescription="carrusel"
      aria-label="Productos destacados"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles["fc-viewport"]} ref={emblaRef}>
        <div className={styles["fc-container"]}>
          {products.map((product) => (
            <div
              className={styles["fc-slide"]}
              key={product.id}
              onClickCapture={(e) => {
                if (isDragging.current) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div
        className={styles["fc-dots"]}
        role="tablist"
        aria-label="Navegación del carrusel"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`${styles["fc-dot"]} ${index === selectedIndex ? styles["fc-dot--active"] : ""}`}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Ir a grupo de productos ${index + 1}`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
