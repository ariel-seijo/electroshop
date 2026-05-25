'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, X, Package, ShoppingCart, Clock, AlertTriangle } from "lucide-react";

interface LowStockProduct { id: number; title: string; stock: number; }
interface RecentOrder { id: string; orderNumber: string; status: string; createdAt: Date; user?: { email: string } | null; }
interface NotificationBellProps { lowStock?: { count: number; products: LowStockProduct[] }; recentOrders?: RecentOrder[]; pendingCount?: number; }

function timeAgo(dateStr: string | Date): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function NotificationBell({ lowStock, recentOrders, pendingCount }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { try { const stored = localStorage.getItem("admin-dismissed"); if (stored) setDismissed(new Set(JSON.parse(stored))); } catch {} }, []);
  useEffect(() => { if (mounted) { try { localStorage.setItem("admin-dismissed", JSON.stringify([...dismissed])); } catch {} } }, [dismissed, mounted]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 60000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function handleEscape(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscape); };
  }, [open]);

  const dismissItem = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const stockProducts = (lowStock?.products || []).filter((p) => !dismissed.has(`stock-${p.id}`));
  const visibleOrders = (recentOrders || []).filter((o) => !dismissed.has(`order-${o.id}`));

  const totalAlerts = stockProducts.length + visibleOrders.length;

  const sectionHdr = "flex items-center gap-2 px-[14px] py-2.5 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.6px] text-text-muted border-b border-white/5 not-first:border-t not-first:border-white/5";
  const itemBase = "flex items-start gap-2.5 px-[14px] py-3 text-[0.78rem] text-text-0 border-b border-white/[0.03] min-h-11 last:border-b-0 max-sm:px-4 max-sm:py-[14px] max-sm:text-[0.82rem] max-sm:gap-3";

  if (!mounted) {
    return (
      <div className="relative">
        <button type="button" className="flex items-center justify-center size-9 bg-transparent border border-white/5 rounded-md text-text-muted" aria-label="Cargando notificaciones" disabled>
          <Bell size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="flex items-center justify-center size-9 bg-transparent border border-white/5 rounded-md text-text-muted cursor-pointer transition-all duration-[150ms] hover:text-text-0 hover:border-white/10 hover:bg-white/[0.03] max-sm:min-w-11 max-sm:min-h-11" onClick={() => setOpen(!open)} aria-label={`Notificaciones${totalAlerts > 0 ? ` (${totalAlerts})` : ""}`} aria-expanded={open} aria-haspopup="true">
        <Bell size={18} />
        {totalAlerts > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-danger text-white text-[0.6rem] font-semibold font-mono rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-[pulseBadge_2s_ease-in-out_infinite] motion-reduce:animate-none" aria-label={`${totalAlerts} notificaciones`}>{totalAlerts > 99 ? "99+" : totalAlerts}</span>
        )}
      </button>

      {open && (
        <>
          <div className="hidden max-sm:block max-sm:fixed max-sm:inset-0 max-sm:z-[48] max-sm:bg-black/55 max-sm:backdrop-blur-sm max-sm:animate-[fadeIn_0.2s_ease-out]" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute top-[calc(100%+8px)] right-0 w-[260px] bg-surface-14 border border-white/[0.08] rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-[bellPopIn_0.15s_ease-out] max-sm:fixed max-sm:top-[var(--admin-header-height,56px)] max-sm:left-0 max-sm:right-0 max-sm:w-auto max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 max-sm:shadow-[0_16px_40px_rgba(0,0,0,0.8)] max-sm:animate-[slideDown_0.22s_cubic-bezier(0.4,0,0.2,1)] max-sm:max-h-[calc(100vh-var(--admin-header-height,56px))] max-sm:overflow-y-auto" role="dialog" aria-label="Notificaciones">
            <div className="flex items-center justify-between px-[14px] py-3 text-accent max-sm:px-4 max-sm:py-[14px] max-sm:text-xs border-b border-white/5">
              <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.8px] text-accent m-0">Notificaciones</h3>
              <button type="button" className="hidden max-sm:flex max-sm:items-center max-sm:justify-center max-sm:w-8 max-sm:h-8 max-sm:border max-sm:border-white/[0.08] max-sm:bg-transparent max-sm:text-[rgb(160,160,160)] max-sm:rounded-md max-sm:cursor-pointer max-sm:hover:text-white max-sm:hover:border-white/[0.15]" onClick={() => setOpen(false)} aria-label="Cerrar notificaciones"><X size={16} /></button>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {visibleOrders.length > 0 && (
                <div>
                  <div className={sectionHdr}><ShoppingCart size={14} className="text-accent shrink-0" /><span>Pedidos ({visibleOrders.length})</span></div>
                  {visibleOrders.slice(0, 5).map((order) => (
                    <div key={`order-${order.id}`} className={itemBase}>
                      <ShoppingCart size={14} className="text-accent shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                        <span className="text-[0.8rem] text-[rgb(210,210,210)] leading-[1.4]">
                          Nuevo pedido{" "}
                          <Link href={`/admin/orders/${order.id}`} className="text-accent no-underline font-semibold hover:underline" onClick={() => setOpen(false)}>
                            {order.orderNumber}
                          </Link>
                        </span>
                        <span className="text-[0.68rem] text-text-muted flex items-center gap-1 truncate">
                          <Clock size={11} />
                          {timeAgo(order.createdAt)}
                          {order.user?.email && <> — {order.user.email}</>}
                        </span>
                      </div>
                      <button type="button" className="flex items-center justify-center min-w-7 min-h-7 border-none bg-transparent text-[rgb(100,100,100)] cursor-pointer rounded shrink-0 mt-0.5 transition-colors duration-[150ms] hover:text-danger hover:bg-danger/10 max-sm:min-w-9 max-sm:min-h-9" onClick={(e) => { e.stopPropagation(); dismissItem(`order-${order.id}`); }} aria-label={`Descartar ${order.orderNumber}`}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {stockProducts.length > 0 && (
                <div>
                  <div className={sectionHdr}><AlertTriangle size={14} className="text-warning shrink-0" /><span>Bajo inventario ({stockProducts.length})</span></div>
                  {stockProducts.slice(0, 5).map((product) => (
                    <div key={`stock-${product.id}`} className={itemBase}>
                      <Package size={14} className="text-warning shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                        <span className="text-[0.8rem] text-[rgb(210,210,210)] leading-[1.4]">
                          <Link href={`/admin/products?search=${encodeURIComponent(product.title)}`} className="text-accent no-underline font-semibold hover:underline" onClick={() => setOpen(false)}>
                            {product.title}
                          </Link>
                        </span>
                        <span className="text-[0.68rem] text-text-muted flex items-center gap-1 truncate">
                          Stock bajo: <strong>{product.stock}</strong> uds
                        </span>
                      </div>
                      <button type="button" className="flex items-center justify-center min-w-7 min-h-7 border-none bg-transparent text-[rgb(100,100,100)] cursor-pointer rounded shrink-0 mt-0.5 transition-colors duration-[150ms] hover:text-danger hover:bg-danger/10 max-sm:min-w-9 max-sm:min-h-9" onClick={(e) => { e.stopPropagation(); dismissItem(`stock-${product.id}`); }} aria-label={`Descartar alerta de ${product.title}`}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {totalAlerts === 0 && (
                <div className="px-[14px] py-5 text-[0.78rem] text-text-placeholder text-center max-sm:px-4 max-sm:py-6 max-sm:text-[0.82rem]">
                  <Bell size={24} className="mb-2 opacity-30 mx-auto" /><span>Sin alertas pendientes</span>
                </div>
              )}
            </div>

            {(lowStock && lowStock.count > stockProducts.length || pendingCount && pendingCount > visibleOrders.length || visibleOrders.length > 5 || stockProducts.length > 5) && (
              <div className="px-[14px] py-2.5 text-[0.72rem] text-text-muted text-center border-t border-white/[0.04] max-sm:px-4 max-sm:py-3">
                {pendingCount ? (
                  <>
                    <Link href="/admin/orders" className="text-accent no-underline font-semibold hover:underline" onClick={() => setOpen(false)}>
                      {pendingCount} pedido{pendingCount !== 1 ? "s" : ""} pendiente{pendingCount !== 1 ? "s" : ""}
                    </Link>
                  </>
                ) : null}
                {pendingCount && lowStock?.count ? " · " : null}
                {lowStock?.count ? (
                  <Link href="/admin/products" className="text-accent no-underline font-semibold hover:underline" onClick={() => setOpen(false)}>
                    {lowStock.count} producto{lowStock.count !== 1 ? "s" : ""} con stock bajo
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
