import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function PUT(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name } = await request.json() as { name?: string };

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const trimmed = name.trim();
    if (trimmed.length > 100) {
      return NextResponse.json({ error: "El nombre no puede superar los 100 caracteres" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { name: trimmed },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[UPDATE NAME]", error);
    return NextResponse.json({ error: "Error al actualizar el nombre" }, { status: 500 });
  }
}
