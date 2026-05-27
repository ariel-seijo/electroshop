"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ChangeEvent } from "react";
import { Package, X, Loader2 } from "lucide-react";

interface StockEditModalProduct {
  title?: string;
  stock?: number;
}

interface StockEditModalProps {
  isOpen: boolean;
  product?: StockEditModalProduct | null;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export default function StockEditModal({
  isOpen,
  product,
  value,
  onChange,
  onConfirm,
  onCancel,
  isConfirming,
}: StockEditModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, isConfirming]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={isConfirming ? undefined : onCancel} role="presentation">
      <div
        className="modal-content modal-content-confirm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-modal-title"
      >
        <div className="modal-header modal-header-confirm">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <div className="modal-icon-warning">
              <Package size={24} aria-hidden="true" />
            </div>
            <h3 className="modal-title" id="stock-modal-title">Actualizar stock</h3>
          </div>
          <button className="modal-close" onClick={onCancel} disabled={isConfirming} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-message">
          <p style={{ marginBottom: "12px" }}>
            Stock actual de <strong>{product?.title}</strong>: {product?.stock}
          </p>
          <div className="form-group">
            <label htmlFor="stock-input" className="form-label">Nuevo stock</label>
            <input
              id="stock-input"
              type="number"
              className="form-input"
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
              min="0"
              ref={inputRef}
              onKeyDown={(e: ReactKeyboardEvent) => { if (e.key === "Enter") onConfirm(); }}
              disabled={isConfirming}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isConfirming}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 size={14} style={{ marginRight: 6, animation: "spin 0.6s linear infinite" }} />
                Actualizando...
              </>
            ) : (
              "Actualizar stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
