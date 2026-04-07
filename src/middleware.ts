import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SECRET_KEY);

const ROLE_CONFIG = {
  admin: { home: "/admin", allowed: ["/admin", "/profile"] },
  canteen: { home: "/canteen", allowed: ["/canteen", "/profile"] },
  customer: { home: "/order", allowed: ["/order", "/profile", "/checkout", "/track"] },
} as const;

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log("Public route");
    return NextResponse.next()
  }

  if (!token) {
    if (AUTH_ROUTES.includes(pathname)) {
      console.log("Auth route");
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const role = (payload.role as keyof typeof ROLE_CONFIG) || "customer";
    const config = ROLE_CONFIG[role];

    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL(config.home, request.url));
    }

    const isAllowed = config.allowed.some(route => pathname.startsWith(route));

    if (!isAllowed) {
      if (pathname === config.home) return NextResponse.next();
      return NextResponse.redirect(new URL(config.home, request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.well-known).*)"],
};