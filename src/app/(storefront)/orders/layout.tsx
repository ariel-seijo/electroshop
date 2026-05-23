import type { Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mis Pedidos | ElectroShop",
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return children;
}
