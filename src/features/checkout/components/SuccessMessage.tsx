"use client";

import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";

interface OrderInfo {
  orderNumber: string;
  id: string;
}

interface SuccessMessageProps {
  email: string;
  order?: OrderInfo;
}

export default function SuccessMessage({ email, order }: SuccessMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center bg-surface-22 border border-[#1f1f1f] max-w-[550px] w-full mx-auto max-3md:px-[1.2rem] max-3md:py-12">
      <div className="size-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mb-2 animate-success-pulse [&>svg]:text-accent">
        <Check size={40} strokeWidth={2} />
      </div>
      <h2 className="m-0 text-[1.6rem] font-semibold text-accent max-3md:text-[1.3rem]">Pedido Confirmado</h2>
      {order && (
        <p className="text-[0.9rem] text-text-muted -mt-2 [&>strong]:text-accent [&>strong]:text-base">
          Pedido <strong>{order.orderNumber}</strong>
        </p>
      )}
      <p className="m-0 text-[rgb(170,170,170)] text-[0.95rem] max-w-[400px] leading-[1.5] [&>strong]:text-[rgb(220,220,220)]">
        Gracias por tu compra. Te enviamos un email con los detalles a{" "}
        <strong>{email}</strong>.
      </p>
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        <Link href="/" className="inline-flex items-center gap-[0.4rem] px-[1.8rem] py-3 bg-border-34 text-text-secondary border border-border-52 text-[0.88rem] font-semibold no-underline uppercase tracking-[1px] transition-all duration-[250ms] hover:bg-border-44 hover:text-white hover:border-[rgb(80,80,80)]">
          Volver a la tienda
        </Link>
        {order && (
          <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-[0.4rem] px-[1.8rem] py-3 bg-accent text-[#111] text-[0.88rem] font-semibold no-underline uppercase tracking-[1px] transition-all duration-[250ms] hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(36,171,243,0.35)] hover:-translate-y-px">
            <ShoppingBag size={16} />
            Ver pedido
          </Link>
        )}
      </div>
    </div>
  );
}
