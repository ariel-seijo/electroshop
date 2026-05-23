"use client";

import { useState } from "react";
import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/lib/utils/cloudinary-url";

interface GalleryImage {
  url: string;
  blurDataURL?: string;
  width: number;
  height: number;
  format: string;
}

interface ProductGalleryProps {
  product: {
    imagesRel?: GalleryImage[];
    thumbnail: string;
    title: string;
  };
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const imagesRel = product?.imagesRel || [];
  const thumbnail = product?.thumbnail;

  const images: GalleryImage[] = [];

  if (thumbnail) {
    images.push({
      url: thumbnail,
      blurDataURL: "",
      width: 700,
      height: 700,
      format: "jpg",
    });
  }

  imagesRel
    .filter((img) => img.url !== thumbnail)
    .forEach((img) =>
      images.push({
        url: img.url,
        blurDataURL: img.blurDataURL || "",
        width: img.width,
        height: img.height,
        format: img.format,
      })
    );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-22 border border-border-38 rounded-md flex flex-col items-center justify-center gap-[0.6rem] text-[rgb(80,80,80)] text-[0.82rem] font-semibold tracking-[0.3px]">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>Sin imagen disponible</span>
      </div>
    );
  }

  const current = images[selectedIndex];
  const hasBlur =
    current.blurDataURL && current.blurDataURL.startsWith("data:");

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`relative bg-surface-22 border border-border-38 rounded-md aspect-square overflow-hidden cursor-crosshair flex items-center justify-center transition-colors duration-[250ms] hover:border-accent/30 ${
          isZoomed ? "cursor-zoom-out [&>img]:scale-[1.8]" : ""
        } [&>img]:object-contain [&>img]:transition-transform [&>img]:duration-[200ms] [&>img]:ease-out`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {!hasBlur && <div className="absolute inset-0 bg-surface-18 z-0" aria-hidden="true" />}

        <Image
          src={optimizeCloudinaryUrl(current.url)}
          alt={product.title}
          width={current.width || 700}
          height={current.height || 700}
          placeholder={hasBlur ? "blur" : undefined}
          blurDataURL={hasBlur ? current.blurDataURL : undefined}
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="relative z-[1]"
          style={
            isZoomed
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : undefined
          }
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-[0.6rem] overflow-x-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="Miniaturas del producto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`w-[76px] h-[76px] shrink-0 bg-surface-22 border-2 rounded p-[0.3rem] cursor-pointer flex items-center justify-center transition-[border-color,box-shadow,transform] duration-[200ms] hover:border-[rgb(80,80,80)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
                i === selectedIndex
                  ? "border-accent shadow-[0_0_14px_rgba(36,171,243,0.25)]"
                  : "border-border-38"
              }`}
              onClick={() => setSelectedIndex(i)}
              aria-label={`Ver imagen ${i + 1} de ${images.length}`}
              aria-current={i === selectedIndex ? "true" : undefined}
            >
              <Image
                src={optimizeCloudinaryUrl(img.url)}
                alt=""
                width={80}
                height={80}
                sizes="80px"
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
