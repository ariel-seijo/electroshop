"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "./ProductCard";

export interface Product {
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

export interface FeaturedCarouselProps {
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
      <div className="relative w-full max-w-[1200px] mx-auto mb-6 px-4" role="status">
        <p className="text-center text-text-dim py-12 px-4">
          No hay productos destacados en este momento.
        </p>
      </div>
    );
  }

  return (
    <section
      className="relative w-full max-w-[1200px] mx-auto mb-6 px-4"
      aria-roledescription="carrusel"
      aria-label="Productos destacados"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden py-2 pb-[10px] md:py-2.5 md:pb-[14px] lg:py-3 lg:pb-4 motion-reduce:overflow-x-auto motion-reduce:[scroll-snap-type:x_mandatory]" ref={emblaRef}>
        <div className="flex ml-[-0.5rem]">
          {products.map((product) => (
            <div
              className="flex-[0_0_100%] min-w-0 pl-2 min-[660px]:flex-[0_0_50%] min-[999px]:flex-[0_0_33.333%] min-[1300px]:flex-[0_0_25%] motion-reduce:[scroll-snap-align:start]"
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
        className="flex justify-center items-center gap-2.5 mt-4"
        role="tablist"
        aria-label="Navegación del carrusel"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`size-2.5 rounded-full border-none p-0 cursor-pointer transition-[background,transform] duration-200 ease-linear hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
              index === selectedIndex
                ? "bg-accent scale-[1.3]"
                : "bg-white/15"
            }`}
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
