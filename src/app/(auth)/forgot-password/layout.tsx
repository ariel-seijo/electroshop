import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Recuperar Contraseña - Acceso Clientes | ElectroShop",
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="auth-page"><div className="auth-card" /></div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
