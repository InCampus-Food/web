import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/canteen": ["canteen"],
  "/order": ["customer"],
  "/profile": ["admin", "canteen", "customer"],
  "/checkout": ["customer"],
  "/track": ["customer"],
};

const roleHomeRedirect: Record<string, string> = {
  admin: "/admin",
  canteen: "/canteen",
  customer: "/order",
};

function getPayloadFromJWT(token: string) {
  try {
    const base64 = token.split(".")[1];
    const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicPage = pathname === "/" || pathname === "/about" || pathname === "/contact";

  if (!token && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    const payload = getPayloadFromJWT(token);
    const role = payload?.role ?? "customer";
    const redirectTo = roleHomeRedirect[role] ?? "/login";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (token) {
    const payload = getPayloadFromJWT(token);
    const role = payload?.role ?? "";

    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        const redirectTo = roleHomeRedirect[role] ?? "/login";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
