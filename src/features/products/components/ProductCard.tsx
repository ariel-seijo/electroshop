"use client";

import styles from "../styles/ProductCard.module.css";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Check, Flame } from "lucide-react";
import { useCart, type CartItem } from "@/features/cart";
import { formatPrice } from "@/lib/utils/currency";
import { optimizeCloudinaryUrl } from "@/lib/utils/cloudinary-url";

interface ProductCardProduct {
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

interface ProductCardProps {
  product: ProductCardProduct;
  view?: "grid" | "list";
  priority?: boolean;
}

export default function ProductCard({ product, view = "grid", priority = false }: ProductCardProps) {
  const { addToCart, cart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const cartQty = cart.find((item) => item.id === product.id)?.quantity ?? 0;
  const isMaxReached = cartQty >= product.stock;
  const isInCart = cartQty > 0;
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const formattedPrice = formatPrice(product.price);
  const formattedOldPrice =
    product.oldPrice && product.oldPrice > product.price ? formatPrice(product.oldPrice) : null;

  const buyLabel = isMaxReached
    ? `${product.title} - stock máximo alcanzado`
    : isInCart
      ? `${product.title} ya está en el carrito`
      : isOutOfStock
        ? `${product.title} sin stock disponible`
        : `Añadir ${product.title} al carrito`;

  return (
    <li className={`${styles.card} ${view === "list" ? styles.list : ""}`}>
      <Link
        href={`/product/${product.slug}`}
        className={styles.cardLink}
        aria-label={`Ver detalles de ${product.title}`}
      >
        <div className={styles["img-container"]}>
          <Image
            src={optimizeCloudinaryUrl(product.thumbnail)}
            alt={`${product.title} - ${product.brand}`}
            fill
            sizes="(max-width: 480px) 90vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />

          {discountPercent > 0 && (
            <span className={styles["discount-badge"]} aria-label={`${discountPercent} por ciento de descuento`}>
              -{discountPercent}%
            </span>
          )}

          {isOutOfStock && (
            <span className={`${styles["stock-badge"]} ${styles.out}`} role="status">
              AGOTADO
            </span>
          )}
          {isLowStock && (
            <span className={`${styles["stock-badge"]} ${styles.low}`} role="status">
              {product.stock} disponibles
            </span>
          )}
          {product.featured && !isOutOfStock && (
            <span className={styles["featured-badge"]}>
              <Flame size={12} aria-hidden="true" />
              DESTACADO
            </span>
          )}
        </div>

        <div className={styles.meta}>
          <div className={styles.topMeta}>
            <span className={styles.category}>{product.category?.name}</span>
            <span className={styles.brand}>{product.brand}</span>
          </div>

          <h3 className={styles.title}>{product.title}</h3>

          <div className={styles.ratingRow}>
            <div className={styles.stars} aria-label={`${product.rating} de 5 estrellas`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  aria-hidden="true"
                  fill={i < Math.floor(product.rating) ? "#24abf3" : "none"}
                  color={i < Math.floor(product.rating) ? "#24abf3" : "rgb(80, 80, 80)"}
                />
              ))}
            </div>
            <span>{product.rating.toFixed(1)}</span>
            <small>({product.sold} vendidos)</small>
          </div>

          <div className={styles.priceBlock}>
            {formattedOldPrice && (
              <span className={styles.oldPrice} aria-label={`Precio anterior ${formattedOldPrice}`}>
                {formattedOldPrice}
              </span>
            )}
            <span className={styles.price} aria-label={`Precio actual ${formattedPrice}`}>
              {formattedPrice}
            </span>
          </div>
        </div>
      </Link>

      <button
        className={`${styles["buy-btn"]} ${isInCart ? styles["in-cart"] : ""} ${isOutOfStock ? styles["out-stock"] : ""} ${isMaxReached ? styles["in-cart"] : ""}`}
        onClick={(e) => {
          e.preventDefault();
          addToCart(product as unknown as CartItem);
        }}
        disabled={isOutOfStock || isMaxReached}
        aria-label={buyLabel}
        aria-disabled={isOutOfStock || isMaxReached}
      >
        <span className={styles.content}>
          {isMaxReached ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span className={styles.text}>Máx. alcanzado</span>
            </>
          ) : isInCart ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span className={styles.text}>Añadido</span>
            </>
          ) : isOutOfStock ? (
            <span className={styles.text}>Sin stock</span>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden="true" />
              <span className={styles.text}>Añadir al carrito</span>
            </>
          )}
        </span>
      </button>
    </li>
  );
}
