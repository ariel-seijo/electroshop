import { NextRequest, NextResponse } from "next/server";
import { getIronSession, IronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { invalidateExchangeRate } from "@/lib/utils/currency";

function guard(session: IronSession<SessionData>): NextResponse | null {
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    const err = guard(session);
    if (err) return err;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "site_settings" },
      update: {},
      create: { id: "site_settings", usdToArs: 1400 },
    });

    return NextResponse.json({ usdToArs: settings.usdToArs });
  } catch (error) {
    console.error("[ADMIN SETTINGS GET]", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    const err = guard(session);
    if (err) return err;

    const body = await request.json();
    const { usdToArs } = body as { usdToArs?: number | string | null };

    if (usdToArs === undefined || usdToArs === null || usdToArs === "") {
      return NextResponse.json(
        { error: "El valor del dólar es obligatorio" },
        { status: 400 }
      );
    }

    const numValue = Number(usdToArs);
    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json(
        { error: "El valor del dólar debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    const rounded = Math.round(numValue * 100) / 100;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "site_settings" },
      update: { usdToArs: rounded },
      create: { id: "site_settings", usdToArs: rounded },
    });

    invalidateExchangeRate(rounded);

    return NextResponse.json({ usdToArs: settings.usdToArs });
  } catch (error) {
    console.error("[ADMIN SETTINGS PUT]", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
