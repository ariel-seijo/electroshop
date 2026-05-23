import { NextRequest, NextResponse } from "next/server";
import { hash } from "@node-rs/bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token: string | undefined = body?.token;
    const password: string | undefined = body?.password;
    const confirmPassword: string | undefined = body?.confirmPassword;

    if (!token) {
      return NextResponse.json(
        { error: "Token de restablecimiento no proporcionado" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "La contraseña es obligatoria" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: {
        id: true,
        resetToken: true,
        resetTokenExpires: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "El token de restablecimiento es inválido o ya fue utilizado" },
        { status: 400 }
      );
    }

    if (!user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      return NextResponse.json(
        { error: "El token de restablecimiento ha expirado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json(
      { message: "Contraseña restablecida exitosamente. Ya podés iniciar sesión." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "Error al restablecer la contraseña. Intentá de nuevo" },
      { status: 500 }
    );
  }
}
