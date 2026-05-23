"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Check,
  X as XIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";
import {
  updateProductStockAction,
  toggleProductActiveAction,
  toggleProductFeaturedAction,
  deleteProductAction,
} from "@/features/admin/actions/productActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "./ConfirmModal";
import StockEditModal from "./StockEditModal";

export interface TableProduct {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  sku: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  sold: number;
  active: boolean;
  featured: boolean;
  createdAt: string | Date;
  category?: { name: string } | null;
}

interface ModalState {
  isOpen: boolean;
  product: TableProduct | null;
}

interface SortColumn {
  key: string;
  label: string;
}

interface SortIconProps {
  column: string;
  sort: string;
  order: "asc" | "desc";
}

interface ProductTableProps {
  products: TableProduct[];
  total: number;
  page: number;
  totalPages: number;
  sort: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
  onPage: (page: number) => void;
}

const SORTABLE_COLUMNS: SortColumn[] = [
  { key: "createdAt", label: "Fecha" },
  { key: "price", label: "Precio" },
  { key: "stock", label: "Inventario" },
  { key: "sold", label: "Vendidos" },
];

function SortIcon({ column, sort, order }: SortIconProps) {
  if (sort !== column) {
    return <ArrowUp size={12} className="opacity-0 transition-opacity duration-[0.15s] group-hover:opacity-40" aria-hidden="true" />;
  }
  return order === "asc" ? (
    <ArrowUp size={12} className="text-[#24abf3]" aria-hidden="true" />
  ) : (
    <ArrowDown size={12} className="text-[#24abf3]" aria-hidden="true" />
  );
}

function getStockClass(stock: number): string {
  if (stock === 0) return "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-[#f87171] hover:bg-[rgba(239,68,68,0.14)] hover:shadow-[0_0_8px_rgba(239,68,68,0.15)]";
  if (stock < 10) return "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)] text-[#fbbf24] hover:bg-[rgba(245,158,11,0.14)] hover:shadow-[0_0_8px_rgba(245,158,11,0.15)]";
  return "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.3)] text-[#4ade80] hover:bg-[rgba(34,197,94,0.14)] hover:shadow-[0_0_8px_rgba(34,197,94,0.15)]";
}

function getStockLabel(stock: number): string {
  if (stock === 0) return "Agotado";
  if (stock < 10) return `Bajo (${stock})`;
  return `Stock (${stock})`;
}

const SWITCH_BASE = "inline-flex items-center justify-center gap-1 w-9 h-9 rounded-md border-[1.5px] cursor-pointer transition-all duration-200 shrink-0 hover:border-[rgba(36,171,243,0.25)] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed max-[640px]:w-11 max-[640px]:h-11";
const SWITCH_ON = "bg-[rgba(36,171,243,0.1)] border-[#24abf3] text-[#24abf3] shadow-[0_0_8px_rgba(36,171,243,0.15)]";
const SWITCH_OFF = "bg-[rgba(12,12,12,0.95)] border-[rgba(255,255,255,0.06)] text-[rgb(80,80,80)]";

const SWITCH_MOBILE_BASE = "inline-flex items-center justify-center gap-1.5 w-auto min-h-11 px-3 rounded-md border-[1.5px] cursor-pointer transition-all duration-200 shrink-0 text-[0.75rem] font-semibold hover:border-[rgba(36,171,243,0.25)] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const ACTION_BTN = "inline-flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] cursor-pointer transition-all duration-[0.15s] no-underline shrink-0 hover:bg-[rgba(36,171,243,0.08)] hover:border-[rgba(36,171,243,0.25)] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 max-[640px]:w-11 max-[640px]:h-11";

const ACTION_BTN_DANGER = "inline-flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] cursor-pointer transition-all duration-[0.15s] no-underline shrink-0 hover:bg-[rgba(239,68,68,0.08)] hover:border-[rgba(239,68,68,0.25)] hover:text-[#f87171] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 max-[640px]:w-11 max-[640px]:h-11";

const ACTION_BTN_MOBILE = "inline-flex items-center justify-center w-11 h-11 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] cursor-pointer transition-all duration-[0.15s] no-underline shrink-0 hover:bg-[rgba(36,171,243,0.08)] hover:border-[rgba(36,171,243,0.25)] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2";

const ACTION_BTN_MOBILE_DANGER = "inline-flex items-center justify-center w-11 h-11 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] cursor-pointer transition-all duration-[0.15s] no-underline shrink-0 hover:bg-[rgba(239,68,68,0.08)] hover:border-[rgba(239,68,68,0.25)] hover:text-[#f87171] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2";

const BADGE = "inline-flex items-center justify-center py-[3px] px-2.5 rounded-[5px] text-[0.72rem] font-semibold border-[1.5px] cursor-pointer transition-all duration-200 font-[inherit] min-h-7 focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2";

const TABLE = "w-full table-fixed border-collapse text-[0.82rem] [&_caption]:text-[0.85rem] [&_caption]:font-semibold [&_caption]:text-[rgb(180,180,180)] [&_caption]:text-left [&_caption]:px-4 [&_caption]:py-3 [&_caption]:caption-top [&_tbody_tr]:transition-[background,box-shadow] [&_tbody_tr]:duration-[0.15s] [&_tbody_tr]:relative [&_tbody_tr:nth-child(even)]:bg-[rgba(255,255,255,0.01)] [&_tbody_tr:hover]:bg-[rgba(36,171,243,0.03)] [&_tbody_tr:hover]:shadow-[inset_3px_0_0_rgba(36,171,243,0.5)] [&_tbody_tr:focus-within]:bg-[rgba(36,171,243,0.04)] [&_tbody_tr:focus-within]:outline [&_tbody_tr:focus-within]:outline-1 [&_tbody_tr:focus-within]:outline-[rgba(36,171,243,0.2)] [&_tbody_tr:focus-within]:outline-offset-[-1px] [&_td]:px-3.5 [&_td]:py-3 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.04)] [&_td]:align-middle [&_td]:text-[rgb(200,200,200)]";

export default function ProductTable({
  products,
  total,
  page,
  totalPages,
  sort,
  order,
  onSort,
  onPage,
}: ProductTableProps) {
  const toast = useToastStore((s) => s.toast);

  /* ── Active modal ── */
  const [activeModal, setActiveModal] = useState<ModalState>({ isOpen: false, product: null });
  const [confirmingActive, setConfirmingActive] = useState(false);

  function handleActiveClick(product: TableProduct) {
    setActiveModal({ isOpen: true, product });
  }

  async function handleActiveConfirm() {
    if (!activeModal.product) return;
    setConfirmingActive(true);
    const newActive = !activeModal.product.active;
    const result = await toggleProductActiveAction(activeModal.product.id, newActive);
    setConfirmingActive(false);
    setActiveModal({ isOpen: false, product: null });

    const activeErrorMsg = "error" in result ? result.error : undefined;
    if (activeErrorMsg) {
      toast(activeErrorMsg, "error");
    } else {
      toast(newActive ? "Producto activado" : "Producto desactivado", "success");
    }
  }

  function handleActiveCancel() {
    setActiveModal({ isOpen: false, product: null });
  }

  /* ── Featured modal ── */
  const [featuredModal, setFeaturedModal] = useState<ModalState>({ isOpen: false, product: null });
  const [confirmingFeatured, setConfirmingFeatured] = useState(false);

  function handleFeaturedClick(product: TableProduct) {
    setFeaturedModal({ isOpen: true, product });
  }

  async function handleFeaturedConfirm() {
    if (!featuredModal.product) return;
    setConfirmingFeatured(true);
    const newFeatured = !featuredModal.product.featured;
    const result = await toggleProductFeaturedAction(featuredModal.product.id, newFeatured);
    setConfirmingFeatured(false);
    setFeaturedModal({ isOpen: false, product: null });

    const featuredErrorMsg = "error" in result ? result.error : undefined;
    if (featuredErrorMsg) {
      toast(featuredErrorMsg, "error");
    } else {
      toast(newFeatured ? "Producto destacado" : "Producto no destacado", "success");
    }
  }

  function handleFeaturedCancel() {
    setFeaturedModal({ isOpen: false, product: null });
  }

  /* ── Stock modal ── */
  const [stockModal, setStockModal] = useState<ModalState>({ isOpen: false, product: null });
  const [stockValue, setStockValue] = useState("");
  const [confirmingStock, setConfirmingStock] = useState(false);

  function handleStockClick(product: TableProduct) {
    setStockValue(product.stock.toString());
    setStockModal({ isOpen: true, product });
  }

  async function handleStockConfirm() {
    if (!stockModal.product) return;
    const parsed = parseInt(stockValue);
    if (isNaN(parsed) || parsed < 0) {
      toast("Stock debe ser un número válido (>= 0)", "error");
      return;
    }
    setConfirmingStock(true);
    const result = await updateProductStockAction(stockModal.product.id, parsed);
    setConfirmingStock(false);
    setStockModal({ isOpen: false, product: null });

    const stockErrorMsg = "error" in result ? result.error : undefined;
    if (stockErrorMsg) {
      toast(stockErrorMsg, "error");
    } else {
      toast("Stock actualizado", "success");
    }
  }

  function handleStockCancel() {
    setStockModal({ isOpen: false, product: null });
  }

  /* ── Delete ── */
  const [deleteModal, setDeleteModal] = useState<ModalState>({ isOpen: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDeleteClick(product: TableProduct) {
    setDeleteModal({ isOpen: true, product });
  }

  async function handleDeleteConfirm() {
    if (!deleteModal.product) return;
    setIsDeleting(true);
    const result = await deleteProductAction(deleteModal.product.id);
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, product: null });

    const deleteErrorMsg = "error" in result ? result.error : undefined;
    if (deleteErrorMsg) {
      toast(deleteErrorMsg, "error");
    } else {
      toast("Producto eliminado", "success");
    }
  }

  function handleDeleteCancel() {
    setDeleteModal({ isOpen: false, product: null });
  }

  /* ── Empty state ── */
  if (!products || products.length === 0) {
    return (
      <div className="text-center px-6 py-14 text-[rgb(130,130,130)]" role="status">
        <Package size={48} className="mb-3.5 opacity-30" aria-hidden="true" />
        <p className="text-[0.88rem] font-semibold m-0">
          No se encontraron productos. Crea tu primer producto para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ---- DESKTOP TABLE ---- */}
      <div className="border border-[rgba(255,255,255,0.05)] rounded-[10px] overflow-x-auto bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)] max-[640px]:hidden">
        <table
          className={TABLE}
          aria-label="Lista de productos"
          role="grid"
        >
          <caption className="visually-hidden">
            Tabla de productos — {total} registros, página {page} de{" "}
            {totalPages}
          </caption>
          <thead className="sticky top-0 z-10 [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[0.68rem] [&_th]:text-[rgb(160,160,160)] [&_th]:uppercase [&_th]:tracking-[0.8px] [&_th]:bg-[rgba(16,16,16,0.98)] [&_th]:backdrop-blur-md [&_th]:border-b [&_th]:border-[rgba(36,171,243,0.12)] [&_th]:whitespace-nowrap">
            <tr>
              <th scope="col" className="w-[220px]">
                Producto
              </th>
              <th scope="col" className="w-[130px]">
                SKU
              </th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="w-20"
                  aria-sort={
                    sort === col.key
                      ? order === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-transparent border-0 text-inherit font-[inherit] text-[0.68rem] font-semibold uppercase tracking-[0.8px] cursor-pointer py-1 px-1.5 rounded transition-colors duration-[0.15s] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 group"
                    onClick={() => onSort(col.key)}
                    aria-label={`Ordenar por ${col.label}`}
                  >
                    {col.label}
                    <SortIcon column={col.key} sort={sort} order={order} />
                  </button>
                </th>
              ))}
              <th scope="col" className="w-[60px] text-center">
                Activo
              </th>
              <th scope="col" className="w-[60px] text-center">
                Destacado
              </th>
              <th scope="col" className="w-[90px] text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                {/* Product info */}
                <td>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={product.thumbnail || "/placeholder.png"}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded-md bg-[rgb(18,18,18)] border border-[rgba(255,255,255,0.06)] shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-[0.84rem] text-[rgb(220,220,220)] whitespace-nowrap overflow-hidden text-ellipsis">
                        {product.title}
                      </span>
                      <span className="text-[0.72rem] text-[rgb(130,130,130)] font-mono">
                        /{product.slug}
                      </span>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="font-mono text-[0.75rem] text-[rgb(130,130,130)] tracking-[0.3px]">{product.sku}</td>

                {/* Fecha */}
                <td className="text-[0.78rem] text-[rgb(140,140,140)]">
                  {new Date(product.createdAt).toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>

                {/* Price */}
                <td>
                  <div className="flex flex-col gap-px text-[0.84rem]">
                    <strong>{formatPrice(product.price)}</strong>
                    {product.oldPrice && (
                      <span className="line-through text-[rgb(130,130,130)] text-[0.7rem] font-medium">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock — click opens modal */}
                <td>
                  <button
                    type="button"
                    className={`${BADGE} ${getStockClass(product.stock)}`}
                    onClick={() => handleStockClick(product)}
                    aria-label={`Editar stock: ${getStockLabel(product.stock)}`}
                  >
                    {getStockLabel(product.stock)}
                  </button>
                </td>

                {/* Sold */}
                <td>{product.sold}</td>

                {/* Active toggle */}
                <td className="text-center">
                  <button
                    type="button"
                    className={`${SWITCH_BASE} ${product.active ? SWITCH_ON : SWITCH_OFF}`}
                    onClick={() => handleActiveClick(product)}
                    aria-label={
                      product.active ? "Desactivar producto" : "Activar producto"
                    }
                    aria-pressed={product.active}
                  >
                    {product.active ? (
                      <Check size={12} aria-hidden="true" />
                    ) : (
                      <XIcon size={12} aria-hidden="true" />
                    )}
                  </button>
                </td>

                {/* Featured toggle */}
                <td className="text-center">
                  <button
                    type="button"
                    className={`${SWITCH_BASE} ${product.featured ? SWITCH_ON : SWITCH_OFF}`}
                    onClick={() => handleFeaturedClick(product)}
                    aria-label={
                      product.featured
                        ? "Quitar destacado"
                        : "Marcar como destacado"
                    }
                    aria-pressed={product.featured}
                  >
                    <Star
                      size={12}
                      fill={product.featured ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </td>

                {/* Actions */}
                <td>
                  <div className="flex gap-1.5 justify-center">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className={ACTION_BTN}
                      aria-label={`Editar ${product.title}`}
                    >
                      <Edit size={14} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className={ACTION_BTN_DANGER}
                      onClick={() => handleDeleteClick(product)}
                      aria-label={`Eliminar ${product.title}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- MOBILE CARDS ---- */}
      <div className="hidden max-[640px]:flex max-[640px]:flex-col max-[640px]:gap-3">
        {products.map((product) => (
          <article key={product.id} className="bg-[rgb(14,14,14)] border border-[rgba(255,255,255,0.05)] rounded-[10px] p-3.5 transition-colors duration-200 transition-shadow duration-200 hover:border-[rgba(36,171,243,0.15)] hover:shadow-[0_0_12px_rgba(36,171,243,0.05)]">
            <div className="flex gap-2.5 mb-3">
              <img
                src={product.thumbnail || "/placeholder.png"}
                alt={product.title}
                className="w-14 h-14 object-cover rounded-lg bg-[rgb(18,18,18)] border border-[rgba(255,255,255,0.06)] shrink-0"
              />
              <div className="flex flex-col gap-[3px] min-w-0">
                <h4 className="text-[0.9rem] font-semibold text-[#e4e4e4] m-0 whitespace-nowrap overflow-hidden text-ellipsis">{product.title}</h4>
                <span className="text-[0.7rem] text-[rgb(145,145,145)] font-mono">{product.sku}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 py-2.5 border-t border-b border-[rgba(255,255,255,0.05)] mb-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Precio</span>
                <span className="text-[0.82rem] font-semibold text-[#e4e4e4]">
                  {formatPrice(product.price)}
                  {product.oldPrice && (
                    <span className="line-through text-[rgb(130,130,130)] text-[0.7rem] font-medium">
                      {" "}
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Stock</span>
                <button
                  type="button"
                  className={`${BADGE} ${getStockClass(product.stock)}`}
                  onClick={() => handleStockClick(product)}
                >
                  {getStockLabel(product.stock)}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Vendidos</span>
                <span className="text-[0.82rem] font-semibold text-[#e4e4e4]">{product.sold}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Categoría</span>
                <span className="text-[0.82rem] font-semibold text-[#e4e4e4]">
                  {product.category?.name || "—"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <button
                type="button"
                className={`${SWITCH_MOBILE_BASE} ${product.active ? SWITCH_ON : SWITCH_OFF}`}
                onClick={() => handleActiveClick(product)}
                aria-pressed={product.active}
              >
                {product.active ? (
                  <Check size={12} />
                ) : (
                  <XIcon size={12} />
                )}
                <span>{product.active ? "Activo" : "Inactivo"}</span>
              </button>

              <button
                type="button"
                className={`${SWITCH_MOBILE_BASE} ${product.featured ? SWITCH_ON : SWITCH_OFF}`}
                onClick={() => handleFeaturedClick(product)}
                aria-pressed={product.featured}
              >
                <Star
                  size={12}
                  fill={product.featured ? "currentColor" : "none"}
                />
                <span>Destacado</span>
              </button>

              <Link
                href={`/admin/products/${product.id}`}
                className={ACTION_BTN_MOBILE}
                aria-label={`Editar ${product.title}`}
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                className={ACTION_BTN_MOBILE_DANGER}
                onClick={() => handleDeleteClick(product)}
                aria-label={`Eliminar ${product.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ---- PAGINATION ---- */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 px-4 py-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(16,16,16,0.98)] max-[640px]:flex-wrap max-[640px]:gap-1" aria-label="Paginación de productos">
          <button
            type="button"
            className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.15s] font-[inherit] shrink-0 hover:bg-[rgba(36,171,243,0.06)] hover:border-[rgba(36,171,243,0.2)] hover:text-[rgb(220,220,220)] disabled:opacity-30 disabled:cursor-not-allowed max-[640px]:min-w-11 max-[640px]:h-11"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1 max-[640px]:flex-wrap max-[640px]:justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => {
                if (totalPages <= 7) return true;
                if (n === 1 || n === totalPages) return true;
                if (Math.abs(n - page) <= 1) return true;
                return false;
              })
              .map((n, idx, arr) => {
                const showEllipsis =
                  idx > 0 && n - arr[idx - 1] > 1;
                return (
                  <span key={n} className="flex items-center">
                    {showEllipsis && (
                      <span className="text-[rgb(100,100,100)] text-[0.85rem] px-0.5" aria-hidden="true">
                        …
                      </span>
                    )}
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center min-w-9 h-9 px-2 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.15s] font-[inherit] shrink-0 hover:bg-[rgba(36,171,243,0.06)] hover:border-[rgba(36,171,243,0.2)] hover:text-[rgb(220,220,220)] disabled:opacity-30 disabled:cursor-not-allowed max-[640px]:min-w-11 max-[640px]:h-11 ${
                        n === page ? "bg-[rgba(36,171,243,0.1)] border-[rgba(36,171,243,0.3)] text-[#24abf3]" : ""
                      }`}
                      onClick={() => onPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      aria-label={`Página ${n}`}
                    >
                      {n}
                    </button>
                  </span>
                );
              })}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center min-w-9 h-9 px-2 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.15s] font-[inherit] shrink-0 hover:bg-[rgba(36,171,243,0.06)] hover:border-[rgba(36,171,243,0.2)] hover:text-[rgb(220,220,220)] disabled:opacity-30 disabled:cursor-not-allowed max-[640px]:min-w-11 max-[640px]:h-11"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.product?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isConfirming={isDeleting}
      />

      <ConfirmModal
        isOpen={activeModal.isOpen}
        title={activeModal.product?.active ? "Desactivar producto" : "Activar producto"}
        message={`¿Estás seguro de que deseas ${activeModal.product?.active ? "desactivar" : "activar"} "${activeModal.product?.title}"?`}
        confirmLabel={activeModal.product?.active ? "Desactivar" : "Activar"}
        variant="primary"
        onConfirm={handleActiveConfirm}
        onCancel={handleActiveCancel}
        isConfirming={confirmingActive}
      />

      <ConfirmModal
        isOpen={featuredModal.isOpen}
        title={featuredModal.product?.featured ? "Quitar destacado" : "Marcar como destacado"}
        message={`¿Estás seguro de que deseas ${featuredModal.product?.featured ? "quitar el destacado de" : "marcar como destacado"} "${featuredModal.product?.title}"?`}
        confirmLabel={featuredModal.product?.featured ? "Quitar destacado" : "Destacar"}
        variant="primary"
        onConfirm={handleFeaturedConfirm}
        onCancel={handleFeaturedCancel}
        isConfirming={confirmingFeatured}
      />

      <StockEditModal
        isOpen={stockModal.isOpen}
        product={stockModal.product ? { title: stockModal.product.title, stock: stockModal.product.stock } : null}
        value={stockValue}
        onChange={setStockValue}
        onConfirm={handleStockConfirm}
        onCancel={handleStockCancel}
        isConfirming={confirmingStock}
      />
    </>
  );
}
