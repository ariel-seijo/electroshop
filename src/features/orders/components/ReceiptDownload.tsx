"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ReceiptDocument, { type ReceiptOrder } from "./ReceiptDocument";

interface ReceiptDownloadProps {
  order: ReceiptOrder;
}

export default function ReceiptDownload({ order }: ReceiptDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const blob = await pdf(<ReceiptDocument order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Recibo_${order.orderNumber.replace("#", "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[RECEIPT DOWNLOAD ERROR]", error);
      // silently fail, user can retry
    } finally {
      setGenerating(false);
    }
  }, [order, generating]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.85rem 1.2rem",
        background: "#24abf3",
        color: "#111",
        border: "none",
        fontSize: "0.85rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "1px",
        cursor: generating ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.25s ease",
        opacity: generating ? 0.5 : 1,
      }}
    >
      {generating ? (
        <>
          <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
          Generando...
        </>
      ) : (
        <>
          <Download size={16} />
          Descargar Recibo
        </>
      )}
    </button>
  );
}
