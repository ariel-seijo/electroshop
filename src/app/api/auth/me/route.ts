import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findFirst({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete(sessionOptions.cookieName);
      return response;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[AUTH ME ERROR]", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
