"use client";

import { useLayoutEffect } from "react";
import { CheckoutProvider, useCheckout } from "@/features/checkout/context/CheckoutContext";
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
import layout from "@/features/checkout/styles/CheckoutLayout.module.css";
import emptyStyles from "@/features/checkout/styles/Success.module.css";

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
      <div className={layout.page}>
        <SuccessMessage email={shipping.email} order={orderData ?? undefined} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={layout.page}>
        <div className={emptyStyles.wrap}>
          <ShoppingBag size={64} strokeWidth={1} />
          <h2>Tu carrito está vacío</h2>
          <p>Agregá productos para comenzar tu compra.</p>
          <Link href="/" className={emptyStyles.backLink}>
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={layout.page}>
      <div className={layout.container}>
        <Stepper currentStep={step} onStepClick={goToStep} />

        <div className={layout.layout}>
          <div className={layout.formCol}>
            {step === 0 && <ShippingForm />}
            {step === 1 && <PaymentForm />}
            {step === 2 && <ReviewStep />}
          </div>

          <aside className={layout.summaryCol}>
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
