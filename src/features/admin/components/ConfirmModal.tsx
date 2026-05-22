"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isConfirming,
  confirmLabel = "Eliminar",
  variant = "danger",
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) {
        onCancel();
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length && !modalRef.current?.contains(document.activeElement)) {
          focusable[0].focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    confirmBtnRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, isConfirming]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (isConfirming) return;
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="modal-overlay" onClick={isConfirming ? undefined : handleOverlayClick} role="presentation">
      <div
        className="modal-content modal-content-confirm"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="modal-header modal-header-confirm">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <div className="modal-icon-warning">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
            <h3 className="modal-title" id="confirm-title">{title}</h3>
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            disabled={isConfirming}
            aria-label="Cerrar diálogo"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="modal-message" id="confirm-message">{message}</p>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancelar
          </button>
          <button
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={isConfirming}
            ref={confirmBtnRef}
            aria-busy={isConfirming}
          >
            {isConfirming ? (variant === "danger" ? "Eliminando..." : "Procesando...") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
