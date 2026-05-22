import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

interface SessionData {
  userId: string;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions);

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthPage && session.userId) {
    const destination = session.role === "ADMIN" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isAdminRoute) {
    if (!session.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (isAuthPage) {
    return NextResponse.next();
  }

  if (!session.userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/checkout/:path*",
    "/account/:path*",
    "/profile",
    "/orders/:path*",
    "/admin/:path*",
    "/dashboard",
  ],
};
