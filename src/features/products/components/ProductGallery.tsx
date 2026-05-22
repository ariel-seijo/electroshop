"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../styles/ProductGallery.module.css";
import { optimizeCloudinaryUrl } from "@/lib/utils/cloudinary-url";

interface GalleryImage {
  url: string;
  width: number;
  height: number;
  format: string;
  blurDataURL?: string;
}

interface ProductGalleryProps {
  product: {
    imagesRel?: GalleryImage[];
    thumbnail: string;
    title: string;
  };
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.imagesRel && product.imagesRel.length > 0 ? product.imagesRel : [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : [{ url: product.thumbnail, width: 600, height: 600, format: "jpg" }];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          src={optimizeCloudinaryUrl(displayImages[selectedIndex].url)}
          alt={`${product.title} - Imagen ${selectedIndex + 1}`}
          fill
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className={styles.thumbs}>
          {displayImages.map((img, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${i === selectedIndex ? styles.thumbActive : ""}`}
              onClick={() => setSelectedIndex(i)}
            >
              <Image
                src={optimizeCloudinaryUrl(img.url)}
                alt={`${product.title} - Thumbnail ${i + 1}`}
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
