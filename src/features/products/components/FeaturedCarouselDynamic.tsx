"use client";

import dynamic from "next/dynamic";
import CarouselSkeleton from "./CarouselSkeleton";
import type { FeaturedCarouselProps } from "./FeaturedCarousel";
export type { Product } from "./FeaturedCarousel";

const FeaturedCarousel = dynamic(
  () => import("./FeaturedCarousel"),
  {
    ssr: false,
    loading: () => <CarouselSkeleton />,
  }
);

export default function FeaturedCarouselDynamic(props: FeaturedCarouselProps) {
  return <FeaturedCarousel {...props} />;
}
