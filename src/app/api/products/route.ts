import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/features/products/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: Record<string, string | number | boolean | undefined> = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: searchParams.get("status") || undefined,
      featured: searchParams.get("featured") === "true" ? true : undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    };

    const result = await productService.getAllProducts(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API GET /products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await productService.createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[API POST /products]", error);

    const message = (error as Error).message || "Failed to create product";

    if (message.includes("Missing required fields")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.includes("must be greater than 0") || message.includes("must be at least 0")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message === "Category not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Slug already exists" || message === "SKU already exists") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
