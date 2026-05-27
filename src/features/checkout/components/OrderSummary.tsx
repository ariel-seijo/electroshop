"use client";

import Image from "next/image";
import { useCart } from "@/features/cart";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";

export default function OrderSummary() {
  const { cart } = useCart();

  const subtotal = cart.reduce((acc: number, item) => acc + item.price * item.quantity, 0);
  const subtotalArs = usdToArs(subtotal);
  const shippingCost = subtotalArs >= 50000 ? 0 : 1500;
  const totalArs = subtotalArs + shippingCost;

  return (
    <div className="bg-surface-22 border border-[#1f1f1f] p-6">
      <h3 className="m-0 mb-[1.2rem] text-base font-semibold uppercase tracking-[1.5px] text-text-secondary pb-[0.8rem] border-b border-[#1f1f1f]">Resumen de Compra</h3>

      <ul className="list-none pr-1 pl-0 m-0 flex flex-col gap-3">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center gap-[0.6rem]">
            <div className="relative size-12 shrink-0 [&>img]:object-contain">
              <Image src={item.thumbnail} alt={item.title} width={48} height={48} />
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-accent text-[#111] text-[0.65rem] font-semibold flex items-center justify-center">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[0.82rem] font-semibold text-[rgb(190,190,190)] line-clamp-2 leading-[1.3]">{item.title}</span>
            </div>
            <span className="text-[0.88rem] font-semibold text-text-body shrink-0">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="h-px bg-[#1f1f1f] my-4" />

      <div className="flex justify-between items-center mb-2 text-[0.9rem] text-[rgb(170,170,170)]">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="flex justify-between items-center mb-2 text-[0.9rem] text-[rgb(170,170,170)]">
        <span>Envío</span>
        <span className={`${shippingCost === 0 ? "text-success font-semibold" : ""}`}>
          {shippingCost === 0 ? "GRATIS" : formatArs(shippingCost)}
        </span>
      </div>

      {shippingCost > 0 && (
        <p className="-mt-[0.2rem] mb-2 text-[0.68rem] text-[rgb(100,100,100)] font-semibold">¡Envío gratis en compras superiores a {formatArs(50000)}!</p>
      )}

      <div className="h-px bg-[#1f1f1f] my-4" />

      <div className="flex justify-between items-center text-[1.15rem] font-semibold text-[rgb(220,220,220)] [&>span:last-child]:text-accent [&>span:last-child]:text-[1.3rem]">
        <span>Total</span>
        <span>{formatArs(totalArs)}</span>
      </div>
    </div>
  );
}
