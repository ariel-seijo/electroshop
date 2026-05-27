import { NextRequest, NextResponse } from "next/server";
import { verify } from "@node-rs/bcrypt";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { loginSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip, "login");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Por favor intentá de nuevo más tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const isValid = await verify(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const res = new NextResponse(
      JSON.stringify({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    await session.save();

    return res;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión. Intentá de nuevo" },
      { status: 500 }
    );
  }
}
