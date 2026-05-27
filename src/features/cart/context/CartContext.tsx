"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useContext,
} from "react";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/features/toast";
import { getErrorMessage } from "@/lib/errors";
import { cartReducer, initialState, type CartItem, type CartItemInput, type CartAction } from "./CartReducer";
import { syncCart } from "../actions/syncCart";
import { fetchCart } from "../actions/fetchCart";
import { saveCart } from "../actions/saveCart";
import type { SyncedCartItem } from "../actions/syncCart";

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: CartItemInput, quantity?: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  syncGuestCart: () => Promise<void>;
  isSyncing: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "cart";
const CART_SYNCED_KEY = "cart_is_synced";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function mapDbCartToClient(dbCart: SyncedCartItem[]): CartItem[] {
  return dbCart.map((item) => ({
    id: item.product.id,
    title: item.product.title,
    slug: item.product.slug,
    price: item.product.price,
    oldPrice: item.product.oldPrice,
    thumbnail: item.product.thumbnail,
    stock: item.product.stock,
    sku: item.product.sku,
    brand: item.product.brand,
    categoryId: item.product.categoryId,
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const user = useAuthStore((s) => s.user);
  const prevUser = useRef(user);

  useEffect(() => {
    if (!isClient()) return;
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        dispatch({ type: "SET_CART", payload: JSON.parse(storedCart) });
      }
    } catch (error) {
      console.error("Error loading cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (!isClient()) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage", error);
    }
  }, [cart]);

  useEffect(() => {
    if (!isClient()) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_SYNCED_KEY && e.newValue === "true") {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          fetchCart()
            .then((dbCart) => {
              dispatch({
                type: "SET_CART",
                payload: mapDbCartToClient(dbCart),
              });
            })
            .catch(() => {
              /* silently ignore fetch errors */
            });
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isClient() || !user) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    saveTimerRef.current = setTimeout(() => {
      saveCart(items)
        .then((result) => {
          if (result && result.warnings && result.warnings.length > 0) {
            fetchCart()
              .then((dbCart) => {
                dispatch({ type: "SET_CART", payload: mapDbCartToClient(dbCart) });
              })
              .catch(() => {});
          }
        })
        .catch((err) => {
          console.error("Auto-save cart failed:", getErrorMessage(err));
        });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [cart, user]);

  const performSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const wasSynced =
        isClient() && localStorage.getItem(CART_SYNCED_KEY) === "true";

      if (wasSynced) {
        const dbCart = await fetchCart();
        dispatch({ type: "SET_CART", payload: mapDbCartToClient(dbCart) });
        return;
      }

      if (cart.length === 0) {
        const dbCart = await fetchCart();
        dispatch({ type: "SET_CART", payload: mapDbCartToClient(dbCart) });
        try {
          localStorage.setItem(CART_SYNCED_KEY, "true");
        } catch {
          /* ignore */
        }
        return;
      }

      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const dbCart = await syncCart(items);

      try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.setItem(CART_SYNCED_KEY, "true");
      } catch {
        /* ignore */
      }

      dispatch({ type: "SET_CART", payload: mapDbCartToClient(dbCart) });
    } catch (error) {
      console.error("Cart sync failed — guest cart preserved:", getErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  }, [cart, isSyncing]);

  const performSyncRef = useRef(performSync);
  performSyncRef.current = performSync;

  const cartRef = useRef(cart);
  cartRef.current = cart;

  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    if (!isClient()) return;

    const wasLoggedIn = !!prevUser.current;
    const isLoggedIn = !!user;

    if (!wasLoggedIn && isLoggedIn && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      performSyncRef.current();
    }

    if (wasLoggedIn && !isLoggedIn) {
      syncAttemptedRef.current = false;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      if (cartRef.current.length > 0) {
        const items = cartRef.current.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }));
        saveCart(items).catch(() => {});
      }

      try {
        localStorage.removeItem(CART_SYNCED_KEY);
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      dispatch({ type: "CLEAR_CART" });
    }

    prevUser.current = user;
  }, [user]);

  const syncGuestCart = useCallback(async () => {
    if (!useAuthStore.getState().user) return;
    await performSync();
  }, [performSync]);

  const addToCart = (product: CartItemInput, quantity = 1) => {
    const cartItem = cart.find((item) => item.id === product.id);
    const cartQty = cartItem ? cartItem.quantity : 0;

    if (cartQty >= product.stock) {
      if (isClient()) {
        useToastStore.getState().toast(
          `Ya tienes el máximo disponible de "${product.title}" (${product.stock} unidades)`,
          "error"
        );
      }
      return;
    }

    dispatch({ type: "ADD_TO_CART", payload: { product, quantity } });
  };

  const increaseQuantity = (id: number) => {
    dispatch({ type: "INCREASE_QUANTITY", payload: id });
  };

  const decreaseQuantity = (id: number) => {
    dispatch({ type: "DECREASE_QUANTITY", payload: id });
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        syncGuestCart,
        isSyncing,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
