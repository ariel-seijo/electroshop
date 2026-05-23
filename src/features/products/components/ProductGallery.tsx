"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../styles/ProductGallery.module.css";
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
      <div className={styles.empty}>
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
    <div className={styles.gallery}>
      <div
        className={`${styles.main} ${isZoomed ? styles.mainZoomed : ""}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {!hasBlur && <div className={styles.placeholderFallback} aria-hidden="true" />}

        <Image
          src={optimizeCloudinaryUrl(current.url)}
          alt={product.title}
          width={current.width || 700}
          height={current.height || 700}
          placeholder={hasBlur ? "blur" : undefined}
          blurDataURL={hasBlur ? current.blurDataURL : undefined}
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={
            isZoomed
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : undefined
          }
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="list" aria-label="Miniaturas del producto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumb} ${i === selectedIndex ? styles.thumbActive : ""}`}
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
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
