"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/features/cart";
import { formatPrice } from "@/lib/utils/currency";
import type { SerializedProduct } from "@/types/product";
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

type ProductPageProduct = SerializedProduct;

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
  const discount = hasDiscount && product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const formattedPrice = formatPrice(product.price);
  const formattedOldPrice = hasDiscount && product.oldPrice ? formatPrice(product.oldPrice) : null;
  const formattedSavings = hasDiscount && product.oldPrice ? formatPrice(product.oldPrice - product.price) : null;

  const handleAdd = () => {
    addToCart(product as unknown as CartItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const tagBase = "inline-flex items-center gap-[0.3rem] text-[0.7rem] font-semibold uppercase tracking-[0.5px] px-[0.65rem] py-[0.35rem]";

  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 py-8 pb-16 text-text-body max-3lg:px-[0.8rem] max-3lg:py-4 max-3lg:pb-12">
      <nav className="flex flex-wrap items-center gap-[0.35rem] text-[0.8rem] font-semibold text-text-placeholder mb-8 max-ms:text-[0.72rem] [&>a]:text-text-muted [&>a]:no-underline [&>a]:transition-colors [&>a]:duration-200 [&>a:hover]:text-accent [&>svg]:shrink-0 [&>span:last-child]:text-text-secondary">
        <Link href="/">Inicio</Link>
        <ChevronRight size={14} />
        <Link href={product.category ? `/category/${product.category.name.toLowerCase()}` : "#"}>
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span>{product.title}</span>
      </nav>

      <section className="grid grid-cols-[1.05fr_1fr] gap-12 mb-16 max-3xl:grid-cols-1 max-3xl:gap-8">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-[1.2rem]">
          <div className="flex flex-wrap gap-2">
            {isOutOfStock ? (
              <span className={`${tagBase} bg-danger/10 border border-danger/25 text-danger`}>Agotado</span>
            ) : isLowStock ? (
              <span className={`${tagBase} bg-warning/10 border border-warning/25 text-warning`}>Últimas {product.stock} unidades</span>
            ) : (
              <span className={`${tagBase} bg-success/10 border border-success/25 text-success`}><Check size={14} />En stock</span>
            )}
            <span className={`${tagBase} bg-border-34 border border-border-52 text-text-muted`}>{product.brand}</span>
            {product.featured && (
              <span className={`${tagBase} bg-accent/10 border border-accent/25 text-accent`}>Destacado</span>
            )}
          </div>

          <h1 className="text-[2rem] leading-[1.1] font-semibold m-0 text-[rgb(230,230,230)] max-3lg:text-[1.5rem]">{product.title}</h1>

          <div className="flex items-center gap-2 text-[0.85rem] text-[rgb(170,170,170)]">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.rating) ? "#24abf3" : "none"}
                  color={i < Math.round(product.rating) ? "#24abf3" : "rgb(80,80,80)"}
                />
              ))}
            </div>
            <span className="font-semibold text-accent">{product.rating.toFixed(1)}</span>
            <span className="text-[rgb(80,80,80)]">|</span>
            <span className="text-text-subtle">{product.sold} vendidos</span>
          </div>

          <div className="flex flex-col gap-[0.3rem]">
            <div className="flex items-center flex-wrap gap-[0.7rem]">
              <span className="text-[2.2rem] font-semibold text-accent max-3lg:text-[1.7rem]">{formattedPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-[1.1rem] text-text-subtle line-through">{formattedOldPrice}</span>
                  <span className="text-xs font-semibold px-[0.6rem] py-[0.3rem] bg-danger/10 border border-danger/30 text-danger tracking-[0.5px]">-{discount}%</span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="m-0 text-[0.8rem] text-success font-semibold">Ahorrás {formattedSavings} ({discount}% OFF)</p>
            )}
          </div>

          <p className="text-text-tertiary leading-[1.7] text-[0.95rem] m-0">{product.description}</p>

          <div className="grid grid-cols-2 gap-[0.7rem] max-3lg:grid-cols-1">
            <div className="flex items-center gap-[0.7rem] bg-surface-26 border border-border-38 px-4 py-[0.9rem] [&>svg]:text-accent [&>svg]:shrink-0">
              <PackageOpen size={18} />
              <div>
                <span className="block text-[0.68rem] font-semibold uppercase text-text-subtle tracking-[0.5px] mb-[0.15rem]">SKU</span>
                <strong className="text-[0.85rem] font-semibold text-text-body">{product.sku}</strong>
              </div>
            </div>
            <div className="flex items-center gap-[0.7rem] bg-surface-26 border border-border-38 px-4 py-[0.9rem] [&>svg]:text-accent [&>svg]:shrink-0">
              <ShieldCheck size={18} />
              <div>
                <span className="block text-[0.68rem] font-semibold uppercase text-text-subtle tracking-[0.5px] mb-[0.15rem]">Garantía</span>
                <strong className="text-[0.85rem] font-semibold text-text-body">12 meses</strong>
              </div>
            </div>
            <div className="flex items-center gap-[0.7rem] bg-surface-26 border border-border-38 px-4 py-[0.9rem] [&>svg]:text-accent [&>svg]:shrink-0">
              <Truck size={18} />
              <div>
                <span className="block text-[0.68rem] font-semibold uppercase text-text-subtle tracking-[0.5px] mb-[0.15rem]">Stock</span>
                <strong className="text-[0.85rem] font-semibold text-text-body">{product.stock > 0 ? `${product.stock} unidades` : "Sin stock"}</strong>
              </div>
            </div>
            <div className="flex items-center gap-[0.7rem] bg-surface-26 border border-border-38 px-4 py-[0.9rem] [&>svg]:text-accent [&>svg]:shrink-0">
              <RotateCcw size={18} />
              <div>
                <span className="block text-[0.68rem] font-semibold uppercase text-text-subtle tracking-[0.5px] mb-[0.15rem]">Devolución</span>
                <strong className="text-[0.85rem] font-semibold text-text-body">30 días</strong>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-stretch max-3lg:flex-col">
            <div className="flex items-center border border-border-52 bg-surface-20 max-3lg:h-12">
              <button
                className="flex items-center justify-center w-11 h-full bg-transparent border-none text-text-tertiary cursor-pointer transition-all duration-200 hover:not-disabled:text-accent hover:not-disabled:bg-accent/10 disabled:text-[rgb(80,80,80)] disabled:cursor-not-allowed"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-base font-semibold text-text-body max-3lg:flex-1">{quantity}</span>
              <button
                className="flex items-center justify-center w-11 h-full bg-transparent border-none text-text-tertiary cursor-pointer transition-all duration-200 hover:not-disabled:text-accent hover:not-disabled:bg-accent/10 disabled:text-[rgb(80,80,80)] disabled:cursor-not-allowed"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-[0.95rem] border-none text-[0.9rem] font-semibold uppercase tracking-[1px] cursor-pointer transition-all duration-300 ${
                isInCart
                  ? "bg-none bg-success/10 border border-success/25 text-success hover:bg-success/15 hover:shadow-[0_0_18px_rgba(34,197,94,0.18)]"
                  : added
                    ? "bg-none bg-success text-[#111] animate-added-pulse"
                    : "bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] hover:not-disabled:shadow-[0_0_28px_rgba(0,127,255,0.4)] hover:not-disabled:-translate-y-0.5"
              } ${isOutOfStock || isMaxReached ? "opacity-40 cursor-not-allowed bg-border-52 text-text-dim shadow-none" : ""}`}
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

          <div className="flex flex-col gap-2 p-4 bg-surface-20 border border-border-34">
            <div className="flex items-center gap-[0.6rem] text-[0.82rem] text-text-muted [&>svg]:text-accent [&>svg]:shrink-0">
              <Truck size={16} />
              <span>Envío gratis en compras superiores a $50.000</span>
            </div>
            <div className="flex items-center gap-[0.6rem] text-[0.82rem] text-text-muted [&>svg]:text-accent [&>svg]:shrink-0">
              <ShieldCheck size={16} />
              <span>Garantía oficial del fabricante</span>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center justify-between mb-[1.2rem]">
            <h2 className="text-[1.3rem] font-semibold text-text-body m-0">Productos similares</h2>
            <Link
              href={product.category ? `/category/${product.category.name.toLowerCase()}` : "#"}
              className="inline-flex items-center gap-[0.3rem] text-[0.82rem] font-semibold text-accent no-underline uppercase tracking-[0.5px] transition-opacity duration-200 hover:opacity-80"
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4 max-3xl:grid-cols-2 max-3lg:grid-cols-2 max-3lg:gap-[0.7rem] max-ms:grid-cols-2">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
