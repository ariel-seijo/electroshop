"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/features/admin";
import { useToastStore } from "@/features/toast";

export default function NewProductPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const [catRes, brandsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        if (!catRes.ok) throw new Error("Error al obtener las categorías");
        const catData = await catRes.json() as { id: number; name: string }[];
        setCategories(catData);
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json() as string[];
          setBrands(brandsData);
        }
      } catch (error) {
        console.error("[LOAD FORM DATA ERROR]", error);
        toast("Error al cargar categorías", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [toast]);

  function handleSuccess() {
    router.push("/admin/products");
  }

  if (loading) {
    return <div className="loading-spinner" />;
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
          <h3 className="admin-card-title">Crear nuevo producto</h3>
        </div>
        <ProductForm mode="create" categories={categories} brands={brands} onSuccess={handleSuccess} onCancel={handleSuccess} />
      </div>
    </div>
  );
}
