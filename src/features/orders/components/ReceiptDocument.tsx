"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatPrice, formatArs, usdToArs } from "@/lib/utils/currency";

export interface ReceiptOrder {
  orderNumber: string;
  createdAt: string;
  subtotal: number;
  shippingCost: number;
  paymentMethod: string;
  cardDetails?: { last4?: string } | null;
  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    zip?: string;
    notes?: string;
  };
  items: Array<{
    productTitle: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfABc9.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: "2px solid #007fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: "#007fff",
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  receiptLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333",
    textAlign: "right",
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: "#007fff",
    textAlign: "right",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  infoBlock: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 10,
    color: "#333",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottom: "1px solid #ddd",
    gap: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottom: "1px solid #eee",
  },
  colProduct: { width: "38%", flexShrink: 1, flexGrow: 0 },
  colSku: { width: "18%", flexShrink: 1, flexGrow: 0 },
  colQty: { width: "10%", flexShrink: 1, flexGrow: 0, textAlign: "center" },
  colPrice: { width: "17%", flexShrink: 1, flexGrow: 0, textAlign: "right" },
  colTotal: { width: "17%", flexShrink: 1, flexGrow: 0, textAlign: "right" },
  productTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a1a1a",
    textOverflow: "ellipsis",
    hyphens: "auto",
  },
  productSku: {
    fontSize: 8,
    color: "#888",
    textOverflow: "ellipsis",
    hyphens: "auto",
  },
  cellText: {
    fontSize: 9,
    color: "#444",
    textOverflow: "ellipsis",
    hyphens: "auto",
  },
  totals: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 25,
  },
  totalsBlock: {
    width: "45%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#333",
  },
  totalFinal: {
    marginTop: 6,
    paddingTop: 6,
    borderTop: "2px solid #007fff",
  },
  totalFinalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
    textTransform: "uppercase",
  },
  totalFinalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#007fff",
  },
  paymentBlock: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 2,
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 10,
    color: "#333",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 15,
    borderTop: "1px solid #ddd",
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#aaa",
    marginBottom: 2,
  },
});

const PAYMENT_LABELS: Record<string, string> = {
  card: "Tarjeta de Crédito/Débito",
  transfer: "Transferencia Bancaria",
  cash: "Efectivo (al retirar)",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSku(sku: string): string {
  if (!sku) return "";
  return sku.length > 15 ? sku.slice(0, 15) + "..." : sku;
}

interface ReceiptDocumentProps {
  order: ReceiptOrder;
}

export default function ReceiptDocument({ order }: ReceiptDocumentProps) {
  const shipping = order.shippingAddress || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>ELECTROSHOP</Text>
            <Text style={styles.logoSub}>Tienda de Electrónica</Text>
          </View>
          <View>
            <Text style={styles.receiptLabel}>COMPROBANTE</Text>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Cliente</Text>
            <Text style={styles.infoText}>{shipping.fullName || "—"}</Text>
            <Text style={styles.infoText}>{shipping.email || "—"}</Text>
            {shipping.phone && <Text style={styles.infoText}>{shipping.phone}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Dirección de envío</Text>
            <Text style={styles.infoText}>{shipping.address || "—"}</Text>
            <Text style={styles.infoText}>
              {shipping.city || "—"}, {shipping.department || "—"} - CP {shipping.zip || "—"}
            </Text>
          </View>
          <View style={[styles.infoBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.infoTitle}>Fecha y Hora</Text>
            <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
            <Text style={styles.infoText}>{formatTime(order.createdAt)}</Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Producto</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text style={styles.productTitle}>{item.productTitle}</Text>
              </View>
              <View style={styles.colSku}>
                <Text style={styles.productSku}>{formatSku(item.productSku)}</Text>
              </View>
              <View style={styles.colQty}>
                <Text style={styles.cellText}>{item.quantity}</Text>
              </View>
              <View style={styles.colPrice}>
                <Text style={styles.cellText}>{formatPrice(item.unitPrice)}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={[styles.cellText, { fontWeight: 700 }]}>
                  {formatPrice(item.totalPrice)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalValue}>
                {order.shippingCost === 0 ? "Gratis" : formatArs(order.shippingCost)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalFinalLabel}>TOTAL</Text>
              <Text style={styles.totalFinalValue}>{formatArs(usdToArs(order.subtotal) + (order.shippingCost ?? 0))}</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentTitle}>Método de pago</Text>
          <Text style={styles.paymentText}>
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </Text>
          {order.cardDetails?.last4 && (
            <Text style={[styles.paymentText, { marginTop: 2 }]}>
              Tarjeta terminada en **** {order.cardDetails.last4}
            </Text>
          )}
        </View>

        {shipping.notes && (
          <View style={[styles.paymentBlock, { backgroundColor: "#fff8e1", borderLeft: "3px solid #fbbf24" }]}>
            <Text style={styles.paymentTitle}>Notas</Text>
            <Text style={styles.paymentText}>{shipping.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ElectroShop - Comprobante generado electrónicamente</Text>
          <Text style={styles.footerText}>
            Este documento sirve como comprobante de compra.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
