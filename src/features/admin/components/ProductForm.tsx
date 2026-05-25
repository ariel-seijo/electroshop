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

  const inputClass =
    "py-2 px-3 bg-[#080808] border-[1.5px] border-[rgb(45,45,45)] rounded-[7px] text-[#e4e4e4] text-[0.84rem] font-[inherit] transition-all duration-200 placeholder:text-[rgb(65,65,65)] focus:outline-none focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.2)] max-[640px]:py-2.5 max-[640px]:min-h-11";
  const inputMonoClass = "font-mono text-[0.78rem] tracking-[0.3px]";
  const inputErrorClass =
    "border-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.15)] focus:border-[#ef4444] focus:shadow-[0_0_12px_rgba(239,68,68,0.25)]";

  return (
    <div className="grid grid-cols-[1fr_320px] gap-7 items-start min-w-0 max-md:grid-cols-1">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-0 min-w-0"
        noValidate
      >
        {/* ======== SECTION 1: Información general ======== */}
        <fieldset className="border border-[rgb(35,35,35)] rounded-[10px] px-[22px] py-5 mb-[18px] bg-[rgb(10,10,10)] transition-colors duration-[0.25s] hover:border-[rgb(50,50,50)] focus-within:border-[rgba(36,171,243,0.4)] focus-within:shadow-[0_0_12px_rgba(36,171,243,0.06)] max-[640px]:py-3.5 max-[640px]:px-4">
          <legend className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-[#24abf3] px-2 mb-4 w-auto">Información general</legend>

          <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
            <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="title">
              <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Título</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`${inputClass} ${errors.title ? inputErrorClass : ""}`}
              value={formData.title}
              onChange={handleChange}
              onBlur={handleTitleBlur}
              placeholder="Título del producto"
              aria-invalid={!!errors.title}
              aria-describedby={fieldErrorId("title")}
            />
            {errors.title && (
              <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="title-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
            <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="slug">
              <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Slug</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              className={`${inputClass} ${inputMonoClass} ${errors.slug ? inputErrorClass : ""}`}
              value={formData.slug}
              onChange={handleChange}
              placeholder="slug-url-producto"
              aria-invalid={!!errors.slug}
              aria-describedby={fieldErrorId("slug")}
            />
            {errors.slug && (
              <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="slug-error" role="alert">
                {errors.slug}
              </span>
            )}
            <span className="text-[0.68rem] text-[rgb(100,100,100)] italic">
              Se genera automáticamente del título si se deja vacío al crear
            </span>
          </div>

          <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
            <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className="py-2.5 px-3 bg-[#080808] border-[1.5px] border-[rgb(45,45,45)] rounded-[7px] text-[#e4e4e4] text-[0.84rem] font-[inherit] resize-y min-h-20 transition-all duration-200 placeholder:text-[rgb(65,65,65)] focus:outline-none focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.2)]"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del producto…"
              rows={4}
            />
          </div>
        </fieldset>

        {/* ======== SECTION 2: Precios y Stock ======== */}
        <fieldset className="border border-[rgb(35,35,35)] rounded-[10px] px-[22px] py-5 mb-[18px] bg-[rgb(10,10,10)] transition-colors duration-[0.25s] hover:border-[rgb(50,50,50)] focus-within:border-[rgba(36,171,243,0.4)] focus-within:shadow-[0_0_12px_rgba(36,171,243,0.06)] max-[640px]:py-3.5 max-[640px]:px-4">
          <legend className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-[#24abf3] px-2 mb-4 w-auto">Precios y Stock</legend>

          <div className="flex gap-3.5 mb-0 max-[640px]:flex-col max-[640px]:gap-0">
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="price">
                <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Precio ($)</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                inputMode="decimal"
                className={`${inputClass} ${errors.price ? inputErrorClass : ""}`}
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                aria-invalid={!!errors.price}
                aria-describedby={fieldErrorId("price")}
              />
              {errors.price && (
                <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="price-error" role="alert">
                  {errors.price}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="oldPrice">
                Precio anterior ($)
              </label>
              <input
                type="number"
                id="oldPrice"
                name="oldPrice"
                inputMode="decimal"
                className={inputClass}
                value={formData.oldPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3.5 mb-0 max-[640px]:flex-col max-[640px]:gap-0">
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="stock">
                <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Inventario</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                inputMode="numeric"
                className={`${inputClass} ${errors.stock ? inputErrorClass : ""}`}
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                aria-invalid={!!errors.stock}
                aria-describedby={fieldErrorId("stock")}
              />
              {errors.stock && (
                <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="stock-error" role="alert">
                  {errors.stock}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="brand">
                Marca
              </label>
              {!isCustomBrand ? (
                <select
                  id="brand"
                  name="brand"
                  className="py-2 pl-3 pr-[30px] bg-[#080808] border-[1.5px] border-[rgb(45,45,45)] rounded-[7px] text-[#e4e4e4] text-[0.84rem] font-[inherit] cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] transition-all duration-200 focus:outline-none focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.2)] bg-[url('data:image/svg+xml,%3Csvg%20width=%2710%27%20height=%276%27%20fill=%27none%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27m1%201%204%204%204-4%27%20stroke=%27%23828282%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')]"
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
                <div className="flex gap-2 [&_input]:flex-1">
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    className={inputClass}
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Escribí la marca"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 bg-[rgba(36,171,243,0.08)] border-[1.5px] border-[rgba(36,171,243,0.3)] rounded-[7px] text-[#24abf3] text-[0.75rem] font-semibold font-[inherit] cursor-pointer whitespace-nowrap transition-all duration-200 min-h-10 hover:bg-[rgba(36,171,243,0.15)] hover:shadow-[0_0_10px_rgba(36,171,243,0.2)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2"
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
        <fieldset className="border border-[rgb(35,35,35)] rounded-[10px] px-[22px] py-5 mb-[18px] bg-[rgb(10,10,10)] transition-colors duration-[0.25s] hover:border-[rgb(50,50,50)] focus-within:border-[rgba(36,171,243,0.4)] focus-within:shadow-[0_0_12px_rgba(36,171,243,0.06)] max-[640px]:py-3.5 max-[640px]:px-4">
          <legend className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-[#24abf3] px-2 mb-4 w-auto">SKU y Clasificación</legend>

          <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
            <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="sku">
              SKU
            </label>
            <div className="flex gap-2 [&_input]:flex-1">
              <input
                type="text"
                id="sku"
                name="sku"
                className={`${inputClass} ${inputMonoClass}`}
                value={formData.sku}
                onChange={handleChange}
                placeholder="COMP-CAT-BRD-MODEL-001"
                aria-label="SKU del producto"
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 bg-[rgba(36,171,243,0.08)] border-[1.5px] border-[rgba(36,171,243,0.3)] rounded-[7px] text-[#24abf3] text-[0.75rem] font-semibold font-[inherit] cursor-pointer whitespace-nowrap transition-all duration-200 min-h-10 hover:bg-[rgba(36,171,243,0.15)] hover:shadow-[0_0_10px_rgba(36,171,243,0.2)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2"
                onClick={handleGenerateSku}
                disabled={isGeneratingSku}
                aria-label="Generar SKU automáticamente"
              >
                {isGeneratingSku ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Wand2 size={14} aria-hidden="true" />
                )}
                Generar
              </button>
            </div>
            <span className="text-[0.68rem] text-[rgb(100,100,100)] italic">
              Formato: COMP-&#123;CAT&#125;-&#123;BRD&#125;-&#123;MODELO&#125;-&#123;SEQ&#125;
            </span>
          </div>

          <div className="flex gap-3.5 mb-0 max-[640px]:flex-col max-[640px]:gap-0">
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="categoryId">
                <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Categoría</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className={`py-2 pl-3 pr-[30px] bg-[#080808] border-[1.5px] border-[rgb(45,45,45)] rounded-[7px] text-[#e4e4e4] text-[0.84rem] font-[inherit] cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] transition-all duration-200 focus:outline-none focus:border-[#24abf3] focus:shadow-[0_0_10px_rgba(36,171,243,0.2)] bg-[url('data:image/svg+xml,%3Csvg%20width=%2710%27%20height=%276%27%20fill=%27none%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27m1%201%204%204%204-4%27%20stroke=%27%23828282%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')] ${errors.categoryId ? inputErrorClass : ""}`}
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
                <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="categoryId-error" role="alert">
                  {errors.categoryId}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]" htmlFor="rating">
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                className={inputClass}
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
        <fieldset className="border border-[rgb(35,35,35)] rounded-[10px] px-[22px] py-5 mb-[18px] bg-[rgb(10,10,10)] transition-colors duration-[0.25s] hover:border-[rgb(50,50,50)] focus-within:border-[rgba(36,171,243,0.4)] focus-within:shadow-[0_0_12px_rgba(36,171,243,0.06)] max-[640px]:py-3.5 max-[640px]:px-4">
          <legend className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-[#24abf3] px-2 mb-4 w-auto">Medios</legend>

          <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
            <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]">
              <span className="after:content-['_*'] after:text-[#ef4444] after:font-semibold">Miniatura</span>
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
              <span className="text-[0.72rem] font-semibold text-[#ef4444] flex items-center gap-1" id="thumbnail-error" role="alert">
                {errors.thumbnail}
              </span>
            )}
          </div>

          {effectiveProductId ? (
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]">
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
              <div className="mt-3">
                <ImageUploadWidget
                  productId={effectiveProductId}
                  existingCount={productImagesRel.length}
                  onImagesUploaded={() => handleRefresh()}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[5px] mb-3.5 flex-1 min-w-0">
              <label className="text-[0.72rem] font-semibold text-[#a0a0a0] tracking-[0.3px]">Galería Cloudinary</label>
              <div className="flex items-center justify-center px-5 py-7 bg-[rgba(0,127,255,0.04)] border border-dashed border-[rgba(0,127,255,0.18)] rounded-lg text-[0.78rem] text-[#6a8eb8] text-center leading-relaxed">
                <span>
                  La galería de imágenes estará disponible después de crear el
                  producto.
                </span>
              </div>
            </div>
          )}
        </fieldset>

        {/* ======== SECTION 5: Estado ======== */}
        <fieldset className="border border-[rgb(35,35,35)] rounded-[10px] px-[22px] py-5 mb-[18px] bg-[rgb(10,10,10)] transition-colors duration-[0.25s] hover:border-[rgb(50,50,50)] focus-within:border-[rgba(36,171,243,0.4)] focus-within:shadow-[0_0_12px_rgba(36,171,243,0.06)] max-[640px]:py-3.5 max-[640px]:px-4">
          <legend className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-[#24abf3] px-2 mb-4 w-auto">Estado del producto</legend>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 border-[1.5px] rounded-lg text-[0.8rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 min-h-[42px] hover:border-[rgb(75,75,75)] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 ${formData.active ? "bg-[rgba(36,171,243,0.08)] border-[#24abf3] text-[#24abf3] shadow-[0_0_10px_rgba(36,171,243,0.12)]" : "bg-[rgb(15,15,15)] border-[rgb(45,45,45)] text-[rgb(100,100,100)]"}`}
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
              className={`inline-flex items-center gap-2 px-4 py-2 border-[1.5px] rounded-lg text-[0.8rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 min-h-[42px] hover:border-[rgb(75,75,75)] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 ${formData.featured ? "bg-[rgba(36,171,243,0.08)] border-[#24abf3] text-[#24abf3] shadow-[0_0_10px_rgba(36,171,243,0.12)]" : "bg-[rgb(15,15,15)] border-[rgb(45,45,45)] text-[rgb(100,100,100)]"}`}
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
        <div className="flex gap-2.5 pt-1.5 mb-3 max-[640px]:sticky max-[640px]:bottom-0 max-[640px]:z-20 max-[640px]:bg-[rgb(10,10,10)] max-[640px]:border-t max-[640px]:border-[rgb(35,35,35)] max-[640px]:py-3 max-[640px]:mb-0">
          <button
            type="submit"
            className="inline-flex items-center gap-2 py-2.5 px-6 bg-[#007fff] border-0 rounded-lg text-white text-[0.82rem] font-semibold font-[inherit] cursor-pointer tracking-[0.3px] transition-all duration-200 min-h-11 hover:bg-[#3399ff] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,127,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
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
            className="inline-flex items-center gap-2 py-2.5 px-6 bg-[rgb(20,20,20)] border-[1.5px] border-[rgb(50,50,50)] rounded-lg text-[#a0a0a0] text-[0.82rem] font-semibold font-[inherit] cursor-pointer no-underline transition-all duration-200 min-h-11 hover:bg-[rgb(30,30,30)] hover:border-[#24abf3] hover:text-[#24abf3] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            onClick={() => onCancel?.()}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* ======== Live Preview ======== */}
      <aside className="sticky top-[calc(64px+28px)] bg-[rgb(10,10,10)] border border-[rgb(35,35,35)] rounded-xl p-[18px]" aria-label="Vista previa del producto">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-[1px] text-[#24abf3] mb-3.5 pb-2.5 border-b border-[rgb(35,35,35)]">Vista previa</h3>
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
