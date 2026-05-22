import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/features/products/services/product.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;

  try {
    const id = parseInt(productId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await productService.getProductById(id);
    return NextResponse.json(product);
  } catch (error) {
    if ((error as Error).message === "Product not found") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("[API GET /products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;

  try {
    const id = parseInt(productId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const product = await productService.updateProduct(id, body);
    return NextResponse.json(product);
  } catch (error) {
    const message = (error as Error).message || "Failed to update product";

    if (message === "Product not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Slug already exists" || message === "SKU already exists") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (
      message.includes("must be greater than 0") ||
      message.includes("must be at least 0")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[API PUT /products/[id]]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;

  try {
    const id = parseInt(productId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await productService.deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    if ((error as Error).message === "Product not found") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("[API DELETE /products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
