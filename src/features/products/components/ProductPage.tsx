"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/features/cart";
import styles from "../styles/ProductPage.module.css";
import { formatPrice } from "@/lib/utils/currency";
import ProductCard from "./ProductCard";
import ProductGallery from "./ProductGallery";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Check,
  Minus,
  Plus,
  PackageOpen,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

interface ProductPageProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
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
  category: { id: number; name: string };
  imagesRel?: { url: string; width: number; height: number; format: string; blurDataURL?: string }[];
}

interface ProductPageProps {
  product: ProductPageProduct;
  relatedProducts: ProductPageProduct[];
}

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  const { addToCart, cart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isInCart = cart.some((item) => item.id === product.id);
  const cartQty = cart.find((item) => item.id === product.id)?.quantity ?? 0;
  const isMaxReached = cartQty >= product.stock;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const formattedPrice = formatPrice(product.price);
  const formattedOldPrice = hasDiscount ? formatPrice(product.oldPrice!) : null;
  const formattedSavings = hasDiscount ? formatPrice(product.oldPrice! - product.price) : null;

  const handleAdd = () => {
    addToCart(product as unknown as CartItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className={styles["product-page"]}>
      <nav className={styles["pp-breadcrumb"]}>
        <Link href="/">Inicio</Link>
        <ChevronRight size={14} />
        <Link href={`/category/${product.category.name.toLowerCase()}`}>
          {product.category.name}
        </Link>
        <ChevronRight size={14} />
        <span>{product.title}</span>
      </nav>

      <section className={styles["pp-hero"]}>
        <ProductGallery product={product} />

        <div className={styles["pp-info"]}>
          <div className={styles["pp-tags"]}>
            {isOutOfStock ? (
              <span className={`${styles["pp-tag"]} ${styles["pp-tag-out"]}`}>Agotado</span>
            ) : isLowStock ? (
              <span className={`${styles["pp-tag"]} ${styles["pp-tag-low"]}`}>
                Últimas {product.stock} unidades
              </span>
            ) : (
              <span className={`${styles["pp-tag"]} ${styles["pp-tag-stock"]}`}>
                <Check size={14} />
                En stock
              </span>
            )}

            <span className={`${styles["pp-tag"]} ${styles["pp-tag-brand"]}`}>{product.brand}</span>

            {product.featured && (
              <span className={`${styles["pp-tag"]} ${styles["pp-tag-featured"]}`}>Destacado</span>
            )}
          </div>

          <h1 className={styles["pp-title"]}>{product.title}</h1>

          <div className={styles["pp-rating"]}>
            <div className={styles["pp-stars"]}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.rating) ? "#24abf3" : "none"}
                  color={i < Math.round(product.rating) ? "#24abf3" : "rgb(80,80,80)"}
                />
              ))}
            </div>
            <span className={styles["pp-rating-value"]}>{product.rating.toFixed(1)}</span>
            <span className={styles["pp-rating-sep"]}>|</span>
            <span className={styles["pp-rating-sold"]}>{product.sold} vendidos</span>
          </div>

          <div className={styles["pp-price-box"]}>
            <div className={styles["pp-price-main"]}>
              <span className={styles["pp-price"]}>
                {formattedPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className={styles["pp-old-price"]}>
                    {formattedOldPrice}
                  </span>
                  <span className={styles["pp-discount"]}>-{discount}%</span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className={styles["pp-savings"]}>
                Ahorrás {formattedSavings} ({discount}% OFF)
              </p>
            )}
          </div>

          <p className={styles["pp-description"]}>{product.description}</p>

          <div className={styles["pp-meta"]}>
            <div className={styles["pp-meta-box"]}>
              <PackageOpen size={18} />
              <div>
                <span className={styles["pp-meta-label"]}>SKU</span>
                <strong className={styles["pp-meta-value"]}>{product.sku}</strong>
              </div>
            </div>
            <div className={styles["pp-meta-box"]}>
              <ShieldCheck size={18} />
              <div>
                <span className={styles["pp-meta-label"]}>Garantía</span>
                <strong className={styles["pp-meta-value"]}>12 meses</strong>
              </div>
            </div>
            <div className={styles["pp-meta-box"]}>
              <Truck size={18} />
              <div>
                <span className={styles["pp-meta-label"]}>Stock</span>
                <strong className={styles["pp-meta-value"]}>
                  {product.stock > 0 ? `${product.stock} unidades` : "Sin stock"}
                </strong>
              </div>
            </div>
            <div className={styles["pp-meta-box"]}>
              <RotateCcw size={18} />
              <div>
                <span className={styles["pp-meta-label"]}>Devolución</span>
                <strong className={styles["pp-meta-value"]}>30 días</strong>
              </div>
            </div>
          </div>

          <div className={styles["pp-actions"]}>
            <div className={styles["pp-qty"]}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className={`${styles["pp-add-btn"]} ${added ? styles.added : ""} ${isInCart ? styles["in-cart"] : ""}`}
              onClick={handleAdd}
              disabled={isOutOfStock || isMaxReached}
            >
              {isMaxReached ? (
                "Máx. alcanzado"
              ) : added ? (
                <>
                  <Check size={18} />
                  Añadido
                </>
              ) : isOutOfStock ? (
                "Sin stock"
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>

          <div className={styles["pp-features"]}>
            <div className={styles["pp-feature-item"]}>
              <Truck size={16} />
              <span>
                Envío gratis en compras superiores a $50.000
              </span>
            </div>
            <div className={styles["pp-feature-item"]}>
              <ShieldCheck size={16} />
              <span>Garantía oficial del fabricante</span>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className={styles["pp-related"]}>
          <div className={styles["pp-related-header"]}>
            <h2 className={styles["pp-related-title"]}>Productos similares</h2>
            <Link
              href={`/category/${product.category.name.toLowerCase()}`}
              className={styles["pp-related-link"]}
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className={styles["pp-related-grid"]}>
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
