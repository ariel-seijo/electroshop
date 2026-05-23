import type { Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mi Perfil | ElectroShop",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
