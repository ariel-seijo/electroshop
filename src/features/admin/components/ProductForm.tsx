"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Star, Check, X as XIcon, Wand2, Loader2 } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  generateSkuAction,
  getProductAction,
} from "@/features/admin/actions/productActions";
import { reorderProductImagesAction } from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";
import ImageUploadWidget from "./ImageUploadWidget";
import AdminGallery from "./AdminGallery";
import ThumbnailUploader from "./ThumbnailUploader";
import ProductCardPreview from "./ProductCardPreview";
import styles from "./ProductForm.module.css";

interface FormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  stock: string;
  brand: string;
  sku: string;
  categoryId: string;
  thumbnail: string;
  images: string[];
  rating: string;
  sold: string;
  featured: boolean;
  active: boolean;
}

interface ProductRecord {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  brand: string;
  sku: string | null;
  categoryId: number | null;
  thumbnail: string | null;
  images: string[] | null;
  imagesRel?: { id: string; url: string; format: string; width: number; height: number }[];
  rating: number;
  sold: number;
  featured: boolean;
  active: boolean;
  category?: { name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: number | null;
  product?: ProductRecord | null;
  categories: Category[];
  brands?: string[];
  onRefreshProduct?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

interface GalleryImage {
  id: string;
  url: string;
  format: string;
  width: number;
  height: number;
  _legacy?: boolean;
}

const initialFormState: FormData = {
  title: "",
  slug: "",
  description: "",
  price: "",
  oldPrice: "",
  stock: "",
  brand: "",
  sku: "",
  categoryId: "",
  thumbnail: "",
  images: [],
  rating: "0",
  sold: "0",
  featured: false,
  active: true,
};

export default function ProductForm({
  mode,
  productId,
  product,
  categories,
  brands = [],
  onRefreshProduct,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEdit = mode === "edit";
  const toast = useToastStore((s) => s.toast);

  const [formData, setFormData] = useState<FormData>(() => {
    if (product) {
      return {
        title: product.title || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        oldPrice: product.oldPrice?.toString() || "",
        stock: product.stock?.toString() || "",
        brand: product.brand || "",
        sku: product.sku || "",
        categoryId: product.categoryId?.toString() || "",
        thumbnail: product.thumbnail || "",
        images: product.images?.filter((img) => img) || [],
        rating: product.rating?.toString() || "0",
        sold: product.sold?.toString() || "0",
        featured: product.featured || false,
        active: product.active !== false,
      };
    }
    return initialFormState;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingSku, setIsGeneratingSku] = useState<boolean>(false);
  const [formVersion, setFormVersion] = useState<number>(0);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [localProduct, setLocalProduct] = useState<ProductRecord | null>(null);
  const [galleryOrder, setGalleryOrder] = useState<string[] | null>(null);
  const [isCustomBrand, setIsCustomBrand] = useState<boolean>(() => {
    if (product && brands.length > 0) {
      return !!product.brand && !brands.includes(product.brand);
    }
    return false;
  });

  const effectiveProductId = createdProductId || productId;
  const effectiveProduct = product || localProduct;

  const productImagesRel = effectiveProduct?.imagesRel || [];
  const productImagesLegacy = effectiveProduct?.images || [];
  const productImages: GalleryImage[] =
    productImagesRel.length > 0
      ? productImagesRel
      : productImagesLegacy.map((url, i) => ({
          id: `legacy-${i}`,
          url,
          format: "legacy",
          width: 0,
          height: 0,
          _legacy: true,
        }));

  /* ── Field change ── */

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const name = target.name;
    const value: string | boolean =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setFormData(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as FormData)
    );
    const key = name as keyof FormData;
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleToggle(key: "featured" | "active") {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] } as FormData));
  }

  async function handleRefresh() {
    setGalleryOrder(null);
    setFormVersion((v) => v + 1);
    if (onRefreshProduct) {
      onRefreshProduct();
    } else if (createdProductId) {
      const res = await getProductAction(createdProductId);
      if ("success" in res && res.success) {
        setLocalProduct(res.product as unknown as ProductRecord);
      }
    }
  }

  function handleBrandSelect(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "__custom_brand__") {
      setIsCustomBrand(true);
      if (brands.includes(formData.brand)) {
        setFormData((prev) => ({ ...prev, brand: "" }));
      }
    } else {
      setIsCustomBrand(false);
      setFormData((prev) => ({ ...prev, brand: value }));
    }
    if (errors.brand) {
      setErrors((prev) => ({ ...prev, brand: "" }));
    }
  }

  /* ── Slug auto-generate ── */

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleBlur() {
    if (!isEdit && formData.title && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }

  /* ── SKU generation ── */

  async function handleGenerateSku() {
    if (!formData.categoryId) {
      toast("Selecciona una categoría primero", "error");
      return;
    }
    if (!formData.brand.trim()) {
      toast("Ingresa la marca primero", "error");
      return;
    }
    if (!formData.title.trim()) {
      toast("Ingresa el título primero", "error");
      return;
    }

    setIsGeneratingSku(true);
    const result = await generateSkuAction(
      formData.categoryId,
      formData.brand,
      formData.title
    );
    setIsGeneratingSku(false);

    const skuErrorMsg = "error" in result ? result.error : undefined;
    if (skuErrorMsg) {
      toast(skuErrorMsg, "error");
    } else {
      setFormData((prev) => ({ ...prev, sku: result.sku } as FormData));
      toast("SKU generado", "success");
    }
  }

  /* ── Validation ── */

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = "El título es obligatorio";
    if (!formData.slug.trim()) newErrors.slug = "El slug es obligatorio";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "El precio válido es obligatorio";
    if (formData.stock === "" || parseInt(formData.stock) < 0)
      newErrors.stock = "El inventario válido es obligatorio";
    if (!formData.categoryId)
      newErrors.categoryId = "La categoría es obligatoria";
    if (!formData.thumbnail)
      newErrors.thumbnail = "La miniatura es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ── Submit ── */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      rating: parseFloat(formData.rating) || 0,
      sold: parseInt(formData.sold) || 0,
    };

    const isFirstCreate = !isEdit && !createdProductId;

    const result = isFirstCreate
      ? await createProductAction(data)
      : await updateProductAction(effectiveProductId!, data);

    const submitErrorMsg = "error" in result ? result.error : undefined;
    if (submitErrorMsg) {
      toast(submitErrorMsg, "error");
      setIsSubmitting(false);
      return;
    }

    let currentProductId = effectiveProductId;

    if (isFirstCreate) {
      const product = result.product as unknown as ProductRecord;
      setCreatedProductId(product.id);
      setLocalProduct(product);
      currentProductId = product.id;
    }

    if (galleryOrder && currentProductId) {
      await reorderProductImagesAction(currentProductId, galleryOrder);
      setGalleryOrder(null);
    }

    setIsSubmitting(false);

    if (isFirstCreate) {
      toast(
        "Producto creado. Ahora podés agregar imágenes a la galería.",
        "success"
      );
    } else {
      toast("Producto actualizado", "success");
      onSuccess?.();
    }
  }

  /* ── Helpers ── */

  const fieldErrorId = (name: keyof FormData): string | undefined =>
    errors[name] ? `${name}-error` : undefined;

  return (
    <div className={styles.layout}>
      <form
        onSubmit={handleSubmit}
        className={styles.main}
        noValidate
      >
        {/* ======== SECTION 1: Información general ======== */}
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Información general</legend>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="title">
              <span className={styles.labelRequired}>Título</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
              value={formData.title}
              onChange={handleChange}
              onBlur={handleTitleBlur}
              placeholder="Título del producto"
              aria-invalid={!!errors.title}
              aria-describedby={fieldErrorId("title")}
            />
            {errors.title && (
              <span className={styles.error} id="title-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="slug">
              <span className={styles.labelRequired}>Slug</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              className={`${styles.input} ${styles.inputMono} ${errors.slug ? styles.inputError : ""}`}
              value={formData.slug}
              onChange={handleChange}
              placeholder="slug-url-producto"
              aria-invalid={!!errors.slug}
              aria-describedby={fieldErrorId("slug")}
            />
            {errors.slug && (
              <span className={styles.error} id="slug-error" role="alert">
                {errors.slug}
              </span>
            )}
            <span className={styles.hint}>
              Se genera automáticamente del título si se deja vacío al crear
            </span>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del producto…"
              rows={4}
            />
          </div>
        </fieldset>

        {/* ======== SECTION 2: Precios y Stock ======== */}
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Precios y Stock</legend>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="price">
                <span className={styles.labelRequired}>Precio ($)</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                inputMode="decimal"
                className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                aria-invalid={!!errors.price}
                aria-describedby={fieldErrorId("price")}
              />
              {errors.price && (
                <span className={styles.error} id="price-error" role="alert">
                  {errors.price}
                </span>
              )}
            </div>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="oldPrice">
                Precio anterior ($)
              </label>
              <input
                type="number"
                id="oldPrice"
                name="oldPrice"
                inputMode="decimal"
                className={styles.input}
                value={formData.oldPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="stock">
                <span className={styles.labelRequired}>Inventario</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                inputMode="numeric"
                className={`${styles.input} ${errors.stock ? styles.inputError : ""}`}
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                aria-invalid={!!errors.stock}
                aria-describedby={fieldErrorId("stock")}
              />
              {errors.stock && (
                <span className={styles.error} id="stock-error" role="alert">
                  {errors.stock}
                </span>
              )}
            </div>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="brand">
                Marca
              </label>
              {!isCustomBrand ? (
                <select
                  id="brand"
                  name="brand"
                  className={styles.select}
                  value={formData.brand}
                  onChange={handleBrandSelect}
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__custom_brand__">Otra...</option>
                </select>
              ) : (
                <div className={styles.skuRow}>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    className={styles.input}
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Escribí la marca"
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.skuBtn}
                    onClick={() => {
                      setIsCustomBrand(false);
                      setFormData((prev) => ({ ...prev, brand: "" }));
                    }}
                    title="Volver a la lista de marcas"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* ======== SECTION 3: SKU y Clasificación ======== */}
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>SKU y Clasificación</legend>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="sku">
              SKU
            </label>
            <div className={styles.skuRow}>
              <input
                type="text"
                id="sku"
                name="sku"
                className={`${styles.input} ${styles.inputMono}`}
                value={formData.sku}
                onChange={handleChange}
                placeholder="COMP-CAT-BRD-MODEL-001"
                aria-label="SKU del producto"
              />
              <button
                type="button"
                className={styles.skuBtn}
                onClick={handleGenerateSku}
                disabled={isGeneratingSku}
                aria-label="Generar SKU automáticamente"
              >
                {isGeneratingSku ? (
                  <Loader2 size={14} className={styles.spin} aria-hidden="true" />
                ) : (
                  <Wand2 size={14} aria-hidden="true" />
                )}
                Generar
              </button>
            </div>
            <span className={styles.hint}>
              Formato: COMP-&#123;CAT&#125;-&#123;BRD&#125;-&#123;MODELO&#125;-&#123;SEQ&#125;
            </span>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="categoryId">
                <span className={styles.labelRequired}>Categoría</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className={`${styles.select} ${errors.categoryId ? styles.inputError : ""}`}
                value={formData.categoryId}
                onChange={handleChange}
                aria-invalid={!!errors.categoryId}
                aria-describedby={fieldErrorId("categoryId")}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className={styles.error} id="categoryId-error" role="alert">
                  {errors.categoryId}
                </span>
              )}
            </div>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="rating">
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                className={styles.input}
                value={formData.rating}
                onChange={handleChange}
                placeholder="0"
                step="0.1"
                min="0"
                max="5"
              />
            </div>
          </div>
        </fieldset>

        {/* ======== SECTION 4: Medios ======== */}
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Medios</legend>

          <div className={styles.group}>
            <label className={styles.label}>
              <span className={styles.labelRequired}>Miniatura</span>
            </label>
            <ThumbnailUploader
              key={`thumb-${formVersion}`}
              value={formData.thumbnail}
              onChange={(url: string) => {
                setFormData((prev) => ({ ...prev, thumbnail: url }));
                if (errors.thumbnail) {
                  setErrors((prev) => ({ ...prev, thumbnail: "" }));
                }
              }}
            />
            {errors.thumbnail && (
              <span className={styles.error} id="thumbnail-error" role="alert">
                {errors.thumbnail}
              </span>
            )}
          </div>

          {effectiveProductId ? (
            <div className={styles.group}>
              <label className={styles.label}>
                Galería Cloudinary ({productImages.length}/10)
              </label>
              <AdminGallery
                images={productImages}
                onImageDeleted={() => handleRefresh()}
                onReorder={setGalleryOrder}
                onDelete={
                  productImagesRel.length === 0
                    ? async (imageId: string) => {
                        const idx = parseInt(imageId.replace("legacy-", ""));
                        const updated = [...formData.images];
                        updated.splice(idx, 1);
                        setFormData((prev) => ({ ...prev, images: updated }));
                      }
                    : undefined
                }
              />
              <div className={styles.galleryUpload}>
                <ImageUploadWidget
                  productId={effectiveProductId}
                  existingCount={productImagesRel.length}
                  onImagesUploaded={() => handleRefresh()}
                />
              </div>
            </div>
          ) : (
            <div className={styles.group}>
              <label className={styles.label}>Galería Cloudinary</label>
              <div className={styles.galleryPlaceholder}>
                <span>
                  La galería de imágenes estará disponible después de crear el
                  producto.
                </span>
              </div>
            </div>
          )}
        </fieldset>

        {/* ======== SECTION 5: Estado ======== */}
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Estado del producto</legend>

          <div className={styles.toggles}>
            <button
              type="button"
              className={`${styles.switch} ${formData.active ? styles.switchOn : styles.switchOff}`}
              onClick={() => handleToggle("active")}
              aria-pressed={formData.active}
              aria-label={formData.active ? "Desactivar producto" : "Activar producto"}
            >
              {formData.active ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <XIcon size={14} aria-hidden="true" />
              )}
              <span>{formData.active ? "Activo" : "Inactivo"}</span>
            </button>

            <button
              type="button"
              className={`${styles.switch} ${formData.featured ? styles.switchOn : styles.switchOff}`}
              onClick={() => handleToggle("featured")}
              aria-pressed={formData.featured}
              aria-label={formData.featured ? "Quitar destacado" : "Marcar como destacado"}
            >
              <Star
                size={14}
                fill={formData.featured ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <span>Destacado</span>
            </button>
          </div>
        </fieldset>

        {/* ======== Actions ======== */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                {isEdit || createdProductId ? "Actualizando…" : "Creando…"}
              </>
            ) : isEdit || createdProductId ? (
              "Actualizar producto"
            ) : (
              "Crear producto"
            )}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            disabled={isSubmitting}
            onClick={() => onCancel?.()}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* ======== Live Preview ======== */}
      <aside className={styles.preview} aria-label="Vista previa del producto">
        <h3 className={styles.previewTitle}>Vista previa</h3>
        <ProductCardPreview
          product={{
            thumbnail: formData.thumbnail,
            title: formData.title,
            brand: formData.brand,
            price: parseFloat(formData.price) || 0,
            oldPrice: parseFloat(formData.oldPrice) || 0,
            stock: parseInt(formData.stock) || 0,
            rating: parseFloat(formData.rating) || 0,
            sold: parseInt(formData.sold) || 0,
            featured: formData.featured,
            category: categories.find(
              (c) => c.id.toString() === formData.categoryId
            ) || null,
          }}
        />
      </aside>
    </div>
  );
}
