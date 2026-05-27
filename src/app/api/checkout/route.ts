import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { generateOrderNumber } from "@/features/orders/lib/orderNumber";
import { usdToArs, loadExchangeRate } from "@/lib/utils/currency";
import { checkoutSchema, formatZodError } from "@/lib/validations";

function calculateShipping(subtotal: number): number {
  return usdToArs(subtotal) >= 50000 ? 0 : 1500;
}

export async function POST(request: NextRequest) {
  try {
    // Ensure exchange rate is loaded before calculating shipping cost
    await loadExchangeRate();

    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { items, shipping, paymentMethod, cardDetails, notes } = parsed.data;

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = calculateShipping(subtotal);
    const total = subtotal + shippingCost;

    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber(tx);

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { id: true, active: true, stock: true, title: true, price: true, sku: true, thumbnail: true },
        });

        if (!product) {
          throw new Error(`El producto "${item.title}" ya no existe`);
        }
        if (!product.active) {
          throw new Error(`El producto "${product.title}" no está disponible`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.title}". Disponible: ${product.stock}, solicitado: ${item.quantity}`
          );
        }
        if (product.price !== item.price) {
          throw new Error(
            `El precio de "${product.title}" ha cambiado. Por favor revisá tu carrito.`
          );
        }
      }

      for (const item of items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({
            where: { id: item.id },
            select: { title: true, stock: true },
          });
          throw new Error(
            `Stock insuficiente para "${product?.title ?? item.title}". Stock actual: ${product?.stock ?? "desconocido"}`
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          status: "PENDING",
          shippingAddress: shipping,
          paymentMethod,
          cardDetails: cardDetails
            ? ({
                last4: cardDetails.cardNumber?.slice(-4) || null,
                expiry: cardDetails.cardExpiry || null,
                holder: cardDetails.cardHolder || null,
              } satisfies Prisma.InputJsonValue)
            : undefined,
          subtotal,
          shippingCost,
          total,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
              productTitle: item.title,
              productSku: item.sku || "N/A",
              productImage: item.thumbnail || "",
            })),
          },
        },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return createdOrder;
    });

    revalidateTag("admin-dashboard", "max");

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al procesar el pedido";

    if (message.includes("Stock insuficiente") || message.includes("no existe") || message.includes("no está disponible") || message.includes("ha cambiado")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
