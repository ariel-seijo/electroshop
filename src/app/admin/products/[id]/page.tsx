"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/features/admin/components/ProductForm";
import { useToastStore } from "@/features/toast";
import { getErrorMessage } from "@/lib/errors";

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

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);

  const productId = params?.id;

  const fetchProduct = useCallback(async () => {
    try {
      const [productRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      if (!productRes.ok) throw new Error("Error al obtener el producto");
      const productData = await productRes.json() as ProductRecord;
      setProduct(productData);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json() as Category[];
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json() as string[];
        setBrands(brandsData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
  }, [productId, fetchProduct]);

  function handleSuccess() {
    router.push("/admin/products");
  }

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (error && !product) {
    return (
      <div className="error-message" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="page-back-wrapper">
        <Link href="/admin/products" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          Volver a productos
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Editar producto: {product?.title}
          </h3>
        </div>
        <ProductForm
          mode="edit"
          productId={product ? parseInt(productId) : undefined}
          product={product}
          categories={categories}
          brands={brands}
          onRefreshProduct={fetchProduct}
          onSuccess={handleSuccess}
          onCancel={handleSuccess}
        />
      </div>
    </div>
  );
}
