import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await prisma.product.findMany({
      where: {
        active: true,
        title: {
          contains: q.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        price: true,
      },
      take: 10,
      orderBy: {
        sold: "desc",
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
