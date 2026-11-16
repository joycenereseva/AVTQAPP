import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseAuthCookies } from "@/lib/supabase/auth-session-cookie";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function middleware(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login?missing=supabase", request.url));
    }
    return NextResponse.next();
  }

  const hasSession = hasSupabaseAuthCookies(request.cookies.getAll(), url);

  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLogin = request.nextUrl.pathname.startsWith("/login");

  if (isAdmin && !hasSession) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirect);
  }

  if (isLogin && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};