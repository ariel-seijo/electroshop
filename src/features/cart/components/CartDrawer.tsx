"use client";

import Image from "next/image";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/currency";

export function Cart() {
  const {
    cart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    isCartOpen,
    closeCart,
  } = useCart();

  const router = useRouter();

  const total = cart
    .reduce((acc: number, product) => acc + product.price * product.quantity, 0);

  const totalItems = cart.reduce((acc: number, item) => acc + item.quantity, 0);
  const isEmpty = cart.length === 0;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-all duration-[250ms] ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        } max-ms:top-[60px]`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`absolute top-[calc(100%+13px)] right-0 w-[380px] max-h-[480px] min-h-[180px] flex flex-col bg-surface-20 border border-[#1f1f1f] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-0 z-[9999] transition-all duration-[250ms] ${
          isCartOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2.5"
        } max-ms:fixed max-ms:top-[60px] max-ms:right-[5%] max-ms:w-[90%] max-ms:max-h-[70vh] max-ms:rounded-lg`}
      >
        <div className="flex items-center justify-between py-4 px-[1.2rem] border-b border-[#1f1f1f]">
          <h4 className="m-0 text-[0.85rem] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
            Carrito
          </h4>
          <span className="text-[0.72rem] font-semibold text-text-placeholder">
            {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
          </span>
          <button
            className="bg-transparent border-none text-text-dim px-2 py-1 cursor-pointer text-[1.1rem] transition-colors duration-200 hover:text-accent"
            onClick={closeCart}
          >
            ✕
          </button>
        </div>

        {isEmpty ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-4 py-10 px-8 text-center">
            <ShoppingBag size={40} strokeWidth={1.5} className="text-[rgb(80,80,80)]" />
            <p className="text-text-dim text-[0.95rem] font-semibold m-0">
              El carrito está vacío.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto list-none py-3 px-[1.2rem] m-0 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgb(70,70,70)_transparent] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgb(70,70,70)] [&::-webkit-scrollbar-thumb]:rounded-[10px]">
              {cart.map((product) => (
                <li
                  key={product.id}
                  className="flex gap-3 mb-3 bg-surface-28 border border-border-38 p-2.5 transition-colors duration-200 ease-[ease] hover:border-[rgb(60,60,60)]"
                >
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={64}
                    height={64}
                    className="rounded-md object-cover size-16"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col justify-between h-full pb-2">
                      <strong className="text-text-body line-clamp-2 text-[0.85rem] leading-[1.2]">
                        {product.title}
                      </strong>
                      <span className="text-accent font-semibold">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <footer className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-[9px] py-1 bg-transparent border border-transparent text-text-secondary cursor-pointer text-[0.85rem] font-semibold transition-all duration-200 ease-[ease] hover:bg-[rgb(50,50,50)] hover:border-transparent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[rgb(100,100,100)] disabled:border-transparent disabled:hover:bg-transparent disabled:hover:text-[rgb(100,100,100)]"
                          onClick={() => decreaseQuantity(product.id)}
                          disabled={product.quantity <= 1}
                        >
                          -
                        </button>

                        <small className="text-text-secondary font-semibold text-[0.85rem]">
                          {product.quantity}
                        </small>

                        <button
                          className="px-[9px] py-1 bg-transparent border border-transparent text-text-secondary cursor-pointer text-[0.85rem] font-semibold transition-all duration-200 ease-[ease] hover:bg-[rgb(50,50,50)] hover:border-transparent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[rgb(100,100,100)] disabled:border-transparent disabled:hover:bg-transparent disabled:hover:text-[rgb(100,100,100)]"
                          onClick={() => increaseQuantity(product.id)}
                          disabled={product.quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="px-2.5 py-1 border-none bg-transparent text-text-dim cursor-pointer text-[0.78rem] font-semibold transition-colors duration-200 hover:text-danger"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </footer>
                  </div>
                </li>
              ))}
            </ul>

            <div className="py-4 px-[1.2rem] border-t border-[#1f1f1f] bg-[rgb(17,17,17)]">
              <div className="flex justify-between items-center m-0 mb-[0.8rem] text-[0.95rem] font-semibold text-text-tertiary">
                <span>Total</span>
                <strong className="text-accent text-[1.1rem]">{formatPrice(total)}</strong>
              </div>

              <button
                className="w-full text-[0.85rem] py-2.5 border-none bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-[250ms] hover:shadow-[0_0_24px_rgba(0,127,255,0.4)] hover:-translate-y-px"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
              >
                COMPRAR
              </button>

              <button
                className="w-full mt-[0.4rem] py-1.5 bg-transparent border-none text-[rgb(100,100,100)] text-[0.72rem] font-semibold cursor-pointer transition-colors duration-200 hover:text-danger"
                onClick={clearCart}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
