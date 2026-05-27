import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip, "forgot-password");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" },
        { status: 200 }
      );
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" },
        { status: 200 }
      );
    }
    const normalizedEmail = parsed.data.email;

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    const origin = request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    await sendResetEmail(user.email, token, origin);

    return NextResponse.json(
      { message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]", error);
    return NextResponse.json(
      { message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" },
      { status: 200 }
    );
  }
}
