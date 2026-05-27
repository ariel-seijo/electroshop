"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface MagicFillButtonProps {
  onFill: () => void;
  label?: string;
}

export default function MagicFillButton({ onFill, label = "Auto-completar" }: MagicFillButtonProps) {
  const [flashing, setFlashing] = useState(false);

  const handleClick = useCallback(() => {
    setFlashing(true);
    onFill();
    setTimeout(() => setFlashing(false), 500);
  }, [onFill]);

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-[0.35rem] px-[0.7rem] py-[0.35rem] bg-accent/10 border border-accent/20 text-accent text-[0.7rem] font-semibold uppercase tracking-[0.8px] cursor-pointer transition-all duration-200 rounded hover:bg-accent/15 hover:border-accent/40 hover:shadow-[0_0_12px_rgba(36,171,243,0.15)] hover:-translate-y-px active:scale-95 [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:rotate-[-15deg] ${
        flashing ? "animate-fill-flash" : ""
      }`}
      onClick={handleClick}
    >
      <Sparkles size={14} />
      <span>{label}</span>
    </button>
  );
}
