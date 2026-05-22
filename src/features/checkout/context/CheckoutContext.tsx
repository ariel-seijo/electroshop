"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { useCart, type CartItem } from "@/features/cart";
import { SHIPPING_DEMO, PAYMENT_DEMO } from "@/mocks/checkoutDemoData";

const STORAGE_KEY = "checkout_state";

interface ShippingFields {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  zip: string;
  notes: string;
}

interface CardFields {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardHolder: string;
}

interface OrderData {
  orderNumber: string;
  id: string;
}

interface CheckoutState {
  step: number;
  shipping: ShippingFields;
  paymentMethod: string;
  cardDetails: CardFields;
  isProcessing: boolean;
  isConfirmed: boolean;
  orderData: OrderData | null;
  orderError: string | null;
}

type CheckoutAction =
  | { type: "HYDRATE"; payload: Partial<CheckoutState> }
  | { type: "SET_SHIPPING_FIELD"; name: string; value: string }
  | { type: "AUTO_FILL_SHIPPING" }
  | { type: "SET_PAYMENT_METHOD"; method: string }
  | { type: "SET_CARD_FIELD"; name: string; value: string }
  | { type: "AUTO_FILL_PAYMENT" }
  | { type: "SET_STEP"; step: number }
  | { type: "PLACE_ORDER_START" }
  | { type: "PLACE_ORDER_SUCCESS"; payload: OrderData }
  | { type: "PLACE_ORDER_ERROR"; error: string }
  | { type: "RESET" };

const initialState: CheckoutState = {
  step: 0,
  shipping: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    zip: "",
    notes: "",
  },
  paymentMethod: "card",
  cardDetails: {
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardHolder: "",
  },
  isProcessing: false,
  isConfirmed: false,
  orderData: null,
  orderError: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };

    case "SET_SHIPPING_FIELD":
      return {
        ...state,
        shipping: { ...state.shipping, [action.name]: action.value },
      };

    case "AUTO_FILL_SHIPPING":
      return { ...state, shipping: { ...SHIPPING_DEMO } };

    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };

    case "SET_CARD_FIELD":
      return {
        ...state,
        cardDetails: { ...state.cardDetails, [action.name]: action.value },
      };

    case "AUTO_FILL_PAYMENT":
      return {
        ...state,
        paymentMethod: PAYMENT_DEMO.method,
        cardDetails: {
          cardNumber: PAYMENT_DEMO.cardNumber,
          cardExpiry: PAYMENT_DEMO.cardExpiry,
          cardCvc: PAYMENT_DEMO.cardCvc,
          cardHolder: PAYMENT_DEMO.cardHolder,
        },
      };

    case "SET_STEP":
      return { ...state, step: action.step };

    case "PLACE_ORDER_START":
      return { ...state, isProcessing: true, orderError: null };

    case "PLACE_ORDER_SUCCESS":
      return {
        ...state,
        isProcessing: false,
        isConfirmed: true,
        orderData: action.payload,
        orderError: null,
      };

    case "PLACE_ORDER_ERROR":
      return { ...state, isProcessing: false, orderError: action.error };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function loadFromStorage(): Partial<CheckoutState> | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state: Partial<CheckoutState>): void {
  if (!isClient()) return;
  try {
    const toSave = {
      step: state.step,
      shipping: state.shipping,
      paymentMethod: state.paymentMethod,
      cardDetails: state.cardDetails,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    /* noop */
  }
}

function clearStorage(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

interface CheckoutContextValue extends CheckoutState {
  setShippingField: (name: string, value: string) => void;
  autoFillShipping: () => void;
  setPaymentMethod: (method: string) => void;
  setCardField: (name: string, value: string) => void;
  autoFillPayment: () => void;
  goToStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  placeOrder: () => Promise<void>;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const initialized = useRef(false);
  const { clearCart, cart } = useCart();

  useEffect(() => {
    if (!isClient() || initialized.current) return;
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: "HYDRATE", payload: saved });
    }
    initialized.current = true;
  }, []);

  const { shipping, paymentMethod, cardDetails, step } = state;

  useEffect(() => {
    if (!initialized.current) return;
    saveToStorage({ shipping, paymentMethod, cardDetails, step });
  }, [shipping, paymentMethod, cardDetails, step]);

  const setShippingField = useCallback((name: string, value: string) => {
    dispatch({ type: "SET_SHIPPING_FIELD", name, value });
  }, []);

  const autoFillShipping = useCallback(() => {
    dispatch({ type: "AUTO_FILL_SHIPPING" });
  }, []);

  const setPaymentMethod = useCallback((method: string) => {
    dispatch({ type: "SET_PAYMENT_METHOD", method });
  }, []);

  const setCardField = useCallback((name: string, value: string) => {
    dispatch({ type: "SET_CARD_FIELD", name, value });
  }, []);

  const autoFillPayment = useCallback(() => {
    dispatch({ type: "AUTO_FILL_PAYMENT" });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: "SET_STEP", step: state.step + 1 });
  }, [state.step]);

  const goPrev = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.max(0, state.step - 1) });
  }, [state.step]);

  const placeOrder = useCallback(async () => {
    dispatch({ type: "PLACE_ORDER_START" });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shipping: state.shipping,
          paymentMethod: state.paymentMethod,
          cardDetails: state.cardDetails,
          notes: state.shipping.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      dispatch({ type: "PLACE_ORDER_SUCCESS", payload: data.order });
      clearCart();
      clearStorage();
    } catch (err) {
      dispatch({ type: "PLACE_ORDER_ERROR", error: (err as Error).message });
      throw err;
    }
  }, [cart, state.shipping, state.paymentMethod, state.cardDetails, clearCart]);

  const resetCheckout = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: CheckoutContextValue = {
    ...state,
    setShippingField,
    autoFillShipping,
    setPaymentMethod,
    setCardField,
    autoFillPayment,
    goToStep,
    goNext,
    goPrev,
    placeOrder,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
