import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { type ReactNode } from "react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { orderNumber: true },
    });

    if (!order) return { title: "Pedido no encontrado | ElectroShop" };

    const num =
      order.orderNumber.length > 19
        ? order.orderNumber.slice(0, 18) + "…"
        : order.orderNumber;

    return {
      title: `Pedido #${num} - Detalle de Compra | ElectroShop`,
    };
  } catch {
    return { title: "Pedido | ElectroShop" };
  }
}

export default function OrderDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
