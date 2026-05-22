"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/features/admin/components/ProductForm";
import { useToastStore } from "@/features/toast";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [categories, setCategories] = useState<Array<Record<string, unknown>>>([]);
  const [brands, setBrands] = useState<unknown[]>([]);
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
      const productData = await productRes.json();
      setProduct(productData);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
    } catch (err) {
      setError((err as Error).message);
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
            Editar producto: {(product as Record<string, unknown>)?.title as string}
          </h3>
        </div>
        <ProductForm
          mode="edit"
          productId={product ? parseInt(productId) : undefined}
          product={product}
          categories={categories}
          brands={brands as never}
          onRefreshProduct={fetchProduct}
          onSuccess={handleSuccess}
          onCancel={handleSuccess}
        />
      </div>
    </div>
  );
}
