"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LowStockProduct {
  id: number;
  title: string;
  stock: number;
}

interface LowStockAlertProps {
  lowStockCount?: number;
  lowStockProducts?: LowStockProduct[];
}

export default function LowStockAlert({ lowStockCount, lowStockProducts }: LowStockAlertProps) {
  if (!lowStockCount || lowStockCount === 0) {
    return null;
  }

  const displayProducts = lowStockProducts?.slice(0, 5) || [];
  const hiddenCount = (lowStockProducts?.length || 0) - displayProducts.length;

  return (
    <div className="bg-gradient-to-br from-[rgba(245,158,11,0.08)] to-[rgba(245,158,11,0.02)] border border-[rgba(245,158,11,0.2)] rounded-[10px] px-[22px] py-[18px] mb-6 max-[640px]:p-4">
      <div className="flex items-center gap-3 mb-3.5">
        <AlertTriangle size={20} className="text-[#f59e0b] shrink-0 animate-pulse" aria-hidden="true" />
        <h3 className="text-[0.85rem] font-semibold text-[#fbbf24] uppercase tracking-[0.5px] m-0 max-[640px]:text-[0.75rem]">
          Alerta de Inventario — {lowStockCount} producto{lowStockCount !== 1 ? "s" : ""} requiere{lowStockCount !== 1 ? "n" : ""} reposición
        </h3>
      </div>

      {displayProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3.5 max-[640px]:gap-1.5">
          {displayProducts.map((product) => (
            <div key={product.id} className="inline-flex items-center gap-2 py-1.5 px-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-md max-[640px]:py-1 max-[640px]:px-2">
              <span className="text-[0.75rem] text-[#e4e4e4] font-medium max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis max-[640px]:max-w-[150px]">{product.title}</span>
              <span
                className="font-mono text-[0.65rem] font-semibold py-0.5 px-1.5 rounded-[3px] bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] data-[critical=true]:animate-pulse motion-reduce:animate-none"
                data-critical={product.stock <= 2}
              >
                {product.stock} uds
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <span className="inline-flex items-center py-1.5 px-2.5 bg-[rgba(245,158,11,0.06)] border border-dashed border-[rgba(245,158,11,0.2)] rounded-md text-[0.7rem] font-semibold text-[#f59e0b]">
              +{hiddenCount} más
            </span>
          )}
        </div>
      )}

      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#f59e0b] no-underline uppercase tracking-[0.5px] transition-[gap] duration-200 hover:gap-2.5">
        Gestionar inventario <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
