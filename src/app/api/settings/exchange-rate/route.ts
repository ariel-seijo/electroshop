import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "site_settings" },
      update: {},
      create: { id: "site_settings", usdToArs: 1400 },
    });

    return NextResponse.json(
      { usdToArs: settings.usdToArs },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5",
        },
      }
    );
  } catch (error) {
    console.error("[EXCHANGE RATE GET]", error);
    return NextResponse.json(
      { usdToArs: 1400, error: "Error al obtener el tipo de cambio" },
      { status: 200 }
    );
  }
}
