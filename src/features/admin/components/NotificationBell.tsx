'use client';

import { useState, useRef, useEffect } from "react";
import { Bell, Package, ShoppingCart, AlertTriangle } from "lucide-react";

interface LowStockProduct { id: number; title: string; stock: number; }
interface RecentOrder { id: string; orderNumber: string; status: string; createdAt: Date; user?: { email: string } | null; }
interface NotificationBellProps { lowStock?: { count: number; products: LowStockProduct[] }; recentOrders?: RecentOrder[]; pendingCount?: number; }

export default function NotificationBell({ lowStock, recentOrders, pendingCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalAlerts = (lowStock?.products?.filter((p) => !dismissed.has(`stock-${p.id}`)).length || 0) + (recentOrders?.filter((o) => !dismissed.has(`order-${o.id}`)).length || 0);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { try { const stored = localStorage.getItem("admin-dismissed"); if (stored) setDismissed(new Set(JSON.parse(stored))); } catch {} }, []);
  useEffect(() => { if (mounted) { try { localStorage.setItem("admin-dismissed", JSON.stringify([...dismissed])); } catch {} } }, [dismissed, mounted]);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    const timer = setInterval(() => { window.location.reload(); }, 60000);
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); clearInterval(timer); };
  }, [open]);

  function handleDismiss(itemId: string) { setDismissed((prev) => { const next = new Set(prev); next.add(itemId); return next; }); }

  const lowStockItems = lowStock?.products?.filter((p) => !dismissed.has(`stock-${p.id}`)) || [];
  const orderItems = recentOrders?.filter((o) => !dismissed.has(`order-${o.id}`)) || [];

  const sectionHdr = "flex items-center gap-2 px-[14px] py-2.5 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.6px] text-text-muted border-b border-white/5 not-first:border-t not-first:border-white/5";
  const itemBase = "flex items-start gap-2.5 px-[14px] py-3 text-[0.78rem] text-text-0 border-b border-white/[0.03] min-h-11 last:border-b-0 max-sm:px-4 max-sm:py-[14px] max-sm:text-[0.82rem] max-sm:gap-3";

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="flex items-center justify-center size-9 bg-transparent border border-white/5 rounded-md text-text-muted cursor-pointer transition-all duration-[150ms] hover:text-text-0 hover:border-white/10 hover:bg-white/[0.03] max-sm:min-w-11 max-sm:min-h-11" onClick={() => setOpen(!open)} aria-label={`Notificaciones${totalAlerts > 0 ? ` (${totalAlerts})` : ""}`} aria-expanded={open} aria-haspopup="true">
        <Bell size={18} />
        {totalAlerts > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-danger text-white text-[0.6rem] font-semibold font-mono rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-[pulseBadge_2s_ease-in-out_infinite] motion-reduce:animate-none" aria-label={`${totalAlerts} notificaciones`}>{totalAlerts > 99 ? "99+" : totalAlerts}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[260px] bg-surface-14 border border-white/[0.08] rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-[bellPopIn_0.15s_ease-out] max-sm:fixed max-sm:top-[var(--admin-header-height,56px)] max-sm:left-0 max-sm:right-0 max-sm:w-auto max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 max-sm:shadow-[0_16px_40px_rgba(0,0,0,0.8)] max-sm:animate-[slideDown_0.22s_cubic-bezier(0.4,0,0.2,1)] max-sm:max-h-[calc(100vh-var(--admin-header-height,56px))] max-sm:overflow-y-auto" role="dialog" aria-label="Notificaciones">
          <div className="flex items-center justify-between px-[14px] py-3 text-accent max-sm:px-4 max-sm:py-[14px] max-sm:text-xs border-b border-white/5">
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.8px] text-accent m-0">Notificaciones</h3>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {lowStockItems.length > 0 && (
              <div>
                <div className={sectionHdr}><AlertTriangle size={14} className="text-warning shrink-0" /><span>Bajo inventario ({lowStockItems.length})</span></div>
                {lowStockItems.map((product) => (
                  <div key={`stock-${product.id}`} className={itemBase}>
                    <Package size={14} className="text-warning shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                      <span className="text-[0.8rem] text-[rgb(210,210,210)] leading-[1.4]">{product.title}</span>
                      <span className="text-[0.68rem] text-text-muted flex items-center gap-1 truncate">Stock: {product.stock === 0 ? "Agotado" : product.stock}</span>
                    </div>
                    <button type="button" className="flex items-center justify-center min-w-7 min-h-7 border-none bg-transparent text-[rgb(100,100,100)] cursor-pointer rounded shrink-0 mt-0.5 transition-colors duration-[150ms] hover:text-danger hover:bg-danger/10 max-sm:min-w-9 max-sm:min-h-9" onClick={() => handleDismiss(`stock-${product.id}`)} aria-label={`Descartar alerta de ${product.title}`}>×</button>
                  </div>
                ))}
              </div>
            )}

            {orderItems.length > 0 && (
              <div>
                <div className={sectionHdr}><ShoppingCart size={14} className="text-accent shrink-0" /><span>Pedidos ({orderItems.length})</span></div>
                {orderItems.map((order) => (
                  <div key={`order-${order.id}`} className={itemBase}>
                    <ShoppingCart size={14} className="text-accent shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                      <span className="text-[0.8rem] text-[rgb(210,210,210)] leading-[1.4]">{order.orderNumber}</span>
                      <span className="text-[0.68rem] text-text-muted flex items-center gap-1 truncate">{order.user?.email || "Sin email"} • {order.status}</span>
                    </div>
                    <button type="button" className="flex items-center justify-center min-w-7 min-h-7 border-none bg-transparent text-[rgb(100,100,100)] cursor-pointer rounded shrink-0 mt-0.5 transition-colors duration-[150ms] hover:text-danger hover:bg-danger/10 max-sm:min-w-9 max-sm:min-h-9" onClick={() => handleDismiss(`order-${order.id}`)} aria-label={`Descartar alerta de ${order.orderNumber}`}>×</button>
                  </div>
                ))}
              </div>
            )}

            {lowStockItems.length === 0 && orderItems.length === 0 && (
              <div className="px-[14px] py-5 text-[0.78rem] text-text-placeholder text-center max-sm:px-4 max-sm:py-6 max-sm:text-[0.82rem]">
                <Bell size={24} className="mb-2 opacity-30 mx-auto" /><span>No hay notificaciones</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
