import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && ["PENDING", "PAID", "SHIPPED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            productTitle: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({ orders, stats });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (!["PENDING", "PAID", "SHIPPED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (existing.status === status) {
        throw new Error("El pedido ya tiene este estado");
      }

      const isCancelling = status === "CANCELLED" && existing.status !== "CANCELLED";

      if (isCancelling) {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: id },
          select: { productId: true, quantity: true },
        });

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity },
            },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status: status as import("@prisma/client").OrderStatus },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return updated;
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el pedido";

    if (message === "Pedido no encontrado") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
