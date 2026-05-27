import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const results = await prisma.product.groupBy({
      by: ["brand"],
      orderBy: { brand: "asc" },
    });
    const brands = results.map((r) => r.brand);
    return NextResponse.json(brands);
  } catch (error) {
    console.error("[BRANDS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
