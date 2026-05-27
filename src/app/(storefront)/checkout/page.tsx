"use client";

import { useLayoutEffect } from "react";
import { CheckoutProvider, useCheckout } from "@/features/checkout";
import { useCart } from "@/features/cart";
import {
  Stepper,
  ShippingForm,
  PaymentForm,
  ReviewStep,
  OrderSummary,
  SuccessMessage,
} from "@/features/checkout";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

function CheckoutFlow() {
  const { step, shipping, isConfirmed, orderData, goToStep } = useCheckout();
  const { cart } = useCart();
  const isEmpty = cart.length === 0;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
    document.documentElement.scrollTop = 0;
  }, [step, isConfirmed, isEmpty]);

  if (isConfirmed) {
    return (
      <div className="min-h-[calc(100vh-134px)] flex justify-center px-4 py-8 max-3md:px-2 max-3md:py-4">
        <SuccessMessage email={shipping.email} order={orderData ?? undefined} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-[calc(100vh-134px)] flex justify-center px-4 py-8 max-3md:px-2 max-3md:py-4">
        <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center bg-surface-22 border border-[#1f1f1f] max-w-[550px] w-full mx-auto max-3md:px-[1.2rem] max-3md:py-12">
          <ShoppingBag size={64} strokeWidth={1} />
          <h2 className="m-0 text-[1.6rem] font-semibold text-accent max-3md:text-[1.3rem]">Tu carrito está vacío</h2>
          <p className="m-0 text-[rgb(170,170,170)] text-[0.95rem] max-w-[400px] leading-[1.5]">Agregá productos para comenzar tu compra.</p>
          <Link href="/" className="inline-flex items-center gap-[0.4rem] px-[1.8rem] py-3 bg-border-34 text-text-secondary border border-border-52 text-[0.88rem] font-semibold no-underline uppercase tracking-[1px] transition-all duration-[250ms] hover:bg-border-44 hover:text-white hover:border-[rgb(80,80,80)]">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-134px)] flex justify-center px-4 py-8 max-3md:px-2 max-3md:py-4">
      <div className="w-full max-w-[1100px]">
        <Stepper currentStep={step} onStepClick={goToStep} />

        <div className="grid grid-cols-[1fr_380px] gap-6 items-start max-6lg:grid-cols-1">
          <div className="flex flex-col gap-6">
            {step === 0 && <ShippingForm />}
            {step === 1 && <PaymentForm />}
            {step === 2 && <ReviewStep />}
          </div>

          <aside className="sticky top-[100px] max-6lg:static max-6lg:order-[-1]">
            <OrderSummary />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutFlow />
    </CheckoutProvider>
  );
}
