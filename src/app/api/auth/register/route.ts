import { NextRequest, NextResponse } from "next/server";
import { hash } from "@node-rs/bcrypt";
import { getIronSession } from "iron-session";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { registerSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip, "register");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Por favor intentá de nuevo más tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { password } = parsed.data;
    const name = parsed.data.name?.trim() || null;
    const email = parsed.data.email;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "CUSTOMER" },
      select: { id: true, name: true, email: true, role: true },
    });

    revalidateTag("admin-dashboard", "max");

    const res = new NextResponse(
      JSON.stringify({ user }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    await session.save();

    return res;
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta. Intentá de nuevo" },
      { status: 500 }
    );
  }
}
