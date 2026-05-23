import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";

const fuenteGamer = localFont({
  src: "./fonts/cosmic-lager-regular.otf",
  variable: "--font-cosmic",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

import { AuthProvider } from "@/features/auth";
import { ToastContainer } from "@/features/toast";
import { CartProvider } from "@/features/cart";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${inter.className} ${fuenteGamer.variable} ${inter.variable}`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
