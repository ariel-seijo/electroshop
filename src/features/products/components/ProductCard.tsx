"use client";

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

  const cardBase =
    "group flex flex-col h-full justify-between bg-[linear-gradient(160deg,rgb(24,24,24)_0%,rgb(18,18,18)_100%)] border border-white/[0.06] rounded-md relative overflow-visible transition duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-within:border-white/20 focus-within:shadow-[0_8px_25px_rgba(0,0,0,0.4)] ms:hover:-translate-y-[6px] md:rounded-lg md:hover:-translate-y-[7px] md:hover:shadow-[0_18px_45px_rgba(0,0,0,0.55)] lg:hover:-translate-y-2 lg:hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]";

  const isList = view === "list";

  const btnBase =
    "group/btn mx-[0.4rem] my-[0.4rem] w-[calc(100%-0.8rem)] py-[0.42rem] px-[0.4rem] border rounded-[5px] font-semibold text-[0.66rem] uppercase tracking-[0.4px] cursor-pointer flex justify-center items-center overflow-hidden relative min-h-[34px] transition-all duration-300 ease-linear focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:rounded-[5px] not-disabled:active:scale-[0.97] not-disabled:active:transition-transform not-disabled:active:duration-[100ms] not-disabled:active:ease-linear disabled:cursor-not-allowed ms:py-[0.55rem] ms:text-[0.72rem] ms:rounded-md ms:min-h-10 ms:mx-3 ms:my-[0.45rem] ms:mb-3 ms:w-[calc(100%-1.5rem)] md:py-[0.65rem] md:text-[0.76rem] md:min-h-[42px] md:mx-4 md:my-2 md:mb-4 md:w-[calc(100%-2rem)] lg:py-[0.72rem] lg:text-[0.8rem] lg:min-h-11 lg:mx-[1.2rem] lg:my-[0.6rem] lg:mb-[1.2rem] lg:w-[calc(100%-2.4rem)]";

  const btnState = isInCart
    ? "bg-none bg-success/10 border-success/25 text-success hover:bg-success/15 hover:shadow-[0_0_15px_rgba(34,197,94,0.12)] hover:text-success"
    : "bg-[linear-gradient(135deg,#007fff,#00cfff)] border-transparent text-[rgb(17,17,17)] shadow-[0_0_16px_rgba(0,127,255,0.2)] not-disabled:hover:bg-[linear-gradient(135deg,#0090ff,#30d8ff)] not-disabled:hover:text-[rgb(17,17,17)] not-disabled:hover:shadow-[0_0_28px_rgba(0,127,255,0.4)] not-disabled:hover:-translate-y-px";

  return (
    <li
      className={`${cardBase} ${
        isList
          ? "flex-row items-center gap-4 hover:translate-x-1 hover:-translate-y-0 ms:hover:!-translate-y-0 md:hover:!-translate-y-0 lg:hover:!-translate-y-0 max-3lg:flex-col max-3lg:items-stretch max-3lg:gap-0 max-3lg:hover:-translate-y-[3px] max-3lg:hover:translate-x-0 md:gap-[1.2rem] lg:gap-6"
          : ""
      }`}
    >
      <Link
        href={`/product/${product.slug}`}
        className={`flex flex-col flex-1 no-underline text-inherit outline-none rounded p-[0.4rem] pb-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:rounded ms:p-3 ms:pb-0 md:p-4 md:pb-0 lg:px-[1.2rem] lg:pt-[1.2rem] lg:pb-0 ${
          isList
            ? "flex-row items-center gap-4 flex-1 min-w-0 py-3 pl-4 pr-0 max-3lg:flex-col max-3lg:items-stretch max-3lg:gap-0 max-3lg:py-2 max-3lg:px-2 md:py-4 md:pl-4 lg:py-[1.2rem] lg:pl-[1.2rem]"
            : ""
        }`}
        aria-label={`Ver detalles de ${product.title}`}
      >
        <div className={`relative w-full aspect-square overflow-hidden flex justify-center items-center bg-[radial-gradient(circle_at_center,rgb(22,22,22)_0%,rgb(14,14,14)_100%)] rounded ms:rounded-[5px] md:rounded-md       after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(36,171,243,0.04)_0%,transparent_70%)] after:opacity-0 after:transition-opacity after:duration-[400ms] after:ease-linear after:pointer-events-none after:z-[3] group-hover:after:opacity-100 ${
          isList
            ? "w-[100px] min-w-[100px] aspect-square max-3lg:w-full max-3lg:min-w-0 md:w-[140px] md:min-w-[140px] lg:w-[160px] lg:min-w-[160px]"
            : ""
        }`}>
          <Image
            src={optimizeCloudinaryUrl(product.thumbnail)}
            alt={`${product.title} - ${product.brand}`}
            fill
            sizes="(max-width: 480px) 90vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="w-full h-full object-contain block transition duration-[450ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.06] group-hover:brightness-110 group-hover:contrast-[1.03]"
          />

          {discountPercent > 0 && (
            <span className="absolute top-1 left-1 px-[0.3rem] py-[0.08rem] bg-gradient-to-br from-danger to-danger-hover text-white text-[0.6rem] font-semibold tracking-[0.5px] rounded-full z-[4] shadow-[0_2px_8px_rgba(239,68,68,0.3)] ms:top-[0.35rem] ms:left-[0.35rem] ms:px-[0.4rem] ms:py-[0.12rem] md:top-[0.45rem] md:left-[0.45rem] md:text-[0.7rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:left-[0.55rem] lg:px-[0.55rem] lg:py-[0.2rem] lg:shadow-[0_2px_10px_rgba(239,68,68,0.3)]" aria-label={`${discountPercent} por ciento de descuento`}>
              -{discountPercent}%
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute top-1 right-1 px-[0.3rem] py-[0.08rem] text-[0.52rem] font-semibold uppercase tracking-[0.8px] rounded-full z-[4] bg-danger/[0.12] text-danger border border-danger/25 ms:top-[0.35rem] ms:right-[0.35rem] ms:text-[0.54rem] md:top-[0.45rem] md:right-[0.45rem] md:text-[0.56rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:right-[0.55rem] lg:text-[0.6rem] lg:px-2 lg:py-[0.2rem]" role="status">AGOTADO</span>
          )}
          {isLowStock && (
            <span className="absolute top-1 right-1 px-[0.3rem] py-[0.08rem] text-[0.52rem] font-semibold uppercase tracking-[0.8px] rounded-full z-[4] bg-warning/[0.12] text-warning border border-warning/25 ms:top-[0.35rem] ms:right-[0.35rem] ms:text-[0.54rem] md:top-[0.45rem] md:right-[0.45rem] md:text-[0.56rem] md:px-[0.45rem] md:py-[0.15rem] lg:top-[0.55rem] lg:right-[0.55rem] lg:text-[0.6rem] lg:px-2 lg:py-[0.2rem]" role="status">{product.stock} disponibles</span>
          )}
          {product.featured && !isOutOfStock && (
            <span className="absolute bottom-1 left-1 px-[0.28rem] py-[0.08rem] bg-accent/[0.12] border border-accent/20 text-accent text-[0.5rem] font-semibold tracking-[0.8px] uppercase flex items-center gap-[0.12rem] rounded-full z-[4] shadow-[0_0_10px_rgba(36,171,243,0.12)] ms:bottom-[0.35rem] ms:left-[0.35rem] ms:text-[0.54rem] md:bottom-[0.45rem] md:left-[0.45rem] md:text-[0.56rem] md:px-[0.4rem] md:py-[0.15rem] md:gap-[0.25rem] lg:bottom-[0.55rem] lg:left-[0.55rem] lg:text-[0.58rem] lg:px-[0.45rem] lg:py-[0.2rem] [&>svg]:w-[9px] [&>svg]:h-[9px] [&>svg]:animate-[flamePulse_1.5s_ease-in-out_infinite] md:[&>svg]:size-[11px] lg:[&>svg]:size-3">
              <Flame size={12} aria-hidden="true" />
              DESTACADO
            </span>
          )}
        </div>

        <div className={`flex flex-col gap-[0.3rem] pt-2 ms:gap-[0.35rem] ms:pt-[0.6rem] md:gap-[0.42rem] md:pt-[0.7rem] lg:gap-2 lg:pt-[0.85rem] ${
          isList ? "pt-0 flex-1 min-w-0 max-3lg:pt-[0.4rem]" : ""
        }`}>
          <div className="flex flex-row items-center gap-[0.4rem]">
            <span className="text-[0.62rem] font-semibold text-accent uppercase tracking-[0.4px] ms:text-[0.65rem] md:text-[0.68rem] md:tracking-[0.5px] lg:text-[0.7rem]">{product.category?.name}</span>
            <span className="text-[0.62rem] font-semibold text-text-dim uppercase tracking-[0.4px] ms:text-[0.65rem] md:text-[0.68rem] md:tracking-[0.5px] lg:text-[0.7rem]">{product.brand}</span>
          </div>

          <h3 className={`text-[0.78rem] font-semibold text-[rgb(215,215,215)] leading-[1.35] line-clamp-2 m-0 min-h-[calc(1.35em*2)] ms:text-[0.84rem] md:text-[0.9rem] md:leading-[1.4] lg:text-[0.92rem] ${
            isList ? "line-clamp-1 min-h-0 max-3lg:line-clamp-2 max-3lg:min-h-[calc(1.35em*2)]" : ""
          }`}>{product.title}</h3>

          <div className="flex items-center gap-[0.18rem] text-[0.7rem] text-text-tertiary ms:gap-[0.25rem] ms:text-[0.72rem] md:gap-[0.3rem] md:text-[0.78rem]">
            <div className="flex gap-0 [&>svg]:w-2.5 [&>svg]:h-2.5 ms:[&>svg]:size-3 md:[&>svg]:size-3" aria-label={`${product.rating} de 5 estrellas`}>
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
            <small className="text-text-placeholder text-[0.64rem] ms:text-[0.66rem] md:text-[0.7rem]">({product.sold} vendidos)</small>
          </div>

          <div className="flex flex-col items-start gap-[0.1rem] md:gap-[0.15rem]">
            {formattedOldPrice && (
              <span className="text-[0.62rem] text-text-placeholder line-through font-semibold break-words ms:text-[0.66rem] md:text-[0.7rem] lg:text-[0.72rem]" aria-label={`Precio anterior ${formattedOldPrice}`}>{formattedOldPrice}</span>
            )}
            <span className="text-[0.85rem] font-semibold text-accent [text-shadow:0_0_12px_rgba(36,171,243,0.2)] break-words ms:text-[0.92rem] md:text-[1.1rem] lg:text-[1.2rem] lg:[text-shadow:0_0_18px_rgba(36,171,243,0.25)]" aria-label={`Precio actual ${formattedPrice}`}>{formattedPrice}</span>
          </div>
        </div>
      </Link>

      <button
        className={`${btnBase} ${btnState} ${isOutOfStock ? "opacity-35 cursor-not-allowed" : ""} ${
          isList
            ? "w-auto min-w-[130px] mt-3 mb-3 ml-0 mr-4 shrink-0 max-3lg:w-[calc(100%-1rem)] max-3lg:min-w-0 max-3lg:mx-2 max-3lg:my-[0.35rem] max-3lg:mb-2 md:min-w-[150px] md:my-4 md:ml-0 md:mr-4 lg:min-w-[170px] lg:my-[1.2rem] lg:ml-0 lg:mr-[1.2rem]"
            : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          addToCart(product as unknown as CartItem);
        }}
        disabled={isOutOfStock || isMaxReached}
        aria-label={buyLabel}
        aria-disabled={isOutOfStock || isMaxReached}
      >
        <span className="flex items-center gap-[0.25rem] transition-all duration-[250ms] ease-linear relative z-[1] md:gap-[0.35rem] lg:gap-[0.4rem] [&>svg]:w-[13px] [&>svg]:h-[13px] [&>svg]:shrink-0 ms:[&>svg]:size-[15px] md:[&>svg]:size-4">
          {isMaxReached ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.4px] whitespace-nowrap">Máx. alcanzado</span>
            </>
          ) : isInCart ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.4px] whitespace-nowrap">Añadido</span>
            </>
          ) : isOutOfStock ? (
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.4px] whitespace-nowrap">Sin stock</span>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden="true" />
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.4px] whitespace-nowrap">Añadir al carrito</span>
            </>
          )}
        </span>
      </button>
    </li>
  );
}
