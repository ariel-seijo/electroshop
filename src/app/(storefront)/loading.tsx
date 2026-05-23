import { type ReactNode } from "react";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="status"
      aria-label="Cargando página"
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "#24abf3",
          borderRadius: "50%",
          animation: "spin-loading 0.7s linear infinite",
        }}
      />
      <span className="visually-hidden">Cargando página...</span>
    </div>
  );
}
