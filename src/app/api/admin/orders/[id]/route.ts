import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            productTitle: true,
            productSku: true,
            productImage: true,
            productId: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[ADMIN ORDER BY ID ERROR]", error);
    return NextResponse.json(
      { error: "Error al obtener el pedido" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status) {
      return NextResponse.json(
        { error: "Falta el estado" },
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
