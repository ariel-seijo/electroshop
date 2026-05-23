"use client";

import { useToastStore } from "../hooks/useToast";

export function ToastContainer() {
  const { message, type } = useToastStore();

  if (!message) return null;

  return (
    <div className="fixed top-[100px] right-5 z-[9999] pointer-events-none max-ms:top-[90px] max-ms:right-2.5 max-ms:left-2.5">
      <div
        className={`relative flex items-center gap-[0.6rem] py-[0.85rem] px-[1.2rem] bg-surface-22 border border-border-38 text-text-body text-[0.88rem] font-semibold pointer-events-auto animate-slide-in before:content-[''] before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full max-ms:text-[0.82rem] max-ms:py-[0.7rem] max-ms:px-4 ${
          type === "success" ? "before:bg-success" : "before:bg-danger"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
