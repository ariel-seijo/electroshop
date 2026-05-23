"use client";

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
    <div className="flex flex-col h-full justify-between bg-[linear-gradient(160deg,rgb(24,24,24)_0%,rgb(18,18,18)_100%)] border border-white/5 rounded-md relative overflow-visible transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-within:border-white/20 focus-within:shadow-[0_8px_25px_rgba(0,0,0,0.4)] md:rounded-lg lg:rounded-lg">
      <div className="flex flex-col flex-1 no-underline text-inherit outline-none rounded p-[0.4rem] pb-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:rounded ms:p-3 ms:pb-0 md:p-4 md:pb-0 lg:px-[1.2rem] lg:pt-[1.2rem] lg:pb-0">
        <div className="relative w-full aspect-square overflow-hidden flex justify-center items-center bg-[radial-gradient(circle_at_center,rgb(22,22,22)_0%,rgb(14,14,14)_100%)] rounded ms:rounded-[5px] md:rounded-md after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(36,171,243,0.04)_0%,transparent_70%)] after:opacity-0 after:transition-opacity after:duration-[400ms] after:pointer-events-none after:z-[3] hover:after:opacity-100 group-hover:after:opacity-100">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title || "Producto"}
              className="w-full h-full object-contain block transition-[transform,filter] duration-[450ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[rgb(70,70,70)] text-[0.78rem] font-semibold"
            >
              Sin imagen
            </div>
          )}

          {discountPercent > 0 && (
            <span className="absolute top-1 left-1 px-[0.3rem] py-[0.08rem] bg-gradient-to-br from-danger to-danger-hover text-white text-[0.6rem] font-semibold tracking-[0.5px] rounded-full z-[4] shadow-[0_2px_8px_rgba(239,68,68,0.3)] ms:top-[0.35rem] ms:left-[0.35rem] ms:px-[0.4rem] ms:py-[0.12rem] md:top-[0.45rem] md:left-[0.45rem] md:text-[0.7rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:left-[0.55rem] lg:px-[0.55rem] lg:py-[0.2rem] lg:shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
              -{discountPercent}%
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute top-1 right-1 px-[0.3rem] py-[0.08rem] text-[0.52rem] font-semibold uppercase tracking-[0.8px] rounded-full z-[4] bg-danger/10 text-danger border border-danger/25 ms:top-[0.35rem] ms:right-[0.35rem] ms:text-[0.54rem] md:top-[0.45rem] md:right-[0.45rem] md:text-[0.56rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:right-[0.55rem] lg:text-[0.6rem] lg:px-2 lg:py-[0.2rem]">
              AGOTADO
            </span>
          )}
          {isLowStock && (
            <span className="absolute top-1 right-1 px-[0.3rem] py-[0.08rem] text-[0.52rem] font-semibold uppercase tracking-[0.8px] rounded-full z-[4] bg-warning/10 text-warning border border-warning/25 ms:top-[0.35rem] ms:right-[0.35rem] ms:text-[0.54rem] md:top-[0.45rem] md:right-[0.45rem] md:text-[0.56rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:right-[0.55rem] lg:text-[0.6rem] lg:px-2 lg:py-[0.2rem]">
              {product.stock} disponibles
            </span>
          )}
          {product.featured && !isOutOfStock && (
            <span className="absolute bottom-1 left-1 px-[0.28rem] py-[0.08rem] bg-accent/10 border border-accent/20 text-accent text-[0.5rem] font-semibold tracking-[0.8px] uppercase flex items-center gap-[0.12rem] rounded-full z-[4] shadow-[0_0_10px_rgba(36,171,243,0.12)] ms:bottom-[0.35rem] ms:left-[0.35rem] ms:text-[0.54rem] md:bottom-[0.45rem] md:left-[0.45rem] md:text-[0.56rem] md:px-[0.4rem] md:py-[0.15rem] md:gap-[0.25rem] lg:bottom-[0.55rem] lg:left-[0.55rem] lg:text-[0.58rem] lg:px-[0.45rem] lg:py-[0.2rem] [&>svg]:w-[9px] [&>svg]:h-[9px] [&>svg]:animate-[flamePulse_1.5s_ease-in-out_infinite] md:[&>svg]:w-[11px] md:[&>svg]:h-[11px] lg:[&>svg]:size-3">
              <Flame size={12} aria-hidden="true" />
              DESTACADO
            </span>
          )}
        </div>

        <div className="flex flex-col gap-[0.3rem] pt-2 ms:gap-[0.35rem] ms:pt-[0.6rem] md:gap-[0.42rem] md:pt-[0.7rem] lg:gap-2 lg:pt-[0.85rem]">
          <div className="flex flex-row items-center gap-[0.4rem]">
            <span className="text-[0.62rem] font-semibold text-accent uppercase tracking-[0.4px] ms:text-[0.65rem] md:text-[0.68rem] md:tracking-[0.5px] lg:text-[0.7rem]">
              {product.category?.name || "Categoría"}
            </span>
            <span className="text-[0.62rem] font-semibold text-text-dim uppercase tracking-[0.4px] ms:text-[0.65rem] md:text-[0.68rem] md:tracking-[0.5px] lg:text-[0.7rem]">
              {product.brand || "Marca"}
            </span>
          </div>

          <h3 className="text-[0.78rem] font-semibold text-[rgb(215,215,215)] leading-[1.35] line-clamp-2 m-0 min-h-[calc(1.35em*2)] ms:text-[0.84rem] md:text-[0.9rem] md:leading-[1.4] lg:text-[0.92rem]">
            {product.title || "Título del producto"}
          </h3>

          <div className="flex items-center gap-[0.18rem] text-[0.7rem] text-text-tertiary ms:gap-[0.25rem] ms:text-[0.72rem] md:gap-[0.3rem] md:text-[0.78rem] [&>svg]:w-2.5 [&>svg]:h-2.5 ms:[&>svg]:size-3 md:[&>svg]:size-3 [&>small]:text-text-placeholder [&>small]:text-[0.64rem] ms:[&>small]:text-[0.66rem] md:[&>small]:text-[0.7rem]">
            <div className="flex gap-0">
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
            <span>{(product.rating ?? 0).toFixed(1)}</span>
            <small>({product.sold ?? 0} vendidos)</small>
          </div>

          <div className="flex flex-col items-start gap-[0.1rem] md:gap-[0.15rem]">
            {formattedOldPrice && (
              <span className="text-[0.62rem] text-text-placeholder line-through font-semibold break-words ms:text-[0.66rem] md:text-[0.7rem] lg:text-[0.72rem]">
                {formattedOldPrice}
              </span>
            )}
            <span className="text-[0.85rem] font-semibold text-accent [text-shadow:0_0_12px_rgba(36,171,243,0.2)] break-words ms:text-[0.92rem] md:text-[1.1rem] lg:text-[1.2rem] lg:[text-shadow:0_0_18px_rgba(36,171,243,0.25)]">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      <button
        className="mx-[0.4rem] my-[0.4rem] w-[calc(100%-0.8rem)] py-[0.42rem] px-[0.4rem] border border-transparent rounded-[5px] bg-gradient-to-br from-brand to-brand-end text-[rgb(17,17,17)] font-semibold text-[0.66rem] uppercase tracking-[0.4px] cursor-pointer flex justify-center items-center overflow-hidden relative min-h-[34px] shadow-[0_0_16px_rgba(0,127,255,0.2)] transition-[background,border-color,color,box-shadow,transform] duration-300 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:rounded-[5px] not-disabled:hover:bg-[linear-gradient(135deg,#0090ff,#30d8ff)] not-disabled:hover:text-[rgb(17,17,17)] not-disabled:hover:shadow-[0_0_28px_rgba(0,127,255,0.4)] not-disabled:hover:-translate-y-px not-disabled:active:scale-[0.97] not-disabled:active:transition-transform not-disabled:active:duration-[100ms] disabled:cursor-not-allowed ms:py-[0.55rem] ms:text-[0.72rem] ms:rounded-md ms:min-h-10 ms:mx-3 ms:my-[0.45rem] ms:mb-3 ms:w-[calc(100%-1.5rem)] md:py-[0.65rem] md:text-[0.76rem] md:min-h-[42px] md:mx-4 md:my-2 md:mb-4 md:w-[calc(100%-2rem)] lg:py-[0.72rem] lg:text-[0.8rem] lg:min-h-11 lg:mx-[1.2rem] lg:my-[0.6rem] lg:mb-[1.2rem] lg:w-[calc(100%-2.4rem)] [&>span]:flex [&>span]:items-center [&>span]:gap-[0.25rem] [&>span]:transition-all [&>span]:duration-[250ms] [&>span]:relative [&>span]:z-[1] [&>span>svg]:w-[13px] [&>span>svg]:h-[13px] [&>span>svg]:shrink-0 ms:[&>span>svg]:size-[15px] md:[&>span>svg]:size-4"
        disabled
        aria-disabled="true"
      >
        <span>
          <ShoppingCart size={16} aria-hidden="true" />
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.4px] whitespace-nowrap">Añadir al carrito</span>
        </span>
      </button>
    </div>
  );
}
