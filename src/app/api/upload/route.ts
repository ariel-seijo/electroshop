import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usá JPEG, PNG o WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo de 2MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const ext = MIME_TO_EXT[file.type] || "jpg";
    const fileName = `${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
