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
import { loadExchangeRate } from "@/lib/utils/currency";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Preload exchange rate so all server-rendered prices use the real DB rate,
  // not the hardcoded default of 1400.
  const rate = await loadExchangeRate();

  return (
    <html lang="es" data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{sessionStorage.setItem("usdToArs","${rate}")}catch(e){}`,
          }}
        />
      </head>
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
