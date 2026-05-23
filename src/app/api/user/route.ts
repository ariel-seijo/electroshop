import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const anonymousTag = `deleted_${now.getTime()}_${session.userId.slice(-8)}`;

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: "Usuario eliminado",
        email: `${anonymousTag}@deleted.local`,
        password: "DELETED",
        deletedAt: now,
        anonymizedAt: now,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    revalidateTag("admin-dashboard", "max");

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete(sessionOptions.cookieName);
    return response;
  } catch (error) {
    console.error("[DELETE ACCOUNT]", error);
    return NextResponse.json({ error: "Error al eliminar la cuenta" }, { status: 500 });
  }
}
