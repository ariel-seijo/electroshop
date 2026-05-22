"use client";

import dynamic from "next/dynamic";
import type { ReceiptOrder } from "./ReceiptDocument";

const ReceiptDownload = dynamic(
  () => import("@/features/orders/components/ReceiptDownload"),
  { ssr: false }
);

interface ReceiptDownloadWrapperProps {
  order: ReceiptOrder;
}

export default function ReceiptDownloadWrapper({ order }: ReceiptDownloadWrapperProps) {
  return <ReceiptDownload order={order} />;
}
