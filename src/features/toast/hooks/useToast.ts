import { create } from "zustand";

type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string | null;
  type: ToastType;
  toast: (message: string, type?: ToastType) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "success",

  toast: (message, type = "success") => {
    set({ message, type });
    setTimeout(() => set({ message: null }), 3000);
  },

  dismiss: () => set({ message: null }),
}));
