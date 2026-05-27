import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Iniciar Sesión - Acceso Clientes | ElectroShop",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8"><div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10" /></div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
