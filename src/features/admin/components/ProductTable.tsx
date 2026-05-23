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
import styles from "./ProductTable.module.css";

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
    return <ArrowUp size={12} className={styles.sortIconInactive} aria-hidden="true" />;
  }
  return order === "asc" ? (
    <ArrowUp size={12} className={styles.sortIconActive} aria-hidden="true" />
  ) : (
    <ArrowDown size={12} className={styles.sortIconActive} aria-hidden="true" />
  );
}

function getStockClass(stock: number): string {
  if (stock === 0) return styles.badgeDanger;
  if (stock < 10) return styles.badgeWarning;
  return styles.badgeSuccess;
}

function getStockLabel(stock: number): string {
  if (stock === 0) return "Agotado";
  if (stock < 10) return `Bajo (${stock})`;
  return `Stock (${stock})`;
}

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
      <div className={styles.empty} role="status">
        <Package size={48} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>
          No se encontraron productos. Crea tu primer producto para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ---- DESKTOP TABLE ---- */}
      <div className={styles.tableWrapper}>
        <table
          className={styles.table}
          aria-label="Lista de productos"
          role="grid"
        >
          <caption className="visually-hidden">
            Tabla de productos — {total} registros, página {page} de{" "}
            {totalPages}
          </caption>
          <thead className={styles.thead}>
            <tr>
              <th scope="col" className={styles.thProduct}>
                Producto
              </th>
              <th scope="col" className={styles.thSku}>
                SKU
              </th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={styles.thSortable}
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
                    className={styles.sortBtn}
                    onClick={() => onSort(col.key)}
                    aria-label={`Ordenar por ${col.label}`}
                  >
                    {col.label}
                    <SortIcon column={col.key} sort={sort} order={order} />
                  </button>
                </th>
              ))}
              <th scope="col" className={styles.thToggle}>
                Activo
              </th>
              <th scope="col" className={styles.thToggle}>
                Destacado
              </th>
              <th scope="col" className={styles.thActions}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={styles.row}>
                {/* Product info */}
                <td>
                  <div className={styles.productCell}>
                    <img
                      src={product.thumbnail || "/placeholder.png"}
                      alt={product.title}
                      className={styles.thumb}
                    />
                    <div className={styles.productInfo}>
                      <span className={styles.productTitle}>
                        {product.title}
                      </span>
                      <span className={styles.productSlug}>
                        /{product.slug}
                      </span>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className={styles.skuCell}>{product.sku}</td>

                {/* Fecha */}
                <td className={styles.dateCell}>
                  {new Date(product.createdAt).toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>

                {/* Price */}
                <td>
                  <div className={styles.priceCell}>
                    <strong>{formatPrice(product.price)}</strong>
                    {product.oldPrice && (
                      <span className={styles.oldPrice}>
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock — click opens modal */}
                <td>
                  <button
                    type="button"
                    className={`${styles.badge} ${getStockClass(product.stock)}`}
                    onClick={() => handleStockClick(product)}
                    aria-label={`Editar stock: ${getStockLabel(product.stock)}`}
                  >
                    {getStockLabel(product.stock)}
                  </button>
                </td>

                {/* Sold */}
                <td>{product.sold}</td>

                {/* Active toggle */}
                <td className={styles.toggleCell}>
                  <button
                    type="button"
                    className={`${styles.switch} ${
                      product.active ? styles.switchOn : styles.switchOff
                    }`}
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
                <td className={styles.toggleCell}>
                  <button
                    type="button"
                    className={`${styles.switch} ${
                      product.featured ? styles.switchOn : styles.switchOff
                    }`}
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
                  <div className={styles.actionsCell}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className={styles.actionBtn}
                      aria-label={`Editar ${product.title}`}
                    >
                      <Edit size={14} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
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
      <div className={styles.mobileCards}>
        {products.map((product) => (
          <article key={product.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <img
                src={product.thumbnail || "/placeholder.png"}
                alt={product.title}
                className={styles.cardThumb}
              />
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle}>{product.title}</h4>
                <span className={styles.cardSku}>{product.sku}</span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Precio</span>
                <span className={styles.cardValue}>
                  {formatPrice(product.price)}
                  {product.oldPrice && (
                    <span className={styles.oldPrice}>
                      {" "}
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Stock</span>
                <button
                  type="button"
                  className={`${styles.badge} ${getStockClass(product.stock)}`}
                  onClick={() => handleStockClick(product)}
                >
                  {getStockLabel(product.stock)}
                </button>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Vendidos</span>
                <span className={styles.cardValue}>{product.sold}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Categoría</span>
                <span className={styles.cardValue}>
                  {product.category?.name || "—"}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                type="button"
                className={`${styles.switch} ${
                  product.active ? styles.switchOn : styles.switchOff
                }`}
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
                className={`${styles.switch} ${
                  product.featured ? styles.switchOn : styles.switchOff
                }`}
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
                className={styles.actionBtn}
                aria-label={`Editar ${product.title}`}
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
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
        <nav className={styles.pagination} aria-label="Paginación de productos">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.pageNumbers}>
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
                  <span key={n} className={styles.pageGroup}>
                    {showEllipsis && (
                      <span className={styles.ellipsis} aria-hidden="true">
                        …
                      </span>
                    )}
                    <button
                      type="button"
                      className={`${styles.pageBtn} ${
                        n === page ? styles.pageBtnActive : ""
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
            className={styles.pageBtn}
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
