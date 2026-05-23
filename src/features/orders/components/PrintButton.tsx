"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-secondary"
      style={{
        fontSize: "0.75rem",
        padding: "0.35rem 0.75rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
      aria-label="Imprimir factura del pedido"
    >
      <Printer size={14} />
      Imprimir Factura
    </button>
  );
}
