"use client";

import cardStyles from "@/features/products/styles/ProductCard.module.css";
import { ShoppingCart, Star, Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";

interface ProductCardPreviewProduct {
  thumbnail?: string;
  title?: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  sold: number;
  featured: boolean;
  category?: { name: string } | null;
}

interface ProductCardPreviewProps {
  product: ProductCardPreviewProduct;
}

export default function ProductCardPreview({ product }: ProductCardPreviewProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const formattedPrice = formatPrice(product.price);
  const formattedOldPrice =
    product.oldPrice && product.oldPrice > product.price ? formatPrice(product.oldPrice) : null;

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardLink}>
        <div className={cardStyles["img-container"]}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title || "Producto"}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgb(70, 70, 70)",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              Sin imagen
            </div>
          )}

          {discountPercent > 0 && (
            <span
              className={cardStyles["discount-badge"]}
            >
              -{discountPercent}%
            </span>
          )}

          {isOutOfStock && (
            <span
              className={`${cardStyles["stock-badge"]} ${cardStyles.out}`}
            >
              AGOTADO
            </span>
          )}
          {isLowStock && (
            <span
              className={`${cardStyles["stock-badge"]} ${cardStyles.low}`}
            >
              {product.stock} disponibles
            </span>
          )}
          {product.featured && !isOutOfStock && (
            <span className={cardStyles["featured-badge"]}>
              <Flame size={12} aria-hidden="true" />
              DESTACADO
            </span>
          )}
        </div>

        <div className={cardStyles.meta}>
          <div className={cardStyles.topMeta}>
            <span className={cardStyles.category}>
              {product.category?.name || "Categoría"}
            </span>
            <span className={cardStyles.brand}>
              {product.brand || "Marca"}
            </span>
          </div>

          <h3 className={cardStyles.title}>
            {product.title || "Título del producto"}
          </h3>

          <div className={cardStyles.ratingRow}>
            <div className={cardStyles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  aria-hidden="true"
                  fill={i < Math.floor(product.rating) ? "#24abf3" : "none"}
                  color={
                    i < Math.floor(product.rating)
                      ? "#24abf3"
                      : "rgb(80, 80, 80)"
                  }
                />
              ))}
            </div>
            <span>{(product.rating ?? 0).toFixed(1)}</span>
            <small>({product.sold ?? 0} vendidos)</small>
          </div>

          <div className={cardStyles.priceBlock}>
            {formattedOldPrice && (
              <span className={cardStyles.oldPrice}>
                {formattedOldPrice}
              </span>
            )}
            <span className={cardStyles.price}>
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      <button
        className={cardStyles["buy-btn"]}
        disabled
        aria-disabled="true"
      >
        <span className={cardStyles.content}>
          <ShoppingCart size={16} aria-hidden="true" />
          <span className={cardStyles.text}>Añadir al carrito</span>
        </span>
      </button>
    </div>
  );
}
